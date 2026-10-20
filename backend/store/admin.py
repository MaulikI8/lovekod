from django import forms
from django.contrib import admin, messages
from django.shortcuts import redirect
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import action
from .models import Category, Product, SiteSettings, FestivalMoment, Testimonial, Order, OrderItem, Coupon
from django.urls import reverse

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
        'row_number',
        'blanxer_name',
        'avg_rating_display',
        'price_display',
        'inventory_pill',
        'status_pill',
        'created_display',
        'actions_button',
    )
    list_before_template = "admin/store/product/change_list_header.html"
    list_filter = ('status', 'category', 'fabric_type', 'is_featured', TrashStatusFilter)
    search_fields = ('name', 'product_id', 'fabric_type')
    readonly_fields = ('image_display', 'google_preview_snippet')
    actions = COMMON_ACTIONS
    actions_on_top = True
    actions_on_bottom = True

    fieldsets = (
        ('Garment Identification', {
            'fields': (
                ('product_id', 'category'),
                ('name', 'fabric_type'),
                ('status', 'pieces'),
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
                ('rating', 'reviews_count'),
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
        ('🔍 Search Engine Optimization (SEO & Social Sharing)', {
            'fields': (
                'meta_title',
                'meta_description',
                ('focus_keyword', 'canonical_url'),
                'meta_keywords',
                'google_preview_snippet',
            ),
            'description': 'Configure how this outfit appears in Google Search, WhatsApp, Instagram, and Facebook link cards. Leave blank to automatically generate optimized meta tags.'
        }),
    )

    def row_number(self, obj):
        return format_html('<span class="text-xs font-semibold text-gray-500">{}</span>', obj.id)
    row_number.short_description = "#"
    row_number.admin_order_field = "id"

    def blanxer_name(self, obj):
        img_url = obj.get_image_url()
        edit_url = reverse('admin:store_product_change', args=[obj.id])
        return format_html(
            '<div style="display: flex; align-items: center; gap: 12px; padding: 2px 0;">'
            '<div style="width: 44px; min-width: 44px; max-width: 44px; height: 56px; min-height: 56px; max-height: 56px; border-radius: 8px; overflow: hidden; border: 1px solid #E5E7EB; background: #F9FAFB; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">'
            '<img src="{}" onerror="this.onerror=null; this.src=&quot;/images/kurtha-charcoal.jpg&quot;;" style="width: 44px; height: 56px; max-width: 44px; max-height: 56px; object-fit: cover; display: block;" alt="{}" />'
            '</div>'
            '<div style="min-width: 0; display: flex; flex-direction: column; gap: 2px;">'
            '<a href="{}" style="font-weight: 700; color: #111827; text-decoration: none; font-size: 13px; line-height: 1.3;" class="hover:text-purple-600 block truncate">{}</a>'
            '<span style="font-size: 11px; color: #9CA3AF; font-family: monospace;">SKU: {}</span>'
            '</div>'
            '</div>',
            img_url, obj.name, edit_url, obj.name, obj.product_id
        )
    blanxer_name.short_description = "NAME"
    blanxer_name.admin_order_field = "name"

    def avg_rating_display(self, obj):
        r = int(obj.rating) if obj.rating else 0
        cnt = obj.reviews_count or 0
        star_color = "#F59E0B" if r > 0 else "#9CA3AF"
        return format_html(
            '<div class="flex items-center gap-1.5 font-bold text-xs text-gray-800">'
            '<span style="color: {}; font-size: 14px;">★</span>'
            '<span>{} <span class="font-normal text-gray-400">({})</span></span>'
            '</div>',
            star_color, r, cnt
        )
    avg_rating_display.short_description = "AVG RATING"
    avg_rating_display.admin_order_field = "rating"

    def price_display(self, obj):
        formatted_price = f"{obj.price or 0:,}"
        return format_html(
            '<span class="font-bold text-gray-900 text-xs tracking-tight">Rs {}</span>',
            formatted_price
        )
    price_display.short_description = "PRICE"
    price_display.admin_order_field = "price"

    def inventory_pill(self, obj):
        tot = obj.total_stock()
        sizes = obj.get_sizes_dict()
        active_variants = [k for k, v in sizes.items() if (v or 0) > 0]
        
        if len(active_variants) > 1:
            text = f"{tot} FOR {len(active_variants)} VARIANTS"
            bg_color = "bg-emerald-50 text-emerald-700 border-emerald-200" if tot <= 20 else "bg-rose-50 text-rose-700 border-rose-200"
        elif tot > 0:
            text = str(tot)
            bg_color = "bg-emerald-50 text-emerald-700 border-emerald-200"
        else:
            text = "0"
            bg_color = "bg-gray-100 text-gray-400 border-gray-200"

        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border {}">'
            '{}'
            '</span>',
            bg_color, text
        )
    inventory_pill.short_description = "INVENTORY"

    def status_pill(self, obj):
        st = (obj.status or 'active').lower()
        if obj.is_deleted or st == 'archived':
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200">'
                'ARCHIVED'
                '</span>'
            )
        elif st == 'draft':
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">'
                'DRAFT'
                '</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">'
            'ACTIVE'
            '</span>'
        )
    status_pill.short_description = "STATUS"
    status_pill.admin_order_field = "status"

    def created_display(self, obj):
        from django.utils import timezone
        created = timezone.localtime(obj.created_at) if obj.created_at else None
        txt = created.strftime("%b %d, %Y %I:%M %p") if created else "-"
        return format_html('<span class="text-xs text-gray-500">{}</span>', txt)
    created_display.short_description = "CREATED"
    created_display.admin_order_field = "created_at"

    def actions_button(self, obj):
        edit_url = reverse('admin:store_product_change', args=[obj.id])
        return format_html(
            '<div class="flex items-center justify-end">'
            '<a href="{}" class="w-8 h-8 rounded-lg inline-flex items-center justify-center text-purple-600 hover:bg-purple-50 transition-colors font-extrabold text-base tracking-widest" title="Edit Product">'
            '&middot;&middot;&middot;'
            '</a>'
            '</div>',
            edit_url
        )
    actions_button.short_description = "ACTIONS"

    def google_preview_snippet(self, obj):
        if not obj or not obj.id:
            return format_html('<span class="text-xs text-gray-400">Save this product first to preview Google SERP.</span>')
        title = obj.get_meta_title()
        desc = obj.get_meta_description()
        url = f"https://lovekod.com/product/{obj.product_id or obj.id}"
        return format_html(
            '<div style="max-width: 620px; padding: 16px; background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 12px; font-family: arial, sans-serif; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">'
            '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">'
            '<span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #7C3AED;">Google Search Snippet Preview</span>'
            '<span style="font-size: 11px; color: #10B981; font-weight: 600; background: #ECFDF5; padding: 2px 8px; border-radius: 9999px;">● Dynamic SEO Active</span>'
            '</div>'
            '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">'
            '<div style="width: 22px; height: 22px; border-radius: 50%; background: #7C3AED; display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 10px; font-weight: bold; flex-shrink: 0;">LK</div>'
            '<div style="display: flex; flex-direction: column; overflow: hidden;">'
            '<span style="font-size: 12px; font-weight: 600; color: #202124; line-height: 1.2;">LoveKod (लभकोड) Boutique</span>'
            '<span style="font-size: 11px; color: #5F6368; line-height: 1.2; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">{}</span>'
            '</div>'
            '</div>'
            '<a href="{}" target="_blank" style="font-size: 18px; line-height: 1.3; color: #1A0DAB; text-decoration: none; font-weight: 500; display: block; margin-top: 4px;">{}</a>'
            '<div style="font-size: 13px; line-height: 1.5; color: #4D5156; margin-top: 5px;">{}</div>'
            '</div>',
            url, url, title, desc
        )
    google_preview_snippet.short_description = "Live Google Search Snippet"

    def image_display(self, obj):
        img_url = obj.get_image_url()
        placeholder = '/images/kurtha-charcoal.jpg'
        return format_html(
            '<div style="margin-top: 8px;">'
            '<img src="{}" onerror="this.onerror=null; this.src='' + placeholder + '';" style="max-width: 260px; max-height: 340px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(0,0,0,0.1); box-shadow: 0 4px 16px rgba(0,0,0,0.08);" />'
            '</div>',
            img_url
        )
    image_display.short_description = "Current Preview"


