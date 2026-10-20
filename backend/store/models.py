from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    nepali_name = models.CharField(max_length=100, blank=True, default='')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False, db_index=True, help_text="Soft delete flag")
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
            'isDeleted': self.is_deleted,
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
    image = models.ImageField(
        upload_to='',
        blank=True,
        null=True,
        help_text="Upload outfit photo directly from your device (JPG, PNG, WebP)"
    )
    badge = models.CharField(max_length=100, blank=True, default='')
    is_featured = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20,
        choices=[('active', 'Active'), ('draft', 'Draft'), ('archived', 'Archived')],
        default='active',
        help_text="Product visibility status"
    )
    rating = models.FloatField(default=0.0, help_text="Average rating (e.g. 5.0)")
    reviews_count = models.PositiveIntegerField(default=0, help_text="Number of customer reviews")
    is_deleted = models.BooleanField(default=False, db_index=True, help_text="Soft delete flag")

    # Customizable inventory tracking across boutique sizes
    stock_xs = models.IntegerField(default=0, help_text="XS Size stock")
    stock_s = models.IntegerField(default=0, help_text="S Size stock")
    stock_m = models.IntegerField(default=5, help_text="M Size stock")
    stock_l = models.IntegerField(default=5, help_text="L Size stock")
    stock_xl = models.IntegerField(default=5, help_text="XL Size stock")
    stock_xxl = models.IntegerField(default=5, help_text="XXL Size stock")
    stock_xxxl = models.IntegerField(default=0, help_text="XXXL / 3XL Size stock")
    stock_free = models.IntegerField(default=0, help_text="Free Size stock")
    custom_sizes = models.JSONField(default=dict, blank=True, help_text='Additional custom sizes in JSON (e.g. {"4XL": 3, "Custom": 1})')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_image_url(self):
        if self.image:
            try:
                url = self.image.url
                if url:
                    return url
            except Exception:
                pass
            name = str(self.image)
            if name.startswith('http') or name.startswith('/'):
                return name
            return f'/media/{name}'
        return '/images/kurtha-charcoal.jpg'

    def get_sizes_dict(self):
        result = {}
        all_sizes = [
            ('XS', self.stock_xs),
            ('S', self.stock_s),
            ('M', self.stock_m),
            ('L', self.stock_l),
            ('XL', self.stock_xl),
            ('XXL', self.stock_xxl),
            ('XXXL', self.stock_xxxl),
            ('Free Size', self.stock_free),
        ]
        if isinstance(self.custom_sizes, dict):
            for sz, qty in self.custom_sizes.items():
                try:
                    result[str(sz)] = int(qty)
                except (ValueError, TypeError):
                    pass

        for name, qty in all_sizes:
            if qty > 0 or name in ['M', 'L', 'XL', 'XXL', 'XXXL']:
                result[name] = qty or 0
        return result

    def total_stock(self):
        tot = (
            (self.stock_xs or 0) +
            (self.stock_s or 0) +
            (self.stock_m or 0) +
            (self.stock_l or 0) +
            (self.stock_xl or 0) +
            (self.stock_xxl or 0) +
            (self.stock_xxxl or 0) +
            (self.stock_free or 0)
        )
        if isinstance(self.custom_sizes, dict):
            for v in self.custom_sizes.values():
                try:
                    tot += int(v)
                except (ValueError, TypeError):
                    pass
        return tot

    def to_dict(self):
        return {
            'id': self.product_id,
            'categoryId': self.category_id,
            'categoryName': self.category.name if self.category else '',
            'name': self.name,
            'fabricType': self.fabric_type,
            'pieces': self.pieces,
            'price': self.price,
            'originalPrice': self.original_price,
            'description': self.description,
            'image': self.get_image_url(),
            'badge': self.badge,
            'isFeatured': self.is_featured,
            'isDeleted': self.is_deleted,
            'status': self.status,
            'rating': self.rating,
            'reviewsCount': self.reviews_count,
            'sizes': self.get_sizes_dict(),
        }

    def __str__(self):
        return f"{self.name} ({self.product_id}) - Rs. {self.price}"


