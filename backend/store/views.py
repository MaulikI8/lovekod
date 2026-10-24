import base64
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

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import Category, Product, SiteSettings, FestivalMoment, Testimonial, Order, OrderItem, Coupon, Customer

DEFAULT_CATEGORIES = [
    {'name': 'All Sets', 'slug': 'all', 'nepali_name': '', 'order': 1},
    {'name': 'Georgette Sets', 'slug': 'georgette', 'nepali_name': '', 'order': 2},
    {'name': 'Silk Blend', 'slug': 'silk', 'nepali_name': '', 'order': 3},
    {'name': '3-Piece Sets', 'slug': '3-piece', 'nepali_name': '', 'order': 4},
    {'name': 'Co-ord Sets', 'slug': 'co-ord', 'nepali_name': '', 'order': 5},
]

DEFAULT_KURTHAS = [
    {
        'product_id': 'lk-001',
        'name': 'Charcoal Embroidered Georgette Set',
        'nepali_name': '',
        'fabric_type': 'Georgette',
        'pieces': '3 Piece Set',
        'price': 2999,
        'original_price': 4999,
        'description': 'Elegant charcoal georgette kurtha set with intricate silver embroidery on neckline, sleeves, and hemline. Comes with matching palazzo pants and embroidered dupatta. Perfect for Tihar celebrations.',
        'image': '/images/kurtha-charcoal.jpg',
        'badge': 'Tihar Special',
        'is_featured': True,
        'stock_m': 5,
        'stock_l': 4,
        'stock_xl': 3,
        'stock_xxl': 2,
    },
    {
        'product_id': 'lk-002',
        'name': 'Rani Pink Silk Embroidered Set',
        'nepali_name': '',
        'fabric_type': 'Silk Blend',
        'pieces': '3 Piece Set',
        'price': 3499,
        'original_price': 5499,
        'description': 'Stunning rani pink silk kurtha adorned with delicate white thread embroidery and pearl detailing. Paired with matching straight pants and organza dupatta with scalloped borders.',
        'image': '/images/kurtha-rani-pink.png',
        'badge': 'Bestseller',
        'is_featured': True,
        'stock_m': 3,
        'stock_l': 5,
        'stock_xl': 2,
        'stock_xxl': 1,
    },
    {
        'product_id': 'lk-003',
        'name': 'Royal Red Festive Set with Gold Dupatta',
        'nepali_name': '',
        'fabric_type': 'Cotton Silk',
        'pieces': '3 Piece Set',
        'price': 2799,
        'original_price': 4499,
        'description': 'Classic red cotton silk kurtha with traditional zari embroidery at the neckline and borders. Comes with red palazzo pants and a luxurious golden brocade dupatta.',
        'image': '/images/kurtha-red-gold.png',
        'badge': 'Tihar Special',
        'is_featured': True,
        'stock_m': 6,
        'stock_l': 3,
        'stock_xl': 4,
        'stock_xxl': 3,
    },
    {
        'product_id': 'lk-004',
        'name': 'Olive Green Embroidered Georgette Set',
        'nepali_name': '',
        'fabric_type': 'Georgette',
        'pieces': '3 Piece Set',
        'price': 3199,
        'original_price': 4999,
        'description': 'Sophisticated olive green georgette kurtha with all-over floral embroidery in white thread. Includes matching slim pants and embroidered net dupatta with pearl accents.',
        'image': '/images/kurtha-olive-green.png',
        'badge': '',
        'is_featured': True,
        'stock_m': 4,
        'stock_l': 2,
        'stock_xl': 5,
        'stock_xxl': 3,
    },
    {
        'product_id': 'lk-005',
        'name': 'Sage Green Floral Co-ord Set',
        'nepali_name': '',
        'fabric_type': 'Linen Cotton',
        'pieces': '2 Piece Co-ord',
        'price': 2499,
        'original_price': 3999,
        'description': 'Modern sage green linen cotton co-ord set featuring a collared shirt-style kurtha with beautiful floral embroidery and wide-leg palazzo pants. Ideal for a fresh, contemporary festive look.',
        'image': '/images/kurtha-sage-coord.jpg',
        'badge': 'New Arrival',
        'is_featured': False,
        'stock_m': 2,
        'stock_l': 6,
        'stock_xl': 3,
        'stock_xxl': 0,
    },
]

