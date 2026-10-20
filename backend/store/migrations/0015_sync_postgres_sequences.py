from django.db import migrations, connection

def sync_sequences(apps, schema_editor):
    if connection.vendor == 'postgresql':
        with connection.cursor() as cursor:
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
            for table in tables:
                try:
                    cursor.execute(f"""
                        SELECT setval(
                            pg_get_serial_sequence('{table}', 'id'),
                            COALESCE((SELECT MAX(id) FROM "{table}"), 1)
                        );
                    """)
                except Exception as e:
                    pass

class Migration(migrations.Migration):
    dependencies = [
        ('store', '0014_category_canonical_url_category_image_and_more'),
    ]

    operations = [
        migrations.RunPython(sync_sequences, reverse_code=migrations.RunPython.noop),
    ]