class SiteSettings(models.Model):
    # Announcement Bar
    announcement_nepali = models.CharField(max_length=255, default='TIHAR FESTIVE EDIT')
    announcement_text = models.CharField(
        max_length=255,
        default='Delivering Across All 77 Districts of Nepal for Tihar 2083'
    )
    free_shipping_threshold = models.IntegerField(default=3000)

    # Contact & Storefront Info
    contact_phone = models.CharField(max_length=50, default='+977 9719567133')
    contact_whatsapp = models.CharField(max_length=50, default='+977 9719567133')
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
    hero_trust_item_1 = models.CharField(max_length=100, default='Delivering Across All 77 Districts')
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
    lookbook_eyebrow = models.CharField(
        max_length=150,
        default='Curated 3D Collection Showcase',
        help_text="Eyebrow tag above the 3D lookbook carousel."
    )
    lookbook_title = models.CharField(
        max_length=200,
        default='Festive Lookbook Showcase',
        help_text="Main heading for the 3D lookbook carousel."
    )
    lookbook_subtitle = models.CharField(
        max_length=255,
        default='Spin through our authentic hand-embroidered Tihar kurthas',
        help_text="Subheading description for the 3D lookbook carousel."
    )

    # Dynamic Craftsmanship Hotspots on Hero Outfit
    hero_hotspots = models.JSONField(
        default=list,
        blank=True,
        help_text="Dynamic craftsmanship hotspots list with id, label, note, x, y, productSlug"
    )

    # Social Media & Footer Links
    social_handle = models.CharField(
        max_length=100,
        default="@lovekod.np",
        help_text="Social handle shown across footer (e.g. @lovekod.np)"
    )
    social_instagram = models.CharField(
        max_length=255,
        default="https://instagram.com/lovekod.np",
        help_text="Full Instagram profile link"
    )
    social_tiktok = models.CharField(
        max_length=255,
        default="https://tiktok.com/@lovekod.np",
        help_text="Full TikTok profile link"
    )
    social_facebook = models.CharField(
        max_length=255,
        default="https://facebook.com/lovekod.np",
        help_text="Full Facebook page link"
    )
    website_url = models.CharField(
        max_length=255,
        default="https://www.lovekod.com",
        help_text="Storefront website URL"
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
            'lookbookEyebrow': self.lookbook_eyebrow,
            'lookbookTitle': self.lookbook_title,
            'lookbookSubtitle': self.lookbook_subtitle,
            'socialHandle': self.social_handle,
            'socialInstagram': self.social_instagram,
            'socialTiktok': self.social_tiktok,
            'socialFacebook': self.social_facebook,
            'websiteUrl': self.website_url,
            'heroHotspots': self.hero_hotspots if self.hero_hotspots else [],
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
    is_deleted = models.BooleanField(default=False, db_index=True, help_text="Soft delete flag")

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
            'isDeleted': self.is_deleted,
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
    is_deleted = models.BooleanField(default=False, db_index=True, help_text="Soft delete flag")
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
            'isDeleted': self.is_deleted,
        }

    def __str__(self):
        return f"{self.customer_name} ({self.location})"


