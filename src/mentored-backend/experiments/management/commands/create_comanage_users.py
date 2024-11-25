from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from experiments.models import ComanageUser

class Command(BaseCommand):
    help = 'Create ComanageUser profiles for existing users'

    def handle(self, *args, **kwargs):
        users_without_profile = User.objects.filter(comanageuser__isnull=True)
        for user in users_without_profile:
            ComanageUser.objects.create(user=user)
            self.stdout.write(self.style.SUCCESS(f'Created ComanageUser for user {user.username}'))