from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    nepali_name = models.CharField(max_length=100, blank=True, default='')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name_plural = 'Categories'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'nepaliName': self.nepali_name,
            'order': self.order,
            'isActive': self.is_active,
        }

    def __str__(self):
        return self.name


class Product(models.Model):
    product_id = models.CharField(max_length=50, unique=True, db_index=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    name = models.CharField(max_length=255)
    nepali_name = models.CharField(max_length=255, blank=True, default='')
    fabric_type = models.CharField(max_length=100, default='Georgette')
    pieces = models.CharField(max_length=100, default='3 Piece Set')
    price = models.IntegerField(default=2999)
    original_price = models.IntegerField(null=True, blank=True, default=4999)
    description = models.TextField(blank=True, default='')
    image = models.CharField(max_length=255, default='/images/kurtha-charcoal.jpg')
    badge = models.CharField(max_length=100, blank=True, default='')
    is_featured = models.BooleanField(default=False)

    # Per-size inventory tracking
    stock_m = models.IntegerField(default=5)
    stock_l = models.IntegerField(default=5)
    stock_xl = models.IntegerField(default=5)
    stock_xxl = models.IntegerField(default=5)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def total_stock(self):
        return self.stock_m + self.stock_l + self.stock_xl + self.stock_xxl

    def to_dict(self):
        return {
            'id': self.product_id,
            'categoryId': self.category_id,
            'categoryName': self.category.name if self.category else '',
            'name': self.name,
            'nepaliName': self.nepali_name,
            'fabricType': self.fabric_type,
            'pieces': self.pieces,
            'price': self.price,
            'originalPrice': self.original_price,
            'description': self.description,
            'image': self.image,
            'badge': self.badge,
            'isFeatured': self.is_featured,
            'sizes': {
                'M': self.stock_m,
                'L': self.stock_l,
                'XL': self.stock_xl,
                'XXL': self.stock_xxl,
            }
        }

    def __str__(self):
        return f"{self.name} ({self.product_id}) - Rs. {self.price}"


class SiteSettings(models.Model):
    # Announcement Bar
    announcement_nepali = models.CharField(max_length=255, default='TIHAR FESTIVE EDIT')
    announcement_text = models.CharField(
        max_length=255,
        default='Free Delivery on Orders Above Rs. 3,000 Across Nepal'
    )
    free_shipping_threshold = models.IntegerField(default=3000)

    # Contact & Storefront Info
    contact_phone = models.CharField(max_length=50, default='+977 9800000000')
    contact_whatsapp = models.CharField(max_length=50, default='+977 9800000000')
    contact_email = models.CharField(max_length=100, default='concierge@lovekod.com')
    contact_address = models.CharField(max_length=255, default='Kathmandu Valley, Nepal')

    # Hero Section Content
    hero_badge_nepali = models.CharField(max_length=100, default='Tihar 2083')
    hero_badge_text = models.CharField(max_length=100, default='Tihar Festive Edit')
    hero_title_line1 = models.CharField(max_length=255, default='Draped in Light,')
    hero_title_accent = models.CharField(max_length=255, default='Crafted for Celebration')
    hero_subtitle = models.TextField(
        default='Intricately embroidered georgettes, pure chanderi silks, and regal zari borders. Consciously curated for Laxmi Puja, Bhai Tika, and cherished gatherings across Nepal.'
    )
    hero_watermark = models.CharField(max_length=100, default='LOVEKOD')
    hero_image = models.CharField(max_length=255, default='/images/hero-banner.jpg')

    # Hero Trust Pills
    hero_trust_item_1 = models.CharField(max_length=100, default='Free Nepal Delivery > Rs. 3,000')
    hero_trust_item_2 = models.CharField(max_length=100, default='Pure Georgette & Silk')
    hero_trust_item_3 = models.CharField(max_length=100, default='Ready for Bhai Tika')

    # Spotlight Highlight Section
    spotlight_badge = models.CharField(max_length=100, default='Signature Tihar Set')
    spotlight_title = models.CharField(max_length=255, default='Charcoal Embroidered Georgette Set')
    spotlight_nepali = models.CharField(max_length=255, default='Signature Georgette Set')
    spotlight_desc = models.TextField(
        default='Cut from gossamer georgette with silver zari needlework framing the neckline, scalloped palazzo cuffs, and a translucent dupatta that catches the warm amber glow of every diya.'
    )
    spotlight_product_id = models.CharField(max_length=50, default='lk-001')

    # Our Story & Craftsmanship
    story_tag = models.CharField(max_length=100, default='Our Story • The LoveKod Ethos')
    story_title = models.CharField(max_length=255, default='Rooted in the Valley, Lit for the Nation')
    story_p1 = models.TextField(
        default='LoveKod was born out of a simple observation: Nepali women deserve festive attire that looks regal under the evening lights of Tihar without sacrificing comfort during day-long Bhai Tika ceremonies.'
    )
    story_p2 = models.TextField(
        default='We work exclusively with small batches of pure georgette, tissue chanderi, and silk blends. Each garment is measured against Nepali standard fits with generous seam allowances, so you can celebrate without worries.'
    )
    story_quote = models.TextField(
        default='When you welcome Laxmi into your home, let your attire celebrate both tradition and modern ease.'
    )
    story_quote_author = models.CharField(max_length=100, default='The LoveKod Studio, Kathmandu')

    # Interactive Diya Counter baseline
    diyas_lit_count = models.PositiveIntegerField(default=108)

    # Festive Sale Countdown (Hidden by default, configurable in Admin)
    sale_countdown_enabled = models.BooleanField(
        default=False,
        help_text="Enable or disable the sale countdown timer banner on the storefront."
    )
    sale_countdown_title = models.CharField(
        max_length=255,
        default='Flash Sale • Tihar Festive Drop',
        help_text="Header for the sale timer banner (e.g. Bhai Tika Flash Sale, Midnight Drop)."
    )
    sale_countdown_subtitle = models.TextField(
        default='Limited batch festive kurtha sets with hand zari needlework. Offer valid while stocks last.',
        help_text="Detailed note or sale terms."
    )
    sale_countdown_target_date = models.CharField(
        max_length=50,
        default='2026-11-10T23:59:59',
        help_text="Target expiration timestamp (YYYY-MM-DDTHH:MM:SS)."
    )
    sale_countdown_cta_text = models.CharField(
        max_length=100,
        default='Shop the Flash Sale',
        help_text="Button text for the sale banner."
    )
    sale_countdown_cta_link = models.CharField(
        max_length=255,
        default='#collection',
        help_text="Link destination (e.g. #collection, /collection, or /occasions)."
    )

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Site Settings'

    def to_dict(self):
        return {
            'announcementNepali': self.announcement_nepali,
            'announcementText': self.announcement_text,
            'freeShippingThreshold': self.free_shipping_threshold,
            'contactPhone': self.contact_phone,
            'contactWhatsapp': self.contact_whatsapp,
            'contactEmail': self.contact_email,
            'contactAddress': self.contact_address,
            'heroBadgeNepali': self.hero_badge_nepali,
            'heroBadgeText': self.hero_badge_text,
            'heroTitleLine1': self.hero_title_line1,
            'heroTitleAccent': self.hero_title_accent,
            'heroSubtitle': self.hero_subtitle,
            'heroWatermark': self.hero_watermark,
            'heroImage': self.hero_image,
            'heroTrustItem1': self.hero_trust_item_1,
            'heroTrustItem2': self.hero_trust_item_2,
            'heroTrustItem3': self.hero_trust_item_3,
            'spotlightBadge': self.spotlight_badge,
            'spotlightTitle': self.spotlight_title,
            'spotlightNepali': self.spotlight_nepali,
            'spotlightDesc': self.spotlight_desc,
            'spotlightProductId': self.spotlight_product_id,
            'storyTag': self.story_tag,
            'storyTitle': self.story_title,
            'storyP1': self.story_p1,
            'storyP2': self.story_p2,
            'storyQuote': self.story_quote,
            'storyQuoteAuthor': self.story_quote_author,
            'diyasLitCount': self.diyas_lit_count,
            'saleCountdownEnabled': self.sale_countdown_enabled,
            'saleCountdownTitle': self.sale_countdown_title,
            'saleCountdownSubtitle': self.sale_countdown_subtitle,
            'saleCountdownTargetDate': self.sale_countdown_target_date,
            'saleCountdownCtaText': self.sale_countdown_cta_text,
            'saleCountdownCtaLink': self.sale_countdown_cta_link,
        }

    def __str__(self):
        return "Global Site Settings"


class FestivalMoment(models.Model):
    nepali_title = models.CharField(max_length=150)
    english_sub = models.CharField(max_length=150)
    tag = models.CharField(max_length=200)
    icon_key = models.CharField(
        max_length=50,
        default='kukur',
        choices=[
            ('kukur', 'Kukur Tihar (Dog / Loyalty)'),
            ('gai', 'Gai Tihar (Cow / Prosperity)'),
            ('laxmi', 'Laxmi Puja (Diya / Wealth)'),
            ('mha', 'Mha Puja (Soul Reverence)'),
            ('bhaitika', 'Bhai Tika (Seven Color Tika)'),
        ]
    )
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name_plural = 'Festival Moments'

    def to_dict(self):
        return {
            'id': self.id,
            'nepaliTitle': self.nepali_title,
            'englishSub': self.english_sub,
            'tag': self.tag,
            'iconKey': self.icon_key,
            'order': self.order,
            'isActive': self.is_active,
        }

    def __str__(self):
        return f"{self.nepali_title} ({self.english_sub})"


class Testimonial(models.Model):
    customer_name = models.CharField(max_length=150)
    location = models.CharField(max_length=150)
    initials = models.CharField(max_length=10, blank=True, default='')
    quote = models.TextField()
    rating = models.PositiveSmallIntegerField(default=5)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name_plural = 'Customer Testimonials'

    def save(self, *args, **kwargs):
        if not self.initials and self.customer_name:
            parts = self.customer_name.strip().split()
            self.initials = ''.join([p[0].upper() for p in parts[:2]])
        super().save(*args, **kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.customer_name,
            'location': self.location,
            'initials': self.initials,
            'quote': self.quote,
            'rating': self.rating,
            'order': self.order,
            'isActive': self.is_active,
        }

    def __str__(self):
        return f"{self.customer_name} ({self.location})"


class Order(models.Model):
    order_id = models.CharField(max_length=50, unique=True, db_index=True)
    customer_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    whatsapp = models.CharField(max_length=50, blank=True, default='')
    district = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    address = models.TextField()
    note = models.TextField(blank=True, default='')
    payment_method = models.CharField(max_length=50, default='COD')
    total = models.IntegerField(default=0)
    status = models.CharField(
        max_length=50,
        default='Pending',
        choices=[
            ('Pending', 'Pending'),
            ('Confirmed', 'Confirmed'),
            ('Shipped', 'Shipped'),
            ('Delivered', 'Delivered'),
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def to_dict(self):
        return {
            'id': self.order_id,
            'customer': {
                'fullName': self.customer_name,
                'phone': self.phone,
                'whatsapp': self.whatsapp or self.phone,
                'district': self.district,
                'city': self.city,
                'address': self.address,
                'note': self.note,
                'paymentMethod': self.payment_method,
            },
            'items': [item.to_dict() for item in self.items.all()],
            'total': self.total,
            'status': self.status,
            'createdAt': self.created_at.isoformat(),
        }

    def __str__(self):
        return f"Order {self.order_id} - {self.customer_name} (Rs. {self.total})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product_id = models.CharField(max_length=50)
    name = models.CharField(max_length=255)
    size = models.CharField(max_length=10)
    quantity = models.PositiveIntegerField(default=1)
    price = models.IntegerField(default=0)
    image = models.CharField(max_length=255, blank=True, default='')

    def to_dict(self):
        return {
            'productId': self.product_id,
            'name': self.name,
            'size': self.size,
            'quantity': self.quantity,
            'price': self.price,
            'image': self.image,
        }

    def __str__(self):
        return f"{self.name} ({self.size} x {self.quantity})"
