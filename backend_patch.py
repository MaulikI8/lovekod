import re
import os

views_path = '/home8/aashutos/backend/store/views.py'
models_path = '/home8/aashutos/backend/store/models.py'

# 1. Update models.py to_dict()
with open(models_path, 'r') as f:
    m_code = f.read()

to_dict_old = """    def to_dict(self):
        return {
            'id': self.product_id,"""

to_dict_new = """    def to_dict(self):
        cs = self.custom_sizes if isinstance(self.custom_sizes, dict) else {}
        comb_rows = cs.get('combinationRows', []) if isinstance(cs, dict) else []
        single_p = cs.get('singlePricing', {}) if isinstance(cs, dict) else {}
        return {
            'id': self.product_id,
            'combinationRows': comb_rows,
            'singlePricing': single_p,
            'variantColors': [c.strip() for c in self.colors.split(',') if c.strip()] if self.colors else [],
            'variantSizes': [s.strip() for s in self.sizes.split(',') if s.strip()] if self.sizes else [],
            'inventory': self.quantity if self.quantity else self.total_stock(),"""

if to_dict_old in m_code:
    m_code = m_code.replace(to_dict_old, to_dict_new, 1)
    with open(models_path, 'w') as f:
        f.write(m_code)
    print('Updated models.py to_dict() successfully!')
else:
    print('to_dict_old not matched in models.py (may already be updated)')

# 2. Update views.py
with open(views_path, 'r') as f:
    v_code = f.read()

base64_fn = """import base64
import uuid
import os
import time

def save_base64_image(data_str):
    if not data_str or not isinstance(data_str, str):
        return '/images/kurtha-charcoal.jpg'
    if not data_str.startswith('data:image/'):
        return data_str
    try:
        header, encoded = data_str.split(';base64,', 1)
        ext = 'jpg'
        if 'png' in header: ext = 'png'
        elif 'webp' in header: ext = 'webp'
        elif 'jpeg' in header: ext = 'jpg'
        
        filename = f"prod_{uuid.uuid4().hex[:12]}.{ext}"
        dirs = [
            '/home8/aashutos/lovekod.com/media/products',
            '/home8/aashutos/public_html/media/products',
            '/home8/aashutos/backend/media/products'
        ]
        file_bytes = base64.b64decode(encoded)
        for d in dirs:
            os.makedirs(d, exist_ok=True)
            with open(os.path.join(d, filename), 'wb') as f:
                f.write(file_bytes)
        return f"/media/products/{filename}"
    except Exception as e:
        print("Base64 save error:", e)
        return '/images/kurtha-charcoal.jpg'
"""

if 'def save_base64_image' not in v_code:
    v_code = base64_fn + '\n' + v_code

prod_create_pattern = re.compile(r'elif request\.method == \'POST\':\s+try:\s+data = json\.loads\(request\.body\.decode\(\'utf-8\'\)\).*?return JsonResponse\(product\.to_dict\(\), status=201\)\s+except Exception as e:\s+return JsonResponse\({\'error\': str\(e\)\}, status=400\)', re.DOTALL)

new_prod_create = """elif request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            pid = data.get('id')
            if not pid or pid.startswith('lk-'):
                pid = f"prod_{int(time.time())}_{uuid.uuid4().hex[:6]}"

            raw_image = data.get('image') or data.get('imagePreview') or '/images/kurtha-charcoal.jpg'
            image_path = save_base64_image(raw_image)

            sizes = data.get('sizes') or {}
            combination_rows = data.get('combinationRows', [])
            single_pricing = data.get('singlePricing', {})
            custom_sizes = {
                'combinationRows': combination_rows,
                'singlePricing': single_pricing,
                'sizes': sizes if isinstance(sizes, dict) else {}
            }

            category = None
            if 'categoryId' in data and data['categoryId']:
                category = Category.objects.filter(id=data['categoryId']).first()

            var_colors = data.get('variantColors', [])
            colors_str = ','.join(var_colors) if isinstance(var_colors, list) else str(data.get('colors', ''))
            var_sizes = data.get('variantSizes', [])
            sizes_str = ','.join(var_sizes) if isinstance(var_sizes, list) else str(data.get('sizes', ''))

            inv = 0
            if combination_rows:
                inv = sum(int(r.get('quantity', 0) or 0) for r in combination_rows)
            else:
                inv = int(data.get('inventory', 0) or single_pricing.get('quantity', 0) or 0)

            product = Product.objects.create(
                product_id=pid,
                category=category,
                name=data.get('name', 'Festive Kurtha'),
                nepali_name=data.get('nepaliName', ''),
                fabric_type=data.get('fabricType', 'Georgette'),
                pieces=data.get('pieces', '3 Piece Set'),
                price=int(data.get('price', 2999)),
                original_price=int(data.get('originalPrice', 4499)),
                description=data.get('description') or data.get('shortDescription', ''),
                image=image_path,
                badge=data.get('badge', ''),
                is_featured=bool(data.get('isFeatured', False)),
                enable_variants=bool(data.get('enableVariants', False)),
                custom_sizes=custom_sizes,
                colors=colors_str,
                sizes=sizes_str,
                quantity=inv,
                status=data.get('status', 'active').lower(),
            )
            return JsonResponse(product.to_dict(), status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)"""

if prod_create_pattern.search(v_code):
    v_code = prod_create_pattern.sub(new_prod_create, v_code, count=1)
    print('Replaced product_list_create POST block in views.py!')
else:
    print('prod_create_pattern not matched in views.py')

update_pattern = re.compile(r'elif request\.method in \[\'PATCH\', \'PUT\'\]:\s+try:\s+data = json\.loads\(request\.body\.decode\(\'utf-8\'\)\).*?product\.save\(\)\s+return JsonResponse\(product\.to_dict\(\)\)\s+except Exception as e:\s+return JsonResponse\({\'error\': str\(e\)\}, status=400\)', re.DOTALL)

new_update = """elif request.method in ['PATCH', 'PUT']:
        try:
            data = json.loads(request.body.decode('utf-8'))
            if 'name' in data: product.name = data['name']
            if 'price' in data: product.price = int(data['price'])
            if 'originalPrice' in data: product.original_price = int(data['originalPrice'])
            if 'description' in data: product.description = data['description']
            if 'image' in data and data['image']:
                product.image = save_base64_image(data['image'])
            if 'enableVariants' in data:
                product.enable_variants = bool(data['enableVariants'])
            if 'combinationRows' in data or 'singlePricing' in data:
                cs = product.custom_sizes if isinstance(product.custom_sizes, dict) else {}
                if 'combinationRows' in data: cs['combinationRows'] = data['combinationRows']
                if 'singlePricing' in data: cs['singlePricing'] = data['singlePricing']
                product.custom_sizes = cs
            if 'variantColors' in data and isinstance(data['variantColors'], list):
                product.colors = ','.join(data['variantColors'])
            if 'variantSizes' in data and isinstance(data['variantSizes'], list):
                product.sizes = ','.join(data['variantSizes'])
            if 'inventory' in data:
                product.quantity = int(data['inventory'])
            if 'status' in data:
                product.status = str(data['status']).lower()
            product.save()
            return JsonResponse(product.to_dict())
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)"""

if update_pattern.search(v_code):
    v_code = update_pattern.sub(new_update, v_code, count=1)
    print('Replaced update block in views.py!')
else:
    print('update_pattern not matched in views.py')

with open(views_path, 'w') as f:
    f.write(v_code)

print('Updated views.py successfully!')
