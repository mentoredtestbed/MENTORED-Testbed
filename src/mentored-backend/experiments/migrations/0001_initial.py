# Generated by Django 4.0.5 on 2022-06-20 13:55

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Snippet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('exp_name', models.TextField()),
            ],
            options={
                'ordering': ['created'],
            },
        ),
    ]