DEFAULT_FESTIVAL_MOMENTS = [
    {
        'nepali_title': 'Kukur Tihar',
        'english_sub': 'Kukur Tihar',
        'tag': 'Guardians of Loyalty',
        'icon_key': 'kukur',
        'order': 1,
    },
    {
        'nepali_title': 'Laxmi Puja',
        'english_sub': 'Laxmi Puja',
        'tag': 'Welcoming Light & Prosperity',
        'icon_key': 'laxmi',
        'order': 2,
    },
    {
        'nepali_title': 'Mha Puja',
        'english_sub': 'Mha Puja • Nepal Sambat',
        'tag': 'Honoring the Divine Within',
        'icon_key': 'mha',
        'order': 3,
    },
    {
        'nepali_title': 'Bhai Tika',
        'english_sub': 'Bhai Tika',
        'tag': 'Seven-Color Tika & Makhamali',
        'icon_key': 'bhaitika',
        'order': 4,
    },
    {
        'nepali_title': 'Gai Tihar',
        'english_sub': 'Gai Tihar',
        'tag': 'Sacred Reverence',
        'icon_key': 'gai',
        'order': 5,
    },
]

DEFAULT_TESTIMONIALS = [
    {
        'customer_name': 'Prashna Shrestha',
        'location': 'Jhamsikhel, Lalitpur',
        'initials': 'PS',
        'quote': 'The charcoal georgette set is hands down the most regal kurtha I have ever worn for Laxmi Puja. The silver threadwork glistens beautifully in diya light. Ordered from Lalitpur and it arrived in 36 hours.',
        'rating': 5,
        'order': 1,
    },
    {
        'customer_name': 'Anushree Rana',
        'location': 'Baluwatar, Kathmandu',
        'initials': 'AR',
        'quote': 'I was hesitant about ordering online before Bhai Tika, but customer care on WhatsApp verified the measurements within 10 minutes. The fit across the shoulders and the palazzo fall is perfection. Dhanyabad LoveKod team!',
        'rating': 5,
        'order': 2,
    },
    {
        'customer_name': 'Smriti Gurung',
        'location': 'Lakeside, Pokhara',
        'initials': 'SG',
        'quote': 'Paid through eSewa and package reached our home in Pokhara in pristine condition. The fabric feels light as air even after 8 hours of family celebration.',
        'rating': 5,
        'order': 3,
    },
]


def ensure_initial_seed():
    """Ensure site settings and default superuser exist. Never auto-repopulates dummy catalog items."""
    if SiteSettings.objects.count() == 0:
        SiteSettings.objects.create()

    # Ensure a default superuser always exists if database is wiped or fresh
    from django.contrib.auth.models import User
    if not User.objects.filter(is_superuser=True).exists():
        User.objects.create_superuser('admin', 'admin@lovekod.com', 'lovekod2026')


def health_check(request):
    ensure_initial_seed()
    return JsonResponse({
        'status': 'ok',
        'service': 'LoveKod Django Backend',
        'festival': 'Tihar 2083',
        'productsCount': Product.objects.count(),
        'categoriesCount': Category.objects.count(),
        'testimonialsCount': Testimonial.objects.count(),
        'ordersCount': Order.objects.count(),
    })


# ══════════════════════════════════════════════════════════════════════════════
# SITE SETTINGS API (Hero, Announcement, Concierge Contacts, Story)
# ══════════════════════════════════════════════════════════════════════════════

