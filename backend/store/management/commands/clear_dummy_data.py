from django.core.management.base import BaseCommand
from store.models import Product, Order, OrderItem, Testimonial, FestivalMoment, SiteSettings, Category


class Command(BaseCommand):
    help = "Clears all dummy products, orders, testimonials, festival moments, and story placeholders."

    def handle(self, *args, **options):
        # 1. Delete all dummy products
        p_count = Product.objects.count()
        Product.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {p_count} dummy product(s)."))

        # 2. Delete all orders and order items
        oi_count = OrderItem.objects.count()
        OrderItem.objects.all().delete()
        o_count = Order.objects.count()
        Order.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {o_count} order(s) and {oi_count} order item(s)."))

        # 3. Delete all dummy testimonials
        t_count = Testimonial.objects.count()
        Testimonial.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {t_count} dummy testimonial(s)."))

        # 4. Delete all dummy festival moments
        f_count = FestivalMoment.objects.count()
        FestivalMoment.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {f_count} dummy festival moment(s)."))

        # 5. Clean up SiteSettings placeholders
        s = SiteSettings.objects.first()
        if s:
            s.story_p1 = ""
            s.story_p2 = ""
            s.story_quote = ""
            s.story_quote_author = ""
            s.story_tag = ""
            s.story_title = ""
            s.spotlight_badge = ""
            s.spotlight_title = ""
            s.spotlight_nepali = ""
            s.spotlight_desc = ""
            s.spotlight_product_id = ""
            s.announcement_nepali = "LOVEKOD BOUTIQUE"
            s.announcement_text = "Delivering Across All 77 Districts of Nepal • Express Courier Dispatch"
            s.hero_badge_nepali = "LoveKod Official"
            s.hero_badge_text = "Festive Couture Edit"
            s.hero_title_line1 = "LoveKod Boutique"
            s.hero_title_accent = "Bespoke Festive Elegance"
            s.hero_subtitle = "Exclusive handcrafted kurtha sets and artisanal collections for women across Nepal."
            s.contact_phone = "+977 9717567133"
            s.contact_whatsapp = "+977 9717567133"
            s.contact_email = "concierge@lovekod.com"
            s.contact_address = "Kathmandu Valley, Nepal"
            s.free_shipping_threshold = 3000
            s.sale_countdown_enabled = False
            s.save()
            self.stdout.write(self.style.SUCCESS("Cleaned SiteSettings of dummy story placeholders."))

        self.stdout.write(self.style.SUCCESS("All dummy data successfully cleared! Ready for real catalog entries."))
