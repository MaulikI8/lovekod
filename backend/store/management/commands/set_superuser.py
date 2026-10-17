from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Create or update superuser credentials non-interactively'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, default='admin')
        parser.add_argument('--password', type=str, default='lovekod2026')
        parser.add_argument('--email', type=str, default='admin@lovekod.com')

    def handle(self, *args, **options):
        username = options['username']
        password = options['password']
        email = options['email']

        user, created = User.objects.get_or_create(
            username=username,
            defaults={'email': email, 'is_staff': True, 'is_superuser': True}
        )
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.save()

        action = "Created new" if created else "Updated existing"
        self.stdout.write(self.style.SUCCESS(f"{action} superuser '{username}' successfully."))
