# Generated by Django 4.1.4 on 2024-07-26 04:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('experiments', '0031_notification_systemnotification_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='projectinvitenotification',
            name='user_email',
            field=models.CharField(default='func.aluno@idp4.cafeexpresso.rnp.br', max_length=100),
        ),
    ]
