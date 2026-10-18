import os
import sqlite3
from django.core.management.base import BaseCommand
from django.conf import settings
from store.models import Category, Product, SiteSettings, Testimonial, Order, OrderItem
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Copy all data from SQLite db.sqlite3 into the active PostgreSQL database'

    def handle(self, *args, **options):
        sqlite_path = settings.BASE_DIR / 'db.sqlite3'
        if not sqlite_path.exists():
            self.stdout.write(self.style.ERROR(f"SQLite file not found at {sqlite_path}"))
            return

        self.stdout.write("Reading SQLite database...")
        conn = sqlite3.connect(sqlite_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        # 1. Categories
        try:
            cur.execute("SELECT * FROM store_category")
            rows = cur.fetchall()
            for r in rows:
                Category.objects.update_or_create(
                    id=r['id'],
                    defaults={
                        'name': r['name'],
                        'slug': r['slug'],
                        'nepali_name': r['nepali_name'],
                        'order': r['order'],
                        'is_active': bool(r['is_active']),
                    }
                )
            self.stdout.write(self.style.SUCCESS(f"Migrated {len(rows)} categories."))
        except Exception as e:
            self.stdout.write(f"Categories error: {e}")

        # 2. Products
        try:
            cur.execute("SELECT * FROM store_product")
            rows = cur.fetchall()
            for r in rows:
                cat = Category.objects.filter(id=r['category_id']).first() if r['category_id'] else None
                Product.objects.update_or_create(
                    product_id=r['product_id'],
                    defaults={
                        'category': cat,
                        'name': r['name'],
                        'nepali_name': r['nepali_name'],
                        'fabric_type': r['fabric_type'],
                        'pieces': r['pieces'],
                        'price': r['price'],
                        'original_price': r['original_price'],
                        'description': r['description'],
                        'image': r['image'],
                        'badge': r['badge'],
                        'is_featured': bool(r['is_featured']),
                        'stock_m': r['stock_m'],
                        'stock_l': r['stock_l'],
                        'stock_xl': r['stock_xl'],
                        'stock_xxl': r['stock_xxl'],
                    }
                )
            self.stdout.write(self.style.SUCCESS(f"Migrated {len(rows)} products."))
        except Exception as e:
            self.stdout.write(f"Products error: {e}")

        # 3. SiteSettings
        try:
            cur.execute("SELECT * FROM store_sitesettings")
            row = cur.fetchone()
            if row:
                d = dict(row)
                d.pop('id', None)
                d.pop('updated_at', None)
                SiteSettings.objects.update_or_create(id=1, defaults=d)
                self.stdout.write(self.style.SUCCESS("Migrated SiteSettings."))
        except Exception as e:
            self.stdout.write(f"SiteSettings error: {e}")

        # 4. Testimonials
        try:
            cur.execute("SELECT * FROM store_testimonial")
            rows = cur.fetchall()
            for r in rows:
                Testimonial.objects.update_or_create(
                    id=r['id'],
                    defaults={
                        'customer_name': r['customer_name'],
                        'location': r['location'],
                        'initials': r['initials'],
                        'quote': r['quote'],
                        'rating': r['rating'],
                        'order': r['order'],
                        'is_active': bool(r['is_active']),
                    }
                )
            self.stdout.write(self.style.SUCCESS(f"Migrated {len(rows)} testimonials."))
        except Exception as e:
            self.stdout.write(f"Testimonials error: {e}")

        # 5. Orders and OrderItems
        try:
            cur.execute("SELECT * FROM store_order")
            order_rows = cur.fetchall()
            for r in order_rows:
                Order.objects.update_or_create(
                    order_id=r['order_id'],
                    defaults={
                        'customer_name': r['customer_name'],
                        'phone': r['phone'],
                        'whatsapp': r['whatsapp'],
                        'district': r['district'],
                        'city': r['city'],
                        'address': r['address'],
                        'note': r['note'],
                        'payment_method': r['payment_method'],
                        'total': r['total'],
                        'status': r['status'],
                    }
                )
            self.stdout.write(self.style.SUCCESS(f"Migrated {len(order_rows)} orders."))

            cur.execute("SELECT * FROM store_orderitem")
            item_rows = cur.fetchall()
            for r in item_rows:
                ord_obj = Order.objects.filter(id=r['order_id']).first()
                if ord_obj:
                    OrderItem.objects.update_or_create(
                        id=r['id'],
                        defaults={
                            'order': ord_obj,
                            'product_id': r['product_id'],
                            'name': r['name'],
                            'size': r['size'],
                            'quantity': r['quantity'],
                            'price': r['price'],
                            'image': r['image'],
                        }
                    )
            self.stdout.write(self.style.SUCCESS(f"Migrated {len(item_rows)} order items."))
        except Exception as e:
            self.stdout.write(f"Orders error: {e}")

        conn.close()
        self.stdout.write(self.style.SUCCESS("All SQLite data copied to PostgreSQL successfully!"))