@admin.register(Coupon)
class CouponAdmin(ModelAdmin):
    list_display = (
        'code_badge',
        'discount_badge',
        'min_purchase_display',
        'usage_display',
        'is_active',
        'valid_until_display',
        'created_at_display',
    )
    list_filter = ('is_active', 'discount_type', TrashStatusFilter)
    search_fields = ('code', 'description')
    list_editable = ('is_active',)
    actions = COMMON_ACTIONS
    actions_on_top = True
    actions_on_bottom = True

    fieldsets = (
        ('Coupon Identification', {
            'fields': (
                'code',
                'description',
                'is_active',
            ),
            'description': 'Enter uppercase promo code that customers enter at checkout (e.g. TIHAR10, LOVEKOD200).'
        }),
        ('Discount Benefits', {
            'fields': (
                ('discount_type', 'discount_value'),
                ('min_purchase_amount', 'max_discount_amount'),
            ),
            'description': 'Configure percentage or flat Rs reduction, minimum purchase threshold, and max discount ceiling.'
        }),
        ('Redemption Limits & Validity', {
            'fields': (
                ('usage_limit', 'used_count'),
                ('valid_from', 'valid_until'),
                'is_deleted',
            ),
            'description': 'Limit total redemptions or schedule expiration date.'
        }),
    )

    def code_badge(self, obj):
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">'
            '🏷️ {}'
            '</span>',
            obj.code
        )
    code_badge.short_description = "Coupon Code"
    code_badge.admin_order_field = "code"

    def discount_badge(self, obj):
        if obj.discount_type == 'percentage':
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">'
                '{}% OFF'
                '</span>',
                obj.discount_value
            )
        formatted_val = f"{obj.discount_value:,}"
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">'
            'Rs. {} FLAT'
            '</span>',
            formatted_val
        )
    discount_badge.short_description = "Discount"

    def min_purchase_display(self, obj):
        if obj.min_purchase_amount > 0:
            formatted_min = f"{obj.min_purchase_amount:,}"
            return format_html('<span class="text-xs font-semibold text-gray-700">Rs. {}</span>', formatted_min)
        return format_html('<span class="text-xs text-gray-400">No Minimum</span>')
    min_purchase_display.short_description = "Min Order"

    def usage_display(self, obj):
        limit = f"{obj.usage_limit}" if obj.usage_limit else "∞"
        return format_html(
            '<span class="text-xs font-semibold text-gray-700">{used} / {limit}</span>',
            used=obj.used_count,
            limit=limit
        )
    usage_display.short_description = "Used / Limit"

    def valid_until_display(self, obj):
        if obj.valid_until:
            from django.utils import timezone
            t = timezone.localtime(obj.valid_until)
            return format_html('<span class="text-xs text-gray-600">{}</span>', t.strftime("%b %d, %Y"))
        return format_html('<span class="text-xs text-gray-400">No Expiry</span>')
    valid_until_display.short_description = "Expires"

    def created_at_display(self, obj):
        from django.utils import timezone
        t = timezone.localtime(obj.created_at) if obj.created_at else None
        txt = t.strftime("%b %d, %Y") if t else "-"
        return format_html('<span class="text-xs text-gray-500">{}</span>', txt)
    created_at_display.short_description = "Created"


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
                'hero_trust_item_3',
                'hero_hotspots'
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