class Order(models.Model):
    order_id = models.CharField(max_length=50, unique=True, db_index=True, blank=True)
    customer_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    whatsapp = models.CharField(max_length=50, blank=True, default='')
    district = models.CharField(max_length=100, default='Kathmandu')
    city = models.CharField(max_length=100, blank=True, default='Kathmandu')
    address = models.TextField()
    note = models.TextField(blank=True, default='')
    payment_method = models.CharField(
        max_length=50,
        default='COD',
        choices=[
            ('COD', 'Cash on Delivery'),
            ('DynamicQR', 'Dynamic QR Pay'),
        ]
    )
    total = models.IntegerField(default=0)
    coupon_code = models.CharField(max_length=50, blank=True, default='')
    discount_amount = models.IntegerField(default=0)
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
    is_deleted = models.BooleanField(default=False, db_index=True, help_text="Soft delete flag")
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.order_id:
            import time, random
            self.order_id = f"ORD-{int(time.time()*1000):X}{random.randint(10, 99)}"
        super().save(*args, **kwargs)

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
            'couponCode': self.coupon_code,
            'discountAmount': self.discount_amount,
            'status': self.status,
            'isDeleted': self.is_deleted,
            'createdAt': self.created_at.isoformat(),
        }

    def __str__(self):
        return f"Order {self.order_id} - {self.customer_name} (Rs. {self.total})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product_id = models.CharField(max_length=50, blank=True, default='')
    name = models.CharField(max_length=255)
    size = models.CharField(max_length=50, default='M')
    quantity = models.PositiveIntegerField(default=1)
    price = models.IntegerField(default=0)
    image = models.CharField(max_length=255, blank=True, default='/images/kurtha-charcoal.jpg')
    stock_deducted = models.BooleanField(default=False, help_text="Whether this item has deducted product inventory")

    def deduct_inventory(self):
        """Deduct size-specific inventory from the associated product."""
        if not self.stock_deducted and self.product_id:
            p = Product.objects.filter(product_id=self.product_id).first()
            if p:
                sz = (self.size or 'M').strip().upper()
                qty = max(1, int(self.quantity or 1))
                if 'XXXL' in sz or '3XL' in sz:
                    p.stock_xxxl = max(0, (p.stock_xxxl or 0) - qty)
                elif 'XXL' in sz or '2XL' in sz:
                    p.stock_xxl = max(0, (p.stock_xxl or 0) - qty)
                elif 'XL' in sz:
                    p.stock_xl = max(0, (p.stock_xl or 0) - qty)
                elif 'L' in sz:
                    p.stock_l = max(0, (p.stock_l or 0) - qty)
                elif 'XS' in sz:
                    p.stock_xs = max(0, (p.stock_xs or 0) - qty)
                elif 'S' in sz:
                    p.stock_s = max(0, (p.stock_s or 0) - qty)
                elif 'FREE' in sz:
                    p.stock_free = max(0, (p.stock_free or 0) - qty)
                elif isinstance(p.custom_sizes, dict) and sz in p.custom_sizes:
                    p.custom_sizes[sz] = max(0, int(p.custom_sizes[sz]) - qty)
                else:
                    p.stock_m = max(0, (p.stock_m or 0) - qty)
                p.save()
                self.stock_deducted = True
                self.save(update_fields=['stock_deducted'])

    def restore_inventory(self):
        """Restore size-specific inventory to the associated product on cancel/trash."""
        if self.stock_deducted and self.product_id:
            p = Product.objects.filter(product_id=self.product_id).first()
            if p:
                sz = (self.size or 'M').strip().upper()
                qty = max(1, int(self.quantity or 1))
                if 'XXXL' in sz or '3XL' in sz:
                    p.stock_xxxl = (p.stock_xxxl or 0) + qty
                elif 'XXL' in sz or '2XL' in sz:
                    p.stock_xxl = (p.stock_xxl or 0) + qty
                elif 'XL' in sz:
                    p.stock_xl = (p.stock_xl or 0) + qty
                elif 'L' in sz:
                    p.stock_l = (p.stock_l or 0) + qty
                elif 'XS' in sz:
                    p.stock_xs = (p.stock_xs or 0) + qty
                elif 'S' in sz:
                    p.stock_s = (p.stock_s or 0) + qty
                elif 'FREE' in sz:
                    p.stock_free = (p.stock_free or 0) + qty
                elif isinstance(p.custom_sizes, dict) and sz in p.custom_sizes:
                    p.custom_sizes[sz] = int(p.custom_sizes[sz]) + qty
                else:
                    p.stock_m = (p.stock_m or 0) + qty
                p.save()
                self.stock_deducted = False
                self.save(update_fields=['stock_deducted'])

    def save(self, *args, **kwargs):
        if self.product_id:
            p = Product.objects.filter(product_id=self.product_id).first()
            if p:
                if not self.name or self.name == 'Kurtha':
                    self.name = p.name
                if not self.price:
                    self.price = p.price
                if not self.image or self.image == '/images/kurtha-charcoal.jpg':
                    self.image = p.image.url if p.image and not str(p.image).startswith('/') else (str(p.image) if p.image else '/images/kurtha-charcoal.jpg')
        super().save(*args, **kwargs)

    def to_dict(self):
        return {
            'productId': self.product_id,
            'name': self.name,
            'size': self.size,
            'quantity': self.quantity,
            'price': self.price,
            'image': (f'/images/{self.image.name}' if self.image and not str(self.image).startswith('/') else (str(self.image) if self.image else '/images/kurtha-charcoal.jpg')),
        }

    def __str__(self):
        return f"{self.name} ({self.size} x {self.quantity})"