@csrf_exempt
def site_settings_detail_update(request):
    ensure_initial_seed()
    settings_obj = SiteSettings.objects.first()
    if not settings_obj:
        settings_obj = SiteSettings.objects.create()

    if request.method == 'GET':
        return JsonResponse(settings_obj.to_dict())

    elif request.method in ['PATCH', 'PUT', 'POST']:
        try:
            data = json.loads(request.body.decode('utf-8'))
            mapping = {
                'announcementNepali': 'announcement_nepali',
                'announcementText': 'announcement_text',
                'freeShippingThreshold': 'free_shipping_threshold',
                'contactPhone': 'contact_phone',
                'contactWhatsapp': 'contact_whatsapp',
                'contactEmail': 'contact_email',
                'contactAddress': 'contact_address',
                'heroBadgeNepali': 'hero_badge_nepali',
                'heroBadgeText': 'hero_badge_text',
                'heroTitleLine1': 'hero_title_line1',
                'heroTitleAccent': 'hero_title_accent',
                'heroSubtitle': 'hero_subtitle',
                'heroWatermark': 'hero_watermark',
                'heroImage': 'hero_image',
                'heroTrustItem1': 'hero_trust_item_1',
                'heroTrustItem2': 'hero_trust_item_2',
                'heroTrustItem3': 'hero_trust_item_3',
                'spotlightBadge': 'spotlight_badge',
                'spotlightTitle': 'spotlight_title',
                'spotlightNepali': 'spotlight_nepali',
                'spotlightDesc': 'spotlight_desc',
                'spotlightProductId': 'spotlight_product_id',
                'storyTag': 'story_tag',
                'storyTitle': 'story_title',
                'storyP1': 'story_p1',
                'storyP2': 'story_p2',
                'storyQuote': 'story_quote',
                'storyQuoteAuthor': 'story_quote_author',
                'diyasLitCount': 'diyas_lit_count',
                'saleCountdownEnabled': 'sale_countdown_enabled',
                'saleCountdownTitle': 'sale_countdown_title',
                'saleCountdownSubtitle': 'sale_countdown_subtitle',
                'saleCountdownTargetDate': 'sale_countdown_target_date',
                'saleCountdownCtaText': 'sale_countdown_cta_text',
                'saleCountdownCtaLink': 'sale_countdown_cta_link',
                'heroHotspots': 'hero_hotspots',
                'lookbookEyebrow': 'lookbook_eyebrow',
                'lookbookTitle': 'lookbook_title',
                'lookbookSubtitle': 'lookbook_subtitle',
                'socialHandle': 'social_handle',
                'socialInstagram': 'social_instagram',
                'socialTiktok': 'social_tiktok',
                'socialFacebook': 'social_facebook',
                'websiteUrl': 'website_url',
            }
            for json_key, model_field in mapping.items():
                if json_key in data:
                    val = data[json_key]
                    if 'threshold' in model_field or 'count' in model_field:
                        val = int(val)
                    setattr(settings_obj, model_field, val)

            settings_obj.save()
            return JsonResponse(settings_obj.to_dict())
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


# ══════════════════════════════════════════════════════════════════════════════
# CATEGORIES API
# ══════════════════════════════════════════════════════════════════════════════

