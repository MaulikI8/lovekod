import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import Category, Product, SiteSettings, FestivalMoment, Testimonial, Order, OrderItem

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
            products = products.filter(category__slug=category_slug)
        return JsonResponse([p.to_dict() for p in products], safe=False)

    elif request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            pid = data.get('id') or f"lk-{Product.objects.count() + 1:03d}"
            sizes = data.get('sizes', {})

            category = None
            if 'categoryId' in data and data['categoryId']:
                category = Category.objects.filter(id=data['categoryId']).first()

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
                image=data.get('image', '/images/kurtha-charcoal.jpg'),
                badge=data.get('badge', ''),
                is_featured=bool(data.get('isFeatured', False)),
                stock_m=int(sizes.get('M', 5)),
                stock_l=int(sizes.get('L', 5)),
                stock_xl=int(sizes.get('XL', 5)),
                stock_xxl=int(sizes.get('XXL', 5)),
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
            if 'image' in data: product.image = data['image']
            if 'isFeatured' in data: product.is_featured = bool(data['isFeatured'])
            if 'categoryId' in data:
                product.category = Category.objects.filter(id=data['categoryId']).first()

            # Sizes
            if 'sizes' in data:
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
            c_payment = customer.get('paymentMethod') or data.get('paymentMethod') or data.get('payment_method') or 'COD'

            items = data.get('items', [])
            total = int(data.get('total', 0))
            order_id = data.get('id')
            if not order_id:
                import time, random
                order_id = f"ORD-{int(time.time()*1000):X}{random.randint(10, 99)}"

            order = Order.objects.create(
                order_id=order_id,
                customer_name=c_name,
                phone=c_phone,
                whatsapp=c_whatsapp,
                district=c_district,
                city=c_city,
                address=c_address,
                note=c_note,
                payment_method=c_payment,
                total=total,
                status=data.get('status', 'Pending'),
            )

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
            if 'status' in data:
                old_status = order.status
                new_status = data['status']
                order.status = new_status
                order.save(update_fields=['status'])
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
