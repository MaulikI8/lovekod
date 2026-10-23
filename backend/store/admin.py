import threading
_thread_locals = threading.local()
from django import forms
from django.contrib import admin, messages
from django.shortcuts import redirect
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import action
from .models import Category, Product, SiteSettings, FestivalMoment, Testimonial, Order, OrderItem, Coupon, Customer
from django.urls import reverse

admin.site.site_header = "LoveKod Administration"
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
    list_display = ('image_preview', 'name', 'nepali_name', 'slug', 'order', 'seo_status', 'is_active', 'trash_status')
    list_editable = ('order', 'is_active')
    list_filter = (TrashStatusFilter, 'is_active')
    search_fields = ('name', 'slug', 'seo_tags')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('image_display', 'google_preview_snippet')
    actions = COMMON_ACTIONS
    actions_on_top = True
    actions_on_bottom = True

    fieldsets = (
        ('Category Information', {
            'fields': (
                ('name', 'slug'),
                ('nepali_name', 'order'),
                ('is_active', 'is_deleted'),
            )
        }),
        ('Collection Imagery (Banner & Social Share Card)', {
            'fields': (
                'image',
                'image_display',
            ),
            'description': 'Upload collection cover photo (also used when sharing this category on WhatsApp, Instagram, or Facebook).'
        }),
        ('🔍 Search Engine Optimization (SEO & Social Tags)', {
            'fields': (
                'meta_title',
                'meta_description',
                'seo_tags',
                'canonical_url',
                'google_preview_snippet',
            ),
            'description': 'Configure how this category collection ranks on Google and appears in social sharing cards.'
        }),
    )

    def image_preview(self, obj):
        img_url = obj.get_image_url()
        return format_html(
            '<div style="width: 44px; min-width: 44px; max-width: 44px; height: 44px; min-height: 44px; max-height: 44px; border-radius: 8px; overflow: hidden; border: 1px solid #E5E7EB; background: #F9FAFB; display: flex; align-items: center; justify-content: center;">'
            '<img src="{}" onerror="this.onerror=null; this.src=&quot;/images/hero-banner.jpg&quot;;" style="width: 44px; height: 44px; object-fit: cover; display: block;" alt="{}" />'
            '</div>',
            img_url, obj.name
        )
    image_preview.short_description = "Image"

    def image_display(self, obj):
        if not obj or not obj.image:
            return format_html(
                '<div style="margin-top: 6px; padding: 16px; background: #F9FAFB; border: 1.5px dashed #D1D5DB; border-radius: 8px; max-width: 360px; text-align: center; color: #6B7280; font-size: 12px;">'
                '<span style="font-size: 20px; display: block; margin-bottom: 4px;">🖼️</span>'
                'No banner uploaded yet. Choose an image file above.'
                '</div>'
            )
        img_url = obj.get_image_url()
        return format_html(
            '<div style="margin-top: 8px;">'
            '<img src="{}" style="max-width: 320px; max-height: 180px; object-fit: cover; border-radius: 8px; border: 1px solid #E5E7EB; box-shadow: 0 2px 8px rgba(0,0,0,0.06);" />'
            '</div>',
            img_url
        )
    image_display.short_description = "Collection Banner Preview"

    def seo_status(self, obj):
        if obj.meta_title and obj.meta_description:
            return format_html(
                '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">'
                '● SEO Configured'
                '</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500 border border-gray-200">'
            'Auto-Generated'
            '</span>'
        )
    seo_status.short_description = "SEO Status"

    def google_preview_snippet(self, obj):
        if not obj or not obj.id:
            return format_html('<span class="text-xs text-gray-400">Save this category first to preview Google SERP.</span>')
        title = obj.get_meta_title()
        desc = obj.get_meta_description()
        url = f"https://lovekod.com/category/{obj.slug}"
        return format_html(
            '<div style="max-width: 620px; padding: 16px; background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 12px; font-family: arial, sans-serif; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">'
            '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">'
            '<span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #7C3AED;">Category Google Search Snippet</span>'
            '<span style="font-size: 11px; color: #10B981; font-weight: 600; background: #ECFDF5; padding: 2px 8px; border-radius: 9999px;">● Category SEO Live</span>'
            '</div>'
            '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">'
            '<div style="width: 22px; height: 22px; border-radius: 50%; background: #7C3AED; display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 10px; font-weight: bold; flex-shrink: 0;">LK</div>'
            '<div style="display: flex; flex-direction: column; overflow: hidden;">'
            '<span style="font-size: 12px; font-weight: 600; color: #202124; line-height: 1.2;">LoveKod (लभकोड) Collection</span>'
            '<span style="font-size: 11px; color: #5F6368; line-height: 1.2; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">{}</span>'
            '</div>'
            '</div>'
            '<a href="{}" target="_blank" style="font-size: 18px; line-height: 1.3; color: #1A0DAB; text-decoration: none; font-weight: 500; display: block; margin-top: 4px;">{}</a>'
            '<div style="font-size: 13px; line-height: 1.5; color: #4D5156; margin-top: 5px;">{}</div>'
            '</div>',
            url, url, title, desc
        )
    google_preview_snippet.short_description = "Live Google Search Snippet"

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
        'price_display',
        'inventory_pill',
        'status_pill',
        'created_display',
        'actions_button',
    )
    list_before_template = "admin/store/product/change_list_header.html"
    list_filter = ('status', 'category', 'fabric_type', 'is_featured', TrashStatusFilter)
    search_fields = ('name', 'product_id', 'fabric_type')
    ordering = ('-created_at', '-id')
    readonly_fields = ('image_display', 'seo_image_display', 'google_preview_snippet')
    actions = COMMON_ACTIONS
    actions_on_top = True
    actions_on_bottom = True

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        formfield = super().formfield_for_dbfield(db_field, request, **kwargs)
        if db_field.name == 'category' and hasattr(formfield.widget, 'widget'):
            # Replace popup action buttons with clean dropdown select
            formfield.widget = formfield.widget.widget
        return formfield

    fieldsets = (
        ('Garment Identification', {
            'fields': (
                'category',
                ('name', 'fabric_type'),
                'status',
            ),
            'description': 'Leave Product ID blank to automatically assign the next serial ID (1, 2, 3...).'
        }),
        ('Product Imagery (Upload from Computer)', {
            'fields': (
                'image',
                'image_display',
            ),
            'description': 'Choose an image file directly from your computer to replace or set the product photo.'
        }),
        ('Product Details', {
            'fields': (
                'is_featured',
                'is_deleted',
                'description',
            )
        }),
        ('STEP 2: Variants & Inventory', {
            'fields': (
                'enable_variants',
                ('original_price', 'price', 'cost_price'),
                ('quantity', 'weight', 'product_id'),
                'alt_barcode',
                'hs_code',
                'colors',
                'show_color_preview',
                'sizes',
                ('stock_xs', 'stock_s'),
                ('stock_m', 'stock_l'),
                ('stock_xl', 'stock_xxl'),
                ('stock_xxxl', 'stock_free'),
                'custom_sizes',
                'continue_selling',
            ),
            'description': 'Whenever you have multiple color/sizes/specs for any product, enable product variants.'
        }),
        ('🔍 Search Engine Optimization (SEO, Tags & Social Card)', {
            'fields': (
                'meta_title',
                'meta_description',
                ('focus_keyword', 'canonical_url'),
                ('seo_tags', 'meta_keywords'),
                'seo_image',
                'seo_image_display',
                'google_preview_snippet',
            ),
            'description': 'Configure how this outfit appears in Google Search, WhatsApp, Instagram, and Facebook link cards. Leave blank to automatically generate optimized meta tags.'
        }),
    )

    def save_model(self, request, obj, form, change):
        if obj.enable_variants and obj.custom_sizes:
            combos = obj.custom_sizes
            if isinstance(combos, str):
                import json
                try:
                    combos = json.loads(combos)
                except Exception:
                    combos = []

            if isinstance(combos, list) and len(combos) > 0:
                prices = [int(float(c.get('selling_price', 0))) for c in combos if float(c.get('selling_price', 0) or 0) > 0]
                if prices:
                    obj.price = prices[0]

                crossed = [int(float(c.get('crossed_price', 0))) for c in combos if float(c.get('crossed_price', 0) or 0) > 0]
                if crossed:
                    obj.original_price = crossed[0]

                costs = [int(float(c.get('cost_price', 0))) for c in combos if float(c.get('cost_price', 0) or 0) > 0]
                if costs:
                    obj.cost_price = costs[0]

                weights = [float(c.get('weight', 0)) for c in combos if float(c.get('weight', 0) or 0) > 0]
                if weights:
                    obj.weight = weights[0]

                total_qty = sum(int(c.get('quantity', 0) or 0) for c in combos)
                obj.quantity = total_qty

                size_map = {'xs': 0, 's': 0, 'm': 0, 'l': 0, 'xl': 0, 'xxl': 0, 'xxxl': 0, 'free': 0}
                for c in combos:
                    sz = str(c.get('size', '')).lower().strip()
                    q = int(c.get('quantity', 0) or 0)
                    if sz == 'xs': size_map['xs'] += q
                    elif sz == 's': size_map['s'] += q
                    elif sz == 'm': size_map['m'] += q
                    elif sz == 'l': size_map['l'] += q
                    elif sz == 'xl': size_map['xl'] += q
                    elif sz in ('xxl', '2xl'): size_map['xxl'] += q
                    elif sz in ('xxxl', '3xl'): size_map['xxxl'] += q
                    elif sz in ('free', 'free size'): size_map['free'] += q

                obj.stock_xs = size_map['xs']
                obj.stock_s = size_map['s']
                obj.stock_m = size_map['m']
                obj.stock_l = size_map['l']
                obj.stock_xl = size_map['xl']
                obj.stock_xxl = size_map['xxl']
                obj.stock_xxxl = size_map['xxxl']
                obj.stock_free = size_map['free']

                colors = list(dict.fromkeys(c.get('color') for c in combos if c.get('color')))
                sizes = list(dict.fromkeys(c.get('size') for c in combos if c.get('size')))
                if colors:
                    obj.colors = ', '.join(colors)
                if sizes:
                    obj.sizes = ', '.join(sizes)

        super().save_model(request, obj, form, change)

    def changelist_view(self, request, extra_context=None):
        response = super().changelist_view(request, extra_context=extra_context)
        if hasattr(response, 'context_data') and response.context_data and 'cl' in response.context_data:
            cl = response.context_data['cl']
            try:
                start = 1
                if cl.paginator and cl.page_num:
                    page = cl.paginator.page(cl.page_num)
                    start = page.start_index()
            except Exception:
                start = 1

            row_map = {}
            for i, item in enumerate(cl.result_list):
                row_map[item.id] = start + i
            _thread_locals.product_row_map = row_map
        return response

    def row_number(self, obj):
        row_map = getattr(_thread_locals, 'product_row_map', {})
        num = row_map.get(obj.id)
        if num is None:
            num = getattr(obj, '_row_number', obj.id)
        return format_html('<span class="text-xs font-semibold text-gray-500">{}</span>', num)
    row_number.short_description = "#"
    row_number.admin_order_field = "id"

    def blanxer_name(self, obj):
        img_url = obj.get_image_url()
        edit_url = reverse('admin:store_product_change', args=[obj.id])
        sku_val = obj.product_id
        if not sku_val:
            sku_val = f"lk-{obj.id:03d}"
        elif str(sku_val).isdigit():
            sku_val = f"lk-{int(sku_val):03d}"
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
            img_url, obj.name, edit_url, obj.name, sku_val
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
            '<span style="font-size: 12px; font-weight: 600; color: #202124; line-height: 1.2;">LoveKod (लभकोड)</span>'
            '<span style="font-size: 11px; color: #5F6368; line-height: 1.2; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">{}</span>'
            '</div>'
            '</div>'
            '<a href="{}" target="_blank" style="font-size: 18px; line-height: 1.3; color: #1A0DAB; text-decoration: none; font-weight: 500; display: block; margin-top: 4px;">{}</a>'
            '<div style="font-size: 13px; line-height: 1.5; color: #4D5156; margin-top: 5px;">{}</div>'
            '</div>',
            url, url, title, desc
        )
    google_preview_snippet.short_description = "Live Google Search Snippet"

    def seo_image_display(self, obj):
        if not obj or not getattr(obj, 'seo_image', None):
            return format_html(
                '<div style="margin-top: 6px; padding: 10px 14px; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; max-width: 440px; color: #6B7280; font-size: 11px;">'
                'ℹ️ No custom SEO card uploaded. Will automatically use the main outfit photo above for social sharing.'
                '</div>'
            )
        img_url = obj.get_seo_image_url()
        return format_html(
            '<div style="margin-top: 8px;">'
            '<img src="{}" style="max-width: 220px; max-height: 160px; object-fit: cover; border-radius: 8px; border: 1px solid #E5E7EB; box-shadow: 0 2px 6px rgba(0,0,0,0.06);" />'
            '<div style="font-size: 11px; color: #6B7280; margin-top: 4px;">Preview of social sharing card (WhatsApp / Facebook / Google)</div>'
            '</div>',
            img_url
        )
    seo_image_display.short_description = "Social Card Image Preview"

    def image_display(self, obj):
        img_url = obj.get_image_url() if (obj and obj.image) else ''
        has_img = bool(obj and obj.image)
        return format_html(
            '<div id="product-live-preview-box" style="margin-top: 6px;">'
            '  <div id="product-preview-empty" style="padding: 20px; background: #F9FAFB; border: 1.5px dashed #D1D5DB; border-radius: 8px; max-width: 300px; text-align: center; color: #6B7280; font-size: 12px; display: {};">'
            '    <span style="font-size: 22px; display: block; margin-bottom: 4px;">📷</span>'
            '    No photo chosen yet. Choose an image file above to preview.'
            '  </div>'
            '  <div id="product-preview-container" style="display: {};">'
            '    <img id="product-preview-img" src="{}" style="max-width: 240px; max-height: 320px; object-fit: cover; border-radius: 8px; border: 1px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: block;" />'
            '  </div>'
            '</div>',
            'none' if has_img else 'block',
            'block' if has_img else 'none',
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



class OrderInlineForCustomer(TabularInline):
    model = Order
    fields = ('order_id', 'channel', 'status', 'total', 'created_at')
    readonly_fields = ('order_id', 'channel', 'status', 'total', 'created_at')
    extra = 0
    can_delete = False
    show_change_link = True
    verbose_name = "Order History"
    verbose_name_plural = "Orders Placed by Customer"


@admin.register(Customer)
class CustomerAdmin(ModelAdmin):
    list_display = (
        'phone',
        'name',
        'email',
        'orders_count_badge',
        'total_spent_badge',
        'district',
        'city',
        'trash_status',
        'whatsapp_chat_action',
        'created_at',
    )
    list_filter = (TrashStatusFilter, 'district', 'created_at')
    search_fields = ('phone', 'name', 'email', 'whatsapp', 'district', 'city', 'address')
    ordering = ('-created_at',)
    readonly_fields = ('total_orders', 'total_spent', 'created_at', 'updated_at')
    inlines = [OrderInlineForCustomer]
    actions = COMMON_ACTIONS
    actions_on_top = True
    actions_on_bottom = True

    fieldsets = (
        ('Customer Identification (Primary Key)', {
            'fields': (
                'phone',
                'name',
                ('email', 'whatsapp'),
            ),
            'description': 'Mobile Phone number is the unique primary key for identifying this boutique customer.'
        }),
        ('Location & Delivery Details', {
            'fields': (
                ('district', 'city'),
                'address',
                'note',
            )
        }),
        ('Purchasing Statistics & Status', {
            'fields': (
                ('total_orders', 'total_spent'),
                'is_deleted',
            ),
            'description': 'Cumulative orders and total spend are automatically computed from completed boutique orders.'
        }),
        ('Timestamps', {
            'fields': (('created_at', 'updated_at'),),
            'classes': ('collapse',),
        }),
    )

    def trash_status(self, obj):
        return deletion_badge(obj)
    trash_status.short_description = "Trash Status"

    def orders_count_badge(self, obj):
        count = obj.total_orders or obj.orders.filter(is_deleted=False).count()
        return format_html(
            '<span style="background: rgba(124, 58, 237, 0.15); color: #8b5cf6; padding: 3px 9px; border-radius: 9999px; font-weight: 700; font-size: 0.8rem;">{} {}</span>',
            count, "order" if count == 1 else "orders"
        )
    orders_count_badge.short_description = "Orders"

    def total_spent_badge(self, obj):
        spent = obj.total_spent or sum(o.total or 0 for o in obj.orders.filter(is_deleted=False))
        return format_html(
            '<span style="font-weight: 700; color: #10b981; font-family: monospace;">Rs. {:,}</span>',
            spent
        )
    total_spent_badge.short_description = "Total Spent"

    def whatsapp_chat_action(self, obj):
        raw_phone = obj.whatsapp or obj.phone
        if not raw_phone:
            return "-"
        clean = ''.join(filter(str.isdigit, raw_phone))
        if clean.startswith('0'):
            clean = clean[1:]
        if not clean.startswith('977'):
            clean = f"977{clean}"
        msg = f"Namaste {obj.name or 'Valued Customer'}, this is LoveKod reaching out to you. How can we assist you today?"
        from urllib.parse import quote
        url = f"https://wa.me/{clean}?text={quote(msg)}"
        return format_html(
            '<a href="{}" target="_blank" style="background: #25D366; color: #fff; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 0.75rem; font-weight: 600; display: inline-block;">WhatsApp</a>',
            url
        )
    whatsapp_chat_action.short_description = "WhatsApp"


@admin.register(Order)
class OrderAdmin(ModelAdmin):
    class Media:
        js = ('js/order_customer_lookup.js',)

    list_display = (
        'order_id',
        'channel_badge',
        'customer_name_display',
        'phone',
        'district',
        'payment_method',
        'total_display',
        'status_badge',
        'trash_status',
        'whatsapp_chat_action',
        'created_at',
    )
    list_filter = (TrashStatusFilter, 'channel', 'status', 'district', 'payment_method', 'created_at')
    search_fields = ('order_id', 'customer_name', 'phone', 'email', 'whatsapp', 'district', 'city', 'address', 'channel')
    list_editable = ()
    inlines = [OrderItemInline]
    ordering = ('-created_at', '-id')
    readonly_fields = ('order_id', 'created_at')
    actions = COMMON_ACTIONS
    actions_on_top = True
    actions_on_bottom = True
    actions_list = ["manual_create_order_action"]

    def get_fieldsets(self, request, obj=None):
        if not obj:
            return (
                ('Order Status & Channel', {
                    'fields': (
                        ('status', 'channel'),
                        ('payment_method', 'total'),
                        'is_deleted',
                    ),
                    'description': 'Order Reference ID will be assigned automatically (e.g. ORD-1001). Set Total to 0 to auto-sum from line items below.'
                }),
                ('Customer Contact Information', {
                    'fields': (
                        'customer',
                        'customer_name',
                        ('phone', 'whatsapp'),
                        'email',
                    ),
                    'description': 'Customer phone number is the primary key. If the customer exists, their information will link automatically.'
                }),
                ('Delivery Destination in Nepal', {
                    'fields': (
                        ('district', 'city'),
                        'address',
                        'note',
                    )
                }),
            )
        return (
            ('Order Identification & Status', {
                'fields': (
                    ('order_id', 'status'),
                    ('channel', 'payment_method'),
                    'total',
                    'is_deleted',
                ),
                'description': 'Order Reference ID is assigned automatically (e.g. ORD-1001). Channel label indicates order source.'
            }),
            ('Customer Contact Information', {
                'fields': (
                    'customer',
                    'customer_name',
                    ('phone', 'whatsapp'),
                    'email',
                ),
                'description': 'Customer phone number is the primary key. If the customer exists, their information will link automatically.'
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

    def channel_badge(self, obj):
        ch = obj.channel or "Website"
        colors = {
            "Website": ("#1E40AF", "#DBEAFE"),
            "WhatsApp": ("#065F46", "#A7F3D0"),
            "Instagram": ("#831843", "#FBCFE8"),
        }
        bg, fg = colors.get(ch, ("#374151", "#F3F4F6"))
        return format_html(
            '<span style="background: {}; color: {}; padding: 2px 7px; border-radius: 4px; font-weight: 700; font-size: 0.72rem; letter-spacing: 0.02em;">{}</span>',
            bg, fg, ch
        )
    channel_badge.short_description = "Channel / Label"

    def customer_name_display(self, obj):
        if obj.customer_id:
            from django.urls import reverse
            url = reverse('admin:store_customer_change', args=[obj.customer_id])
            return format_html(
                '<a href="{}" style="font-weight: 600; color: #7C3AED; text-decoration: underline;" title="View Customer Profile">👤 {}</a>',
                url, obj.customer_name
            )
        return obj.customer_name
    customer_name_display.short_description = "Customer"

    def total_display(self, obj):
        return f"Rs. {obj.total:,}"
    total_display.short_description = "Total"

    def status_badge(self, obj):
        colors = {
            'Pending': '#CA8A04',
            'Confirmed': '#2563EB',
            'Processing': '#0284C7',
            'Shipped': '#7C3AED',
            'Delivered': '#059669',
            'Cancelled': '#DC2626',
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

from datetime import datetime, timedelta
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
    admin_name = "LoveKod" if not request.user.first_name else request.user.first_name

    # 1. Real active orders and products
    active_orders = Order.objects.filter(is_deleted=False)
    total_orders = active_orders.count()
    total_revenue_num = active_orders.aggregate(total=Sum('total'))['total'] or 0
    aov_num = int(total_revenue_num / total_orders) if total_orders > 0 else 0

    # Today's start
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_orders = active_orders.filter(created_at__gte=today_start)
    today_orders_count = today_orders.count()
    today_revenue_num = today_orders.aggregate(total=Sum('total'))['total'] or 0

    # 2. Hourly Order Statistics (Hours 00:00 to 23:00)
    hourly_counts = [0] * 24
    for o in today_orders:
        h = o.created_at.hour
        if 0 <= h < 24:
            hourly_counts[h] += 1

    # Max value for hourly chart scale
    max_hourly = max(max(hourly_counts), 4)
    # Calculate SVG points for 540x120 viewBox
    hourly_points = []
    hourly_dots = []
    for h in range(24):
        cx = 25 + h * 21.5
        cy = 105 - (hourly_counts[h] / max_hourly) * 90
        hourly_points.append(f"{cx},{cy}")
        hourly_dots.append({'cx': cx, 'cy': cy, 'count': hourly_counts[h], 'hour': f"{h:02d}:00"})

    hourly_polyline = " ".join(hourly_points)

    # 3. Weekly Sales (Sunday to Saturday)
    # Calculate days from Sunday
    # Python weekday(): Monday is 0 and Sunday is 6
    days_since_sunday = (now.weekday() + 1) % 7
    start_of_week = (today_start - timedelta(days=days_since_sunday))
    start_of_last_week = start_of_week - timedelta(days=7)

    week_orders = active_orders.filter(created_at__gte=start_of_week)
    last_week_orders = active_orders.filter(created_at__gte=start_of_last_week, created_at__lt=start_of_week)

    day_names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    weekly_days = []
    this_week_total = 0

    for i, dname in enumerate(day_names):
        d_start = start_of_week + timedelta(days=i)
        d_end = d_start + timedelta(days=1)
        d_rev = week_orders.filter(created_at__gte=d_start, created_at__lt=d_end).aggregate(t=Sum('total'))['t'] or 0
        this_week_total += d_rev

        lw_start = start_of_last_week + timedelta(days=i)
        lw_end = lw_start + timedelta(days=1)
        lw_rev = last_week_orders.filter(created_at__gte=lw_start, created_at__lt=lw_end).aggregate(t=Sum('total'))['t'] or 0

        # Calculate heights (max 85px)
        max_weekly_scale = max(this_week_total, 10000, total_revenue_num)
        h_this = max(2, int((d_rev / max_weekly_scale) * 85)) if d_rev > 0 else 2
        h_last = max(2, int((lw_rev / max_weekly_scale) * 85)) if lw_rev > 0 else 2

        weekly_days.append({
            'day': dname,
            'is_today': (i == days_since_sunday),
            'this_week_rev': d_rev,
            'last_week_rev': lw_rev,
            'height_this': h_this,
            'y_this': 95 - h_this,
            'height_last': h_last,
            'y_last': 95 - h_last,
            'x_this': 40 + i * 68,
            'x_last': 54 + i * 68,
        })

    # Fallback to store total if week is just starting
    display_weekly_total = this_week_total if this_week_total > 0 else total_revenue_num
    weekly_total_formatted = f"{display_weekly_total:,}" if display_weekly_total > 0 else "0"

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
        'today_revenue': f"{today_revenue_num:,}",
        'total_revenue_num': total_revenue_num,
        'total_orders': total_orders,
        'today_orders_count': today_orders_count,
        'aov': f"{aov_num:,}",
        'aov_num': aov_num,
        'products_count': products_count,
        'categories_count': categories_count,
        'recent_orders': recent_orders,
        'recent_products': recent_products,
        'low_stock_products': low_stock_products,
        'active_coupons': active_coupons,
        'coupons_count': coupons_count,
        'weekly_total': weekly_total_formatted,
        'weekly_days': weekly_days,
        'hourly_polyline': hourly_polyline,
        'hourly_dots': hourly_dots,
    })
    return context
