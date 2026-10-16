from django.contrib import admin
from .models import Category, Product, SiteSettings, FestivalMoment, Testimonial, Order, OrderItem

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'nepali_name', 'slug', 'order', 'is_active')
    list_editable = ('order', 'is_active')
    search_fields = ('name', 'nepali_name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_id', 'name', 'size', 'quantity', 'price')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'product_id',
        'name',
        'category',
        'fabric_type',
        'price',
        'stock_m',
        'stock_l',
        'stock_xl',
        'stock_xxl',
        'total_stock',
        'badge',
        'is_featured'
    )
    list_filter = ('category', 'fabric_type', 'is_featured')
    search_fields = ('name', 'nepali_name', 'product_id', 'fabric_type')
    list_editable = ('category', 'price', 'stock_m', 'stock_l', 'stock_xl', 'stock_xxl', 'badge', 'is_featured')


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
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
            )
        }),
    )

    def has_add_permission(self, request):
        # Enforce singleton
        return SiteSettings.objects.count() == 0


@admin.register(FestivalMoment)
class FestivalMomentAdmin(admin.ModelAdmin):
    list_display = ('nepali_title', 'english_sub', 'tag', 'icon_key', 'order', 'is_active')
    list_editable = ('order', 'is_active', 'icon_key')
    search_fields = ('nepali_title', 'english_sub', 'tag')


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('customer_name', 'location', 'rating', 'order', 'is_active')
    list_editable = ('rating', 'order', 'is_active')
    search_fields = ('customer_name', 'location', 'quote')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
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
