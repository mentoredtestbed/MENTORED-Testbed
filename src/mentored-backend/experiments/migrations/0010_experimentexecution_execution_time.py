# Generated by Django 4.0.6 on 2022-07-15 18:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('experiments', '0009_alter_projectrequest_accepted'),
    ]

    operations = [
        migrations.AddField(
            model_name='experimentexecution',
            name='execution_time',
            field=models.IntegerField(default=60),
        ),
    ]
