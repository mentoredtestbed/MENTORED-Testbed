from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import ComanageUser
from django.conf import settings

import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        logger.debug(f'Creating profile for user {instance.username}')
        ComanageUser.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if settings.RELEASE_MODE != "production":
        return
    logger.debug(f'Saving profile for user {instance.username}')
    instance.comanageuser.save()