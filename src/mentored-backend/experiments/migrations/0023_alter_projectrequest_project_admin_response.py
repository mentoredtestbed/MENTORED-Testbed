# Generated by Django 4.1.4 on 2024-07-17 21:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('experiments', '0022_project_is_active_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='projectrequest',
            name='project_admin_response',
            field=models.TextField(blank=True, null=True),
        ),
    ]
