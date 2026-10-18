from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline
from .models import Category, Product, SiteSettings, FestivalMoment, Testimonial, Order, OrderItem

admin.site.site_header = "LoveKod Boutique Administration"
admin.site.site_title = "LoveKod Admin"
admin.site.index_title = "Storefront Control Center"


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ('name', 'nepali_name', 'slug', 'order', 'is_active')
    list_editable = ('order', 'is_active')
    search_fields = ('name', 'nepali_name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


class OrderItemInline(TabularInline):
    model = OrderItem
    extra = 1
    fields = ('product_id', 'name', 'size', 'quantity', 'price')


@admin.register(Product)
class ProductAdmin(ModelAdmin):
    list_display = (
        'image_preview',
        'name',
        'product_id',
        'category',
        'fabric_type',
        'price',
        'original_price',
        'total_stock',
        'badge',
        'is_featured'
    )
    list_filter = ('category', 'fabric_type', 'is_featured')
    search_fields = ('name', 'nepali_name', 'product_id', 'fabric_type')
    list_editable = ('category', 'price', 'badge', 'is_featured')
    readonly_fields = ('image_display',)

    fieldsets = (
        ('Garment Identification', {
            'fields': (
                ('product_id', 'category'),
                ('name', 'nepali_name'),
                ('fabric_type', 'pieces'),
            )
        }),
        ('Product Imagery (Upload from Computer)', {
            'fields': (
                'image',
                'image_display',
            ),
            'description': 'Choose an image file directly from your computer to replace or set the product photo.'
        }),
        ('Pricing & Curation Badges', {
            'fields': (
                ('price', 'original_price'),
                ('badge', 'is_featured'),
                'description',
            )
        }),
        ('Inventory by Size (Units)', {
            'fields': (
                ('stock_m', 'stock_l'),
                ('stock_xl', 'stock_xxl'),
            )
        }),
    )

    def image_preview(self, obj):
        img_url = obj.image.url if obj.image else '/images/kurtha-charcoal.jpg'
        if not img_url.startswith('/'):
            img_url = f'/images/{img_url}'
        return format_html(
            '<img src="{}" style="width: 48px; height: 58px; object-fit: cover; border-radius: 4px; border: 1px solid rgba(138,90,77,0.2);" />',
            img_url
        )
    image_preview.short_description = "Photo"

    def image_display(self, obj):
        if obj.image:
            img_url = obj.image.url if not str(obj.image).startswith('/') else str(obj.image)
            return format_html(
                '<div style="margin-top: 8px;"><img src="{}" style="max-width: 240px; max-height: 320px; object-fit: cover; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" /></div>',
                img_url
            )
        return "No image uploaded yet"
    image_display.short_description = "Current Preview"


@admin.register(SiteSettings)
class SiteSettingsAdmin(ModelAdmin):
    fieldsets = (
        ('Announcement Bar & Shipping', {
            'fields': ('announcement_nepali', 'announcement_text', 'free_shipping_threshold')
        }),
        ('Storefront Contact Concierge', {
            'fields': ('contact_phone', 'contact_whatsapp', 'contact_email', 'contact_address')
        }),
        ('Hero Section', {
            'fields': (
                'hero_badge_nepali',
                'hero_badge_text',
                'hero_title_line1',
                'hero_title_accent',
                'hero_subtitle',
                'hero_watermark',
                'hero_image',
                'hero_trust_item_1',
                'hero_trust_item_2',
                'hero_trust_item_3'
            )
        }),
        ('Spotlight Signature Showcase', {
            'fields': (
                'spotlight_badge',
                'spotlight_title',
                'spotlight_nepali',
                'spotlight_desc',
                'spotlight_product_id'
            )
        }),

        ('Festive Sale Countdown Timer (Default: Invisible)', {
            'fields': (
                'sale_countdown_enabled',
                'sale_countdown_title',
                'sale_countdown_subtitle',
                'sale_countdown_target_date',
                'sale_countdown_cta_text',
                'sale_countdown_cta_link',
            ),
            'description': 'Control the live festive countdown banner on the storefront. Leave disabled for normal days.'
        }),
        ('3D Lookbook Showcase Settings', {
            'fields': (
                'lookbook_eyebrow',
                'lookbook_title',
                'lookbook_subtitle',
            ),
            'description': 'Customize the 3D rotating ring carousel section title and headings on the home page.'
        }),
        ('Social Channels & Footer Links', {
            'fields': (
                'social_handle',
                'social_instagram',
                'social_tiktok',
                'social_facebook',
                'website_url',
            ),
            'description': 'Customize the social media links, handles, and official domain displayed in the footer.'
        }),
    )

    def has_add_permission(self, request):
        return SiteSettings.objects.count() == 0


# FestivalMomentAdmin removed (section deprecated from storefront)


@admin.register(Testimonial)
class TestimonialAdmin(ModelAdmin):
    list_display = ('customer_name', 'location', 'rating', 'order', 'is_active')
    list_editable = ('rating', 'order', 'is_active')
    search_fields = ('customer_name', 'location', 'quote')


@admin.register(Order)
class OrderAdmin(ModelAdmin):
    list_display = (
        'order_id',
        'customer_name',
        'phone',
        'district',
        'payment_method',
        'total_display',
        'status',
        'whatsapp_chat_action',
        'created_at',
    )
    list_filter = ('status', 'district', 'payment_method', 'created_at')
    search_fields = ('order_id', 'customer_name', 'phone', 'whatsapp', 'district', 'city', 'address')
    list_editable = ('status',)
    inlines = [OrderItemInline]
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

    fieldsets = (
        ('Order Identification & Status', {
            'fields': (
                ('order_id', 'status'),
                ('payment_method', 'total'),
            ),
            'description': 'Leave Order ID empty to auto-generate (e.g. ORD-190A...). Set Total to 0 to auto-sum from line items.'
        }),
        ('Customer Contact Information', {
            'fields': (
                'customer_name',
                ('phone', 'whatsapp'),
            )
        }),
        ('Delivery Destination in Nepal', {
            'fields': (
                ('district', 'city'),
                'address',
                'note',
            )
        }),
        ('System Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',),
        }),
    )

    def total_display(self, obj):
        return f"Rs. {obj.total:,}"
    total_display.short_description = "Total"

    def status_badge(self, obj):
        colors = {
            'Pending': '#CA8A04',
            'Confirmed': '#2563EB',
            'Shipped': '#7C3AED',
            'Delivered': '#059669',
        }
        color = colors.get(obj.status, '#4B5563')
        return format_html(
            '<span style="background: {}; color: #fff; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 0.78rem;">{}</span>',
            color, obj.status
        )
    status_badge.short_description = "Status"

    def whatsapp_chat_action(self, obj):
        raw_phone = obj.whatsapp or obj.phone
        if not raw_phone:
            return "—"
        clean = ''.join(filter(str.isdigit, raw_phone))
        if clean.startswith('0'):
            clean = clean[1:]
        if not clean.startswith('977'):
            clean = f"977{clean}"
        msg = f"Namaste {obj.customer_name}, this is LoveKod reaching out regarding your festive order {obj.order_id}."
        from urllib.parse import quote
        url = f"https://wa.me/{clean}?text={quote(msg)}"
        return format_html(
            '<a href="{}" target="_blank" style="background: #25D366; color: #fff; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 0.75rem; font-weight: 600; display: inline-block;">WhatsApp</a>',
            url
        )
    whatsapp_chat_action.short_description = "WhatsApp"

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        order = form.instance
        calc_total = sum((item.price or 0) * (item.quantity or 1) for item in order.items.all())
        if calc_total > 0 and (order.total == 0 or not change):
            order.total = calc_total
            order.save(update_fields=['total'])