class Coupon(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Percentage (%)'),
        ('fixed', 'Flat Amount (Rs)'),
    ]
    code = models.CharField(max_length=50, unique=True, db_index=True, help_text="Coupon code in UPPERCASE (e.g. FESTIVE10, LOVEKOD500)")
    description = models.CharField(max_length=255, blank=True, default='')
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES, default='percentage')
    discount_value = models.PositiveIntegerField(default=10, help_text="Percentage discount (e.g. 10) or Flat Rs amount (e.g. 500)")
    min_purchase_amount = models.PositiveIntegerField(default=0, help_text="Minimum order subtotal needed in Rs (0 for no minimum)")
    max_discount_amount = models.PositiveIntegerField(null=True, blank=True, help_text="Maximum discount cap in Rs for percentage discounts (optional)")
    usage_limit = models.PositiveIntegerField(null=True, blank=True, help_text="Total times this coupon can be used across all orders (blank for unlimited)")
    used_count = models.PositiveIntegerField(default=0, help_text="Number of times redeemed")
    is_active = models.BooleanField(default=True, help_text="Enable or disable this coupon")
    valid_from = models.DateTimeField(null=True, blank=True, help_text="Coupon valid starting date/time (optional)")
    valid_until = models.DateTimeField(null=True, blank=True, help_text="Coupon expiration date/time (optional)")
    is_deleted = models.BooleanField(default=False, db_index=True, help_text="Soft delete flag")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Discount Coupon'
        verbose_name_plural = 'Discount Coupons'

    def save(self, *args, **kwargs):
        if self.code:
            self.code = self.code.strip().upper()
        super().save(*args, **kwargs)

    def is_valid(self, subtotal=0):
        from django.utils import timezone
        now = timezone.now()
        if not self.is_active or self.is_deleted:
            return False, "This coupon is currently inactive."
        if self.valid_from and now < self.valid_from:
            return False, "This coupon promotion has not started yet."
        if self.valid_until and now > self.valid_until:
            return False, "This coupon has expired."
        if self.usage_limit is not None and self.used_count >= self.usage_limit:
            return False, "This coupon has reached its maximum usage limit."
        if subtotal < self.min_purchase_amount:
            return False, f"Minimum order amount of Rs. {self.min_purchase_amount:,} required to use this coupon."
        return True, "Coupon is valid."

    def calculate_discount(self, subtotal):
        if self.discount_type == 'percentage':
            discount = (subtotal * self.discount_value) // 100
            if self.max_discount_amount:
                discount = min(discount, self.max_discount_amount)
        else:
            discount = min(self.discount_value, subtotal)
        return max(0, int(discount))

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'description': self.description,
            'discountType': self.discount_type,
            'discountValue': self.discount_value,
            'minPurchaseAmount': self.min_purchase_amount,
            'maxDiscountAmount': self.max_discount_amount,
            'usageLimit': self.usage_limit,
            'usedCount': self.used_count,
            'isActive': self.is_active,
            'validUntil': self.valid_until.isoformat() if self.valid_until else None,
        }

    def __str__(self):
        val = f"{self.discount_value}%" if self.discount_type == 'percentage' else f"Rs. {self.discount_value}"
        return f"{self.code} ({val} OFF)"
