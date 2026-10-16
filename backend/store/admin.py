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
    extra = 0
    readonly_fields = ('product_id', 'name', 'size', 'quantity', 'price')


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
        ('Our Story Section', {
            'fields': (
                'story_tag',
                'story_title',
                'story_p1',
                'story_p2',
                'story_quote',
                'story_quote_author',
                'diyas_lit_count'
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
    )

    def has_add_permission(self, request):
        return SiteSettings.objects.count() == 0


@admin.register(FestivalMoment)
class FestivalMomentAdmin(ModelAdmin):
    list_display = ('nepali_title', 'english_sub', 'tag', 'icon_key', 'order', 'is_active')
    list_editable = ('order', 'is_active', 'icon_key')
    search_fields = ('nepali_title', 'english_sub', 'tag')


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
        'total',
        'status',
        'created_at'
    )
    list_filter = ('status', 'district', 'payment_method', 'created_at')
    search_fields = ('order_id', 'customer_name', 'phone', 'district')
    list_editable = ('status',)
    inlines = [OrderItemInline]
    ordering = ('-created_at',)