@csrf_exempt
def category_list_create(request):
    ensure_initial_seed()

    if request.method == 'GET':
        include_deleted = request.GET.get('include_deleted') == 'true'
        categories = Category.objects.all().order_by('order', 'id')
        if not include_deleted:
            categories = categories.filter(is_deleted=False)
        return JsonResponse([c.to_dict() for c in categories], safe=False)

    elif request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            name = data.get('name', '').strip()
            slug = data.get('slug', '').strip() or name.lower().replace(' ', '-')
            category = Category.objects.create(
                name=name,
                slug=slug,
                nepali_name=data.get('nepaliName', ''),
                order=int(data.get('order', Category.objects.count() + 1)),
                is_active=bool(data.get('isActive', True)),
            )
            return JsonResponse(category.to_dict(), status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def category_detail_update_delete(request, category_id):
    category = get_object_or_404(Category, id=category_id)

    if request.method == 'GET':
        return JsonResponse(category.to_dict())

    elif request.method in ['PATCH', 'PUT']:
        try:
            data = json.loads(request.body.decode('utf-8'))
            if 'name' in data: category.name = data['name']
            if 'slug' in data: category.slug = data['slug']
            if 'nepaliName' in data: category.nepali_name = data['nepaliName']
            if 'order' in data: category.order = int(data['order'])
            if 'isActive' in data: category.is_active = bool(data['isActive'])
            category.save()
            return JsonResponse(category.to_dict())
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    elif request.method == 'DELETE':
        hard = request.GET.get('hard') == 'true' or request.GET.get('permanent') == 'true'
        if hard:
            category.delete()
            return JsonResponse({'success': True, 'hard_deleted': category_id})
        else:
            category.is_deleted = True
            category.save(update_fields=['is_deleted'])
            return JsonResponse({'success': True, 'soft_deleted': category_id})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


# ══════════════════════════════════════════════════════════════════════════════
# FESTIVAL MOMENTS MARQUEE API
# ══════════════════════════════════════════════════════════════════════════════

@csrf_exempt
def festival_moment_list_create(request):
    ensure_initial_seed()

    if request.method == 'GET':
        moments = FestivalMoment.objects.filter(is_deleted=False, is_active=True).order_by('order', 'id')
        return JsonResponse([m.to_dict() for m in moments], safe=False)

    elif request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            moment = FestivalMoment.objects.create(
                nepali_title=data.get('nepaliTitle', ''),
                english_sub=data.get('englishSub', ''),
                tag=data.get('tag', ''),
                icon_key=data.get('iconKey', 'kukur'),
                order=int(data.get('order', FestivalMoment.objects.count() + 1)),
                is_active=bool(data.get('isActive', True)),
            )
            return JsonResponse(moment.to_dict(), status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def festival_moment_detail_update_delete(request, moment_id):
    moment = get_object_or_404(FestivalMoment, id=moment_id)

    if request.method == 'GET':
        return JsonResponse(moment.to_dict())

    elif request.method in ['PATCH', 'PUT']:
        try:
            data = json.loads(request.body.decode('utf-8'))
            if 'nepaliTitle' in data: moment.nepali_title = data['nepaliTitle']
            if 'englishSub' in data: moment.english_sub = data['englishSub']
            if 'tag' in data: moment.tag = data['tag']
            if 'iconKey' in data: moment.icon_key = data['iconKey']
            if 'order' in data: moment.order = int(data['order'])
            if 'isActive' in data: moment.is_active = bool(data['isActive'])
            moment.save()
            return JsonResponse(moment.to_dict())
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    elif request.method == 'DELETE':
        hard = request.GET.get('hard') == 'true' or request.GET.get('permanent') == 'true'
        if hard:
            moment.delete()
            return JsonResponse({'success': True, 'hard_deleted': moment_id})
        else:
            moment.is_deleted = True
            moment.save(update_fields=['is_deleted'])
            return JsonResponse({'success': True, 'soft_deleted': moment_id})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


# ══════════════════════════════════════════════════════════════════════════════
# TESTIMONIALS / REVIEWS API
# ══════════════════════════════════════════════════════════════════════════════

@csrf_exempt
def testimonial_list_create(request):
    ensure_initial_seed()

    if request.method == 'GET':
        items = Testimonial.objects.filter(is_deleted=False, is_active=True).order_by('order', 'id')
        return JsonResponse([t.to_dict() for t in items], safe=False)

    elif request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            t = Testimonial.objects.create(
                customer_name=data.get('name', 'Customer'),
                location=data.get('location', 'Nepal'),
                initials=data.get('initials', ''),
                quote=data.get('quote', ''),
                rating=int(data.get('rating', 5)),
                order=int(data.get('order', Testimonial.objects.count() + 1)),
                is_active=bool(data.get('isActive', True)),
            )
            return JsonResponse(t.to_dict(), status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def testimonial_detail_update_delete(request, testimonial_id):
    t = get_object_or_404(Testimonial, id=testimonial_id)

    if request.method == 'GET':
        return JsonResponse(t.to_dict())

    elif request.method in ['PATCH', 'PUT']:
        try:
            data = json.loads(request.body.decode('utf-8'))
            if 'name' in data: t.customer_name = data['name']
            if 'location' in data: t.location = data['location']
            if 'initials' in data: t.initials = data['initials']
            if 'quote' in data: t.quote = data['quote']
            if 'rating' in data: t.rating = int(data['rating'])
            if 'order' in data: t.order = int(data['order'])
            if 'isActive' in data: t.is_active = bool(data['isActive'])
            t.save()
            return JsonResponse(t.to_dict())
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    elif request.method == 'DELETE':
        hard = request.GET.get('hard') == 'true' or request.GET.get('permanent') == 'true'
        if hard:
            t.delete()
            return JsonResponse({'success': True, 'hard_deleted': testimonial_id})
        else:
            t.is_deleted = True
            t.save(update_fields=['is_deleted'])
            return JsonResponse({'success': True, 'soft_deleted': testimonial_id})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


# ══════════════════════════════════════════════════════════════════════════════
# PRODUCTS API
# ══════════════════════════════════════════════════════════════════════════════

@csrf_exempt
def product_list_create(request):
    ensure_initial_seed()

    if request.method == 'GET':
        category_slug = request.GET.get('category')
        include_deleted = request.GET.get('include_deleted') == 'true'
        products = Product.objects.all().order_by('id')
        if not include_deleted:
            products = products.filter(is_deleted=False)
        if category_slug and category_slug != 'all':
            # Support filtering by slug, category name or fabric match
            cat = Category.objects.filter(slug=category_slug).first()
            if cat:
                products = products.filter(category=cat)
            else:
                products = products.filter(category__slug=category_slug)
        return JsonResponse([p.to_dict() for p in products], safe=False)

    elif request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            pid = data.get('id')
            if not pid or pid.startswith('lk-'):
                pid = f"prod_{int(time.time())}_{uuid.uuid4().hex[:6]}"

            raw_image = data.get('image') or data.get('imagePreview') or '/images/kurtha-charcoal.jpg'
            image_path = save_base64_image(raw_image)

            sizes = data.get('sizes', {})
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
                description=data.get('description', ''),
                image=image_path,
                badge=data.get('badge', ''),
                is_featured=bool(data.get('isFeatured', False)),
                enable_variants=bool(data.get('enableVariants', False)),
                custom_sizes=custom_sizes,
                colors=colors_str,
                sizes=sizes_str,
                quantity=inv,
                status=data.get('status', 'active').lower(),
                stock_m=int(sizes.get('M', 5)) if isinstance(sizes, dict) else 5,
                stock_l=int(sizes.get('L', 5)) if isinstance(sizes, dict) else 5,
                stock_xl=int(sizes.get('XL', 5)) if isinstance(sizes, dict) else 5,
                stock_xxl=int(sizes.get('XXL', 5)) if isinstance(sizes, dict) else 5,
            )
            return JsonResponse(product.to_dict(), status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def product_detail_update_delete(request, product_id):
    product = get_object_or_404(Product, product_id=product_id)

    if request.method == 'GET':
        return JsonResponse(product.to_dict())

    elif request.method in ['PATCH', 'PUT']:
        try:
            data = json.loads(request.body.decode('utf-8'))
            if 'name' in data: product.name = data['name']
            if 'nepaliName' in data: product.nepali_name = data['nepaliName']
            if 'fabricType' in data: product.fabric_type = data['fabricType']
            if 'pieces' in data: product.pieces = data['pieces']
            if 'price' in data: product.price = int(data['price'])
            if 'originalPrice' in data: product.original_price = int(data['originalPrice'])
            if 'description' in data: product.description = data['description']
            if 'badge' in data: product.badge = data['badge']
            if 'image' in data and data['image']:
                product.image = save_base64_image(data['image'])
            if 'isFeatured' in data: product.is_featured = bool(data['isFeatured'])
            if 'enableVariants' in data: product.enable_variants = bool(data['enableVariants'])
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
            if 'categoryId' in data:
                product.category = Category.objects.filter(id=data['categoryId']).first()

            # Sizes
            if 'sizes' in data and isinstance(data['sizes'], dict):
                sizes = data['sizes']
                if 'M' in sizes: product.stock_m = max(0, int(sizes['M']))
                if 'L' in sizes: product.stock_l = max(0, int(sizes['L']))
                if 'XL' in sizes: product.stock_xl = max(0, int(sizes['XL']))
                if 'XXL' in sizes: product.stock_xxl = max(0, int(sizes['XXL']))

            product.save()
            return JsonResponse(product.to_dict())
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    elif request.method == 'DELETE':
        hard = request.GET.get('hard') == 'true' or request.GET.get('permanent') == 'true'
        if hard:
            product.delete()
            return JsonResponse({'success': True, 'hard_deleted': product_id})
        else:
            product.is_deleted = True
            product.save(update_fields=['is_deleted'])
            return JsonResponse({'success': True, 'soft_deleted': product_id})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def reset_products_inventory(request):
    if request.method == 'POST':
        Product.objects.all().delete()
        ensure_initial_seed()
        products = Product.objects.all().order_by('id')
        return JsonResponse({'success': True, 'products': [p.to_dict() for p in products]})
    return JsonResponse({'error': 'Method not allowed'}, status=405)


# ══════════════════════════════════════════════════════════════════════════════
# ORDERS API
# ══════════════════════════════════════════════════════════════════════════════

@csrf_exempt
def order_list_create(request):
    if request.method == 'GET':
        include_deleted = request.GET.get('include_deleted') == 'true'
        orders = Order.objects.all().order_by('-created_at')
        if not include_deleted:
            orders = orders.filter(is_deleted=False)
        return JsonResponse([o.to_dict() for o in orders], safe=False)

    elif request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            customer = data.get('customer', {})
            # Allow flat fields as fallback if submitted without nested customer dict
            c_name = customer.get('fullName') or customer.get('name') or data.get('customerName') or data.get('customer_name') or 'Customer'
            c_phone = customer.get('phone') or data.get('phone') or ''
            c_whatsapp = customer.get('whatsapp') or data.get('whatsapp') or c_phone
            c_district = customer.get('district') or data.get('district') or 'Kathmandu'
            c_city = customer.get('city') or data.get('city') or 'Kathmandu'
            c_address = customer.get('address') or data.get('address') or ''
            c_note = customer.get('note') or data.get('note') or ''
            c_email = customer.get('email') or data.get('email') or ''
            c_payment = customer.get('paymentMethod') or data.get('paymentMethod') or data.get('payment_method') or 'COD'
            channel = data.get('channel') or data.get('label') or 'Website'

            items = data.get('items', [])
            total = int(data.get('total', 0))
            coupon_code = (data.get('couponCode') or data.get('coupon_code') or '').strip().upper()
            discount_amount = int(data.get('discountAmount') or data.get('discount_amount') or 0)
            order_id = (data.get('id') or data.get('order_id') or '').strip()
            # If order_id not explicitly set or is a client timestamp string, auto-generate sequential ORD-1001, etc.
            if not order_id or (order_id.startswith('ORD-') and len(order_id) > 10):
                order_id = ""

            p_status = data.get('payment_status') or data.get('paymentStatus') or 'Unpaid'
            order = Order.objects.create(
                order_id=order_id,
                customer_name=c_name,
                phone=c_phone,
                email=c_email,
                whatsapp=c_whatsapp,
                channel=channel,
                district=c_district,
                city=c_city,
                address=c_address,
                note=c_note,
                payment_method=c_payment,
                total=total,
                coupon_code=coupon_code,
                discount_amount=discount_amount,
                status=data.get('status', 'Pending'),
                payment_status=p_status,
            )
            if c_phone:
                try:
                    cust = Customer.objects.filter(phone=c_phone, is_deleted=False).first()
                    if not cust:
                        cust = Customer.objects.create(
                            name=c_name,
                            phone=c_phone,
                            email=c_email,
                            whatsapp=c_whatsapp or c_phone,
                            district=c_district,
                            city=c_city,
                            address=c_address,
                        )
                    order.customer = cust
                    order.save(update_fields=['customer'])
                except Exception as cust_err:
                    pass

            if coupon_code:
                c_obj = Coupon.objects.filter(code=coupon_code, is_deleted=False).first()
                if c_obj:
                    c_obj.used_count += 1
                    c_obj.save(update_fields=['used_count'])

            calc_items_total = 0
            for item in items:
                pid = item.get('productId') or item.get('product_id') or ''
                size = item.get('size', 'M')
                qty = int(item.get('quantity', 1))
                price = int(item.get('price', 0))
                calc_items_total += price * qty
                img = item.get('image', '')

                # If name or price empty and pid present, resolve from Product
                item_name = item.get('name', '')
                if pid:
                    p = Product.objects.filter(product_id=pid).first()
                    if p:
                        if not item_name: item_name = p.name
                        if not price: price = p.price
                        if not img: img = p.image.url if p.image and not str(p.image).startswith('/') else (str(p.image) if p.image else '/images/kurtha-charcoal.jpg')

                if not item_name: item_name = 'Kurtha Set'
                if not img: img = '/images/kurtha-charcoal.jpg'

                order_item = OrderItem.objects.create(
                    order=order,
                    product_id=pid,
                    name=item_name,
                    size=size,
                    quantity=qty,
                    price=price,
                    image=img,
                )
                order_item.deduct_inventory()

            if order.total == 0 and calc_items_total > 0:
                order.total = calc_items_total
                order.save(update_fields=['total'])

            return JsonResponse(order.to_dict(), status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def order_detail_update(request, order_id):
    order = get_object_or_404(Order, order_id=order_id)

    if request.method == 'GET':
        return JsonResponse(order.to_dict())

    elif request.method in ['PATCH', 'PUT']:
        try:
            data = json.loads(request.body.decode('utf-8'))
            update_fields = []
            if 'payment_status' in data or 'paymentStatus' in data:
                order.payment_status = data.get('payment_status') or data.get('paymentStatus')
                update_fields.append('payment_status')
            if 'status' in data:
                old_status = order.status
                new_status = data['status']
                order.status = new_status
                update_fields.append('status')
                if new_status == 'Cancelled' and old_status != 'Cancelled':
                    for item in order.items.all():
                        item.restore_inventory()
                elif old_status == 'Cancelled' and new_status != 'Cancelled':
                    for item in order.items.all():
                        item.deduct_inventory()
            if update_fields:
                order.save(update_fields=update_fields)
                if new_status == 'Cancelled' and old_status != 'Cancelled':
                    for item in order.items.all():
                        item.restore_inventory()
                elif old_status == 'Cancelled' and new_status != 'Cancelled':
                    for item in order.items.all():
                        item.deduct_inventory()
            return JsonResponse(order.to_dict())
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    elif request.method == 'DELETE':
        hard = request.GET.get('hard') == 'true' or request.GET.get('permanent') == 'true'
        for item in order.items.all():
            item.restore_inventory()
        if hard:
            order.delete()
            return JsonResponse({'success': True, 'hard_deleted': order_id})
        else:
            order.is_deleted = True
            order.save(update_fields=['is_deleted'])
            return JsonResponse({'success': True, 'soft_deleted': order_id})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def admin_login_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            passcode = data.get('password', '')
            if passcode == 'lovekod2026':
                return JsonResponse({'success': True, 'token': 'lovekod-session-token-2083'})
            return JsonResponse({'success': False, 'error': 'Invalid admin passcode'}, status=401)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def coupon_validate(request):
    """Validate coupon code against order subtotal and return discount amount."""
    code = ''
    subtotal = 0
    if request.method == 'GET':
        code = request.GET.get('code', '').strip().upper()
        try:
            subtotal = int(request.GET.get('subtotal', 0))
        except (ValueError, TypeError):
            subtotal = 0
    elif request.method == 'POST':
        try:
            body = json.loads(request.body.decode('utf-8'))
            code = (body.get('code') or '').strip().upper()
            subtotal = int(body.get('subtotal') or 0)
        except Exception:
            return JsonResponse({'valid': False, 'message': 'Invalid request body.'}, status=400)
    else:
        return JsonResponse({'valid': False, 'message': 'Method not allowed.'}, status=405)

    if not code:
        return JsonResponse({'valid': False, 'message': 'Please enter a coupon code.'}, status=400)

    coupon = Coupon.objects.filter(code=code, is_deleted=False).first()
    if not coupon:
        return JsonResponse({'valid': False, 'message': f"Coupon '{code}' does not exist."}, status=404)

    is_valid, reason = coupon.is_valid(subtotal)
    if not is_valid:
        return JsonResponse({'valid': False, 'message': reason}, status=400)

    discount = coupon.calculate_discount(subtotal)
    new_total = max(0, subtotal - discount)

    return JsonResponse({
        'valid': True,
        'code': coupon.code,
        'description': coupon.description,
        'discountType': coupon.discount_type,
        'discountValue': coupon.discount_value,
        'discountAmount': discount,
        'newTotal': new_total,
        'message': f"Coupon '{coupon.code}' applied! Saved Rs. {discount:,}",
    })


def coupon_list(request):
    """Return list of active public coupons for promotion banners."""
    coupons = Coupon.objects.filter(is_deleted=False, is_active=True).order_by('-created_at')
    return JsonResponse([c.to_dict() for c in coupons], safe=False)


# ══════════════════════════════════════════════════════════════════════════════
# CUSTOMERS API
# ══════════════════════════════════════════════════════════════════════════════

@csrf_exempt
def customer_list_create(request):
    if request.method == 'GET':
        search = (request.GET.get('search') or request.GET.get('q') or '').strip().lower()
        include_deleted = request.GET.get('include_deleted') == 'true'
        customers = Customer.objects.all().order_by('-total_spent', '-created_at')
        if not include_deleted:
            customers = customers.filter(is_deleted=False)

        if search:
            from django.db.models import Q
            customers = customers.filter(
                Q(phone__icontains=search) |
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(district__icontains=search) |
                Q(city__icontains=search)
            )

        return JsonResponse([c.to_dict() for c in customers], safe=False)

    elif request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            phone = (data.get('phone') or '').strip()
            if not phone:
                return JsonResponse({'error': 'Mobile phone number is required as the primary key.'}, status=400)

            name = (data.get('name') or data.get('fullName') or 'Valued Customer').strip()
            email = (data.get('email') or '').strip()
            whatsapp = (data.get('whatsapp') or phone).strip()
            district = (data.get('district') or 'Kathmandu').strip()
            city = (data.get('city') or 'Kathmandu').strip()
            address = (data.get('address') or '').strip()
            note = (data.get('note') or '').strip()

            customer, created = Customer.objects.get_or_create(
                phone=phone,
                defaults={
                    'name': name,
                    'email': email,
                    'whatsapp': whatsapp,
                    'district': district,
                    'city': city,
                    'address': address,
                    'note': note,
                }
            )

            if not created:
                if name and name != 'Valued Customer': customer.name = name
                if email: customer.email = email
                if whatsapp: customer.whatsapp = whatsapp
                if district: customer.district = district
                if city: customer.city = city
                if address: customer.address = address
                if note: customer.note = note
                customer.save()

            customer.update_stats()
            return JsonResponse(customer.to_dict(), status=201 if created else 200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def customer_lookup(request):
    """Fast customer lookup by phone number for live checkout or admin auto-fill."""
    if request.method == 'GET':
        raw_phone = (request.GET.get('phone') or '').strip()
        clean = ''.join(filter(lambda ch: ch.isdigit() or ch == '+', raw_phone)).strip()
        if not clean:
            return JsonResponse({'exists': False, 'customer': None})

        # Match exact phone or matching without leading zeros / 977
        cust = Customer.objects.filter(phone=clean).first()
        if not cust and clean.startswith('977') and len(clean) > 3:
            cust = Customer.objects.filter(phone=clean[3:]).first()
        if not cust and clean.startswith('+977') and len(clean) > 4:
            cust = Customer.objects.filter(phone=clean[4:]).first()
        if not cust and len(clean) >= 10:
            cust = Customer.objects.filter(phone__icontains=clean).first()

        if cust:
            return JsonResponse({'exists': True, 'customer': cust.to_dict()})
        return JsonResponse({'exists': False, 'customer': None})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def customer_detail_update_delete(request, phone):
    clean_phone = (phone or '').strip()
    cust = get_object_or_404(Customer, phone=clean_phone)

    if request.method == 'GET':
        orders = cust.orders.filter(is_deleted=False).order_by('-created_at')
        return JsonResponse({
            'customer': cust.to_dict(),
            'orders': [o.to_dict() for o in orders]
        })

    elif request.method in ['PATCH', 'PUT']:
        try:
            data = json.loads(request.body.decode('utf-8'))
            if 'name' in data: cust.name = data['name'].strip()
            if 'email' in data: cust.email = data['email'].strip()
            if 'whatsapp' in data: cust.whatsapp = data['whatsapp'].strip()
            if 'district' in data: cust.district = data['district'].strip()
            if 'city' in data: cust.city = data['city'].strip()
            if 'address' in data: cust.address = data['address'].strip()
            if 'note' in data: cust.note = data['note'].strip()
            if 'isDeleted' in data: cust.is_deleted = bool(data['isDeleted'])
            cust.save()
            cust.update_stats()
            return JsonResponse(cust.to_dict())
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    elif request.method == 'DELETE':
        hard = request.GET.get('hard') == 'true' or request.GET.get('permanent') == 'true'
        if hard:
            cust.delete()
            return JsonResponse({'success': True, 'hard_deleted': clean_phone})
        else:
            cust.is_deleted = True
            cust.save(update_fields=['is_deleted'])
            return JsonResponse({'success': True, 'soft_deleted': clean_phone})

    return JsonResponse({'error': 'Method not allowed'}, status=405)
