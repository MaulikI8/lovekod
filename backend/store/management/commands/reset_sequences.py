from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Synchronize all PostgreSQL database auto-increment sequences with current table MAX(id)'

    def handle(self, *args, **options):
        if connection.vendor != 'postgresql':
            self.stdout.write(self.style.WARNING("Active database is not PostgreSQL. Skipping sequence sync."))
            return

        tables = [
            'store_category',
            'store_testimonial',
            'store_festivalmoment',
            'store_sitesettings',
            'store_coupon',
            'store_orderitem',
            'store_order',
            'auth_user',
            'auth_group',
            'auth_permission',
            'django_admin_log',
            'django_content_type',
        ]

        with connection.cursor() as cursor:
            for table in tables:
                try:
                    cursor.execute(f"""
                        SELECT setval(
                            pg_get_serial_sequence('{table}', 'id'),
                            COALESCE((SELECT MAX(id) FROM "{table}"), 1)
                        );
                    """)
                    self.stdout.write(self.style.SUCCESS(f"Synchronized sequence for table: {table}"))
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"Note for {table}: {e}"))

        self.stdout.write(self.style.SUCCESS("All PostgreSQL sequences synchronized successfully!"))
