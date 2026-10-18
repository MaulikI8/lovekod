from django import forms
from django.contrib import admin, messages
from django.shortcuts import redirect
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import action
from .models import Category, Product, SiteSettings, FestivalMoment, Testimonial, Order, OrderItem

admin.site.site_header = "LoveKod Boutique Administration"
admin.site.site_title = "LoveKod Admin"
admin.site.index_title = "Storefront Control Center"


class TrashStatusFilter(admin.SimpleListFilter):
    title = "Trash / Deletion Status"
    parameter_name = "trash_status"

    def lookups(self, request, model_admin):
        return (
            ('active', '● Active Only (Exclude Trash)'),
            ('trash', '🗑️ Trash Only (Soft Deleted)'),
            ('all', 'All Items (Active + Trash)'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'active':
            return queryset.filter(is_deleted=False)
        if self.value() == 'trash':
            return queryset.filter(is_deleted=True)
        return queryset


@admin.action(description="🗑️ Soft Delete (Move selected to Trash)")
def soft_delete_selected(modeladmin, request, queryset):
    # If soft-deleting orders, restore product stock back to inventory
    for obj in queryset:
        if hasattr(obj, 'items'):
            for item in obj.items.all():
                if hasattr(item, 'restore_inventory'):
                    item.restore_inventory()
    updated = queryset.update(is_deleted=True)
    modeladmin.message_user(
        request,
        f"Successfully moved {updated} item(s) to Trash (Soft Deleted).",
        messages.SUCCESS,
    )


@admin.action(description="♻️ Restore (Recover selected from Trash)")
def restore_selected(modeladmin, request, queryset):
    # If restoring orders, re-deduct product stock
    for obj in queryset:
        if hasattr(obj, 'items'):
            for item in obj.items.all():
                if hasattr(item, 'deduct_inventory'):
                    item.deduct_inventory()
    updated = queryset.update(is_deleted=False)
    modeladmin.message_user(
        request,
        f"Successfully restored {updated} item(s) to Active.",
        messages.SUCCESS,
    )


@admin.action(description="⚠️ Hard Delete (Permanently remove selected from database)")
def hard_delete_selected(modeladmin, request, queryset):
    # Restore inventory before permanent deletion if still deducted
    for obj in queryset:
        if hasattr(obj, 'items'):
            for item in obj.items.all():
                if hasattr(item, 'restore_inventory'):
                    item.restore_inventory()
    count = queryset.count()
    queryset.delete()
    modeladmin.message_user(
        request,
        f"Permanently removed {count} item(s) from database.",
        messages.WARNING,
    )


COMMON_ACTIONS = [soft_delete_selected, restore_selected, hard_delete_selected]


def deletion_badge(obj):
    if getattr(obj, 'is_deleted', False):
        return format_html(
            '<span style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); padding: 2px 8px; border-radius: 9999px; font-weight: 600; font-size: 0.72rem; display: inline-flex; align-items: center; gap: 4px;">'
            '🗑️ In Trash</span>'
        )
    return format_html(
        '<span style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); padding: 2px 8px; border-radius: 9999px; font-weight: 600; font-size: 0.72rem; display: inline-flex; align-items: center; gap: 4px;">'
        '● Active</span>'
    )


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ('name', 'slug', 'order', 'is_active', 'trash_status')
    list_editable = ('order', 'is_active')
    list_filter = (TrashStatusFilter, 'is_active')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    actions = COMMON_ACTIONS
    actions_on_top = True
    actions_on_bottom = True

    def trash_status(self, obj):
        return deletion_badge(obj)
    trash_status.short_description = "Trash Status"


class OrderItemForm(forms.ModelForm):
    product_choice = forms.ModelChoiceField(
        queryset=Product.objects.filter(is_deleted=False).order_by('name'),
        required=False,
        label="Quick Select Garment",
        help_text="Select a catalog garment to auto-populate name, price, and ID."
    )
    size = forms.ChoiceField(
        choices=[
            ('XS', 'XS (Extra Small)'),
            ('S', 'S (Small)'),
            ('M', 'M (Medium)'),
            ('L', 'L (Large)'),
            ('XL', 'XL (Extra Large)'),
            ('XXL', 'XXL (Double Extra Large)'),
            ('XXXL', 'XXXL (Triple Extra Large)'),
            ('Free Size', 'Free Size'),
        ],
        initial='M'
    )

    class Meta:
        model = OrderItem
        fields = ('product_choice', 'product_id', 'name', 'size', 'quantity', 'price')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.product_id:
            p = Product.objects.filter(product_id=self.instance.product_id).first()
            if p:
                self.fields['product_choice'].initial = p

    def clean(self):
        cleaned_data = super().clean()
        prod = cleaned_data.get('product_choice')
        if prod:
            if not cleaned_data.get('product_id'):
                cleaned_data['product_id'] = prod.product_id
            if not cleaned_data.get('name'):
                cleaned_data['name'] = prod.name
            if not cleaned_data.get('price') or cleaned_data.get('price') == 0:
                cleaned_data['price'] = prod.price
        return cleaned_data


class OrderItemInline(TabularInline):
    model = OrderItem
    form = OrderItemForm
    extra = 1
    fields = ('product_choice', 'product_id', 'name', 'size', 'quantity', 'price')


@admin.register(Product)
class ProductAdmin(ModelAdmin):
    list_display = (
        'image_preview',
        'product_details',
        'category',
        'price_display',
        'inventory_display',
        'is_featured',
        'trash_status',
    )
    list_filter = (TrashStatusFilter, 'category', 'fabric_type', 'is_featured')
    search_fields = ('name', 'product_id', 'fabric_type')
    readonly_fields = ('image_display',)
    actions = COMMON_ACTIONS
    actions_on_top = True
    actions_on_bottom = True

    fieldsets = (
        ('Garment Identification', {
            'fields': (
                ('product_id', 'category'),
                ('name', 'fabric_type'),
                'pieces',
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
                'is_deleted',
                'description',
            )
        }),
        ('Inventory by Size (Units)', {
            'fields': (
                ('stock_xs', 'stock_s'),
                ('stock_m', 'stock_l'),
                ('stock_xl', 'stock_xxl'),
                ('stock_xxxl', 'stock_free'),
                'custom_sizes',
            ),
            'description': 'Enter available units for each size. Items with 0 units will automatically show as Sold Out on the storefront. Use custom sizes JSON for extra sizes (e.g. {"4XL": 5}).'
        }),
    )

    def trash_status(self, obj):
        return deletion_badge(obj)
    trash_status.short_description = "Status"

    def image_preview(self, obj):
        img_url = obj.get_image_url()
        placeholder = '/images/kurtha-charcoal.jpg'
        return format_html(
            '<div style="width: 46px; height: 56px; border-radius: 6px; overflow: hidden; background: #231916; border: 1px solid rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center;">'
            '<img src="{}" onerror="this.onerror=null; this.src=\'' + placeholder + '\';" style="width: 100%; height: 100%; object-fit: cover;" alt="preview" />'
            '</div>',
            img_url
        )
    image_preview.short_description = "Photo"

    def product_details(self, obj):
        badge_html = f' <span style="background: rgba(192,129,122,0.2); color: #c0817a; border: 1px solid rgba(192,129,122,0.4); padding: 1px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">{obj.badge}</span>' if obj.badge else ''
        return format_html(
            '<div>'
            '<div style="font-weight: 600; font-size: 0.92rem; color: #f3ece6;">{}{}</div>'
            '<div style="font-size: 0.75rem; color: #8e807a; margin-top: 3px;">SKU: <code style="background: rgba(255,255,255,0.06); padding: 1px 4px; border-radius: 3px; font-weight: 600; color: #d6ccc7;">{}</code> &bull; {}</div>'
            '</div>',
            obj.name,
            format_html(badge_html),
            obj.product_id,
            obj.fabric_type
        )
    product_details.short_description = "Product Name & SKU"

    def price_display(self, obj):
        orig_html = f'<span style="text-decoration: line-through; color: #887872; font-size: 0.78rem; margin-left: 6px;">Rs. {obj.original_price:,}</span>' if obj.original_price and obj.original_price > obj.price else ''
        formatted_price = f"{obj.price:,}" if obj.price else "0"
        return format_html(
            '<div style="font-weight: 600; color: #c0817a; font-size: 0.9rem;">Rs. {}{}</div>',
            formatted_price,
            format_html(orig_html)
        )
    price_display.short_description = "Price"

    def inventory_display(self, obj):
        tot = obj.total_stock()
        color = '#34d399' if tot > 5 else ('#fbbf24' if tot > 0 else '#f87171')
        bg = 'rgba(16, 185, 129, 0.15)' if tot > 5 else ('rgba(251, 191, 36, 0.15)' if tot > 0 else 'rgba(239, 68, 68, 0.15)')
        return format_html(
            '<div style="display: inline-flex; align-items: center; gap: 6px; background: {}; color: {}; border: 1px solid {}; padding: 3px 10px; border-radius: 6px; font-weight: 600; font-size: 0.82rem;">'
            '<span>{} units</span>'
            '</div>',
            bg, color, color, tot
        )
    inventory_display.short_description = "Total Stock"

    def image_display(self, obj):
        img_url = obj.get_image_url()
        placeholder = '/images/kurtha-charcoal.jpg'
        return format_html(
            '<div style="margin-top: 8px;">'
            '<img src="{}" onerror="this.onerror=null; this.src=\'' + placeholder + '\';" style="max-width: 260px; max-height: 340px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 4px 16px rgba(0,0,0,0.3);" />'
            '</div>',
            img_url
        )
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


@admin.register(Testimonial)
class TestimonialAdmin(ModelAdmin):
    list_display = ('customer_name', 'location', 'rating', 'order', 'is_active', 'trash_status')
    list_editable = ('rating', 'order', 'is_active')
    list_filter = (TrashStatusFilter, 'rating', 'is_active')
    search_fields = ('customer_name', 'location', 'quote')
    actions = COMMON_ACTIONS
    actions_on_top = True
    actions_on_bottom = True

    def trash_status(self, obj):
        return deletion_badge(obj)
    trash_status.short_description = "Trash Status"


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
        'trash_status',
        'whatsapp_chat_action',
        'created_at',
    )
    list_filter = (TrashStatusFilter, 'status', 'district', 'payment_method', 'created_at')
    search_fields = ('order_id', 'customer_name', 'phone', 'whatsapp', 'district', 'city', 'address')
    list_editable = ('status',)
    inlines = [OrderItemInline]
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    actions = COMMON_ACTIONS
    actions_on_top = True
    actions_on_bottom = True
    actions_list = ["manual_create_order_action"]

    fieldsets = (
        ('Order Identification & Status', {
            'fields': (
                ('order_id', 'status'),
                ('payment_method', 'total'),
                'is_deleted',
            ),
            'description': 'Leave Order ID blank to auto-generate (e.g. ORD-190A...). Set Total to 0 to auto-sum from line items below. Check is_deleted to move this order to Trash.'
        }),
        ('Customer Contact Information', {
            'fields': (
                'customer_name',
                ('phone', 'whatsapp'),
            ),
            'description': 'Customer phone number is used for WhatsApp concierge dispatch.'
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

    @action(
        description="➕ Manually Create Order",
        icon="add_shopping_cart",
        url_path="create-order",
    )
    def manual_create_order_action(self, request):
        return redirect("admin:store_order_add")

    def trash_status(self, obj):
        return deletion_badge(obj)
    trash_status.short_description = "Trash Status"

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
            return "-"
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

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        # If order status changed to Cancelled or moved to Trash, restore stock
        if change:
            if obj.status == 'Cancelled' or obj.is_deleted:
                for item in obj.items.all():
                    item.restore_inventory()
            else:
                for item in obj.items.all():
                    item.deduct_inventory()

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        order = form.instance
        # Synchronize inventory for line items (deducts stock for each item)
        for item in order.items.all():
            if not getattr(item, 'stock_deducted', False) and not order.is_deleted and order.status != 'Cancelled':
                item.deduct_inventory()
            elif (order.is_deleted or order.status == 'Cancelled') and getattr(item, 'stock_deducted', False):
                item.restore_inventory()

        calc_total = sum((item.price or 0) * (item.quantity or 1) for item in order.items.all())
        if calc_total > 0 and (order.total == 0 or not change):
            order.total = calc_total
            order.save(update_fields=['total'])