@admin.register(FestivalMoment)
class FestivalMomentAdmin(ModelAdmin):
    list_display = ('nepali_title', 'english_sub', 'tag', 'icon_key', 'order', 'is_active')
    list_editable = ('order', 'is_active')
    search_fields = ('nepali_title', 'english_sub', 'tag')


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


# ═══════════════════════════════════════════════════════════════════════════
# BLANXER MERCHANT DASHBOARD CONTEXT CALLBACK
# ═══════════════════════════════════════════════════════════════════════════

from datetime import datetime
from django.db.models import Sum

def blanxer_dashboard_callback(request, context):
    now = datetime.now()
    hour = now.hour
    if hour < 12:
        greeting = "Good Morning"
    elif hour < 17:
        greeting = "Good Afternoon"
    else:
        greeting = "Good Evening"

    today_str = now.strftime("%b %d, %Y")
    admin_name = request.user.get_full_name() or request.user.username or "Store Admin"

    # Calculate live real metrics from database
    active_orders = Order.objects.filter(is_deleted=False)
    total_orders = active_orders.count()
    total_revenue_num = active_orders.aggregate(total=Sum('total'))['total'] or 0
    aov_num = int(total_revenue_num / total_orders) if total_orders > 0 else 0

    milestone_target = 100
    milestone_current = min(milestone_target, total_orders)
    milestone_to_go = max(0, milestone_target - total_orders)
    milestone_pct = int((milestone_current / milestone_target) * 100) if milestone_target > 0 else 0

    products_count = Product.objects.filter(is_deleted=False).count()
    categories_count = Category.objects.filter(is_deleted=False).count()

    recent_orders = active_orders.order_by('-created_at')[:8]
    recent_products = Product.objects.filter(is_deleted=False).order_by('-id')[:6]

    # Live Low Stock Watch (Items with <= 5 total units)
    low_stock_products = []
    for p in Product.objects.filter(is_deleted=False):
        tot = p.total_stock()
        if tot <= 5:
            low_stock_products.append({
                'id': p.id,
                'name': p.name,
                'image': p.get_image_url(),
                'price': f"{p.price:,}",
                'stock': tot,
            })
        if len(low_stock_products) >= 6:
            break

    # Live Active Coupons & Campaigns
    active_coupons = Coupon.objects.filter(is_deleted=False, is_active=True).order_by('-created_at')[:5]
    coupons_count = Coupon.objects.filter(is_deleted=False, is_active=True).count()

    context.update({
        'greeting': greeting,
        'admin_name': admin_name,
        'today_date': today_str,
        'total_revenue': f"{total_revenue_num:,}",
        'total_revenue_num': total_revenue_num,
        'total_orders': total_orders,
        'aov': f"{aov_num:,}",
        'aov_num': aov_num,
        'milestone_target': milestone_target,
        'milestone_current': milestone_current,
        'milestone_to_go': milestone_to_go,
        'milestone_pct': milestone_pct,
        'products_count': products_count,
        'categories_count': categories_count,
        'recent_orders': recent_orders,
        'recent_products': recent_products,
        'low_stock_products': low_stock_products,
        'active_coupons': active_coupons,
        'coupons_count': coupons_count,
    })
    return context
