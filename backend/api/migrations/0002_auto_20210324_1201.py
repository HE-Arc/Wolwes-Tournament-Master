# Generated by Django 3.1.7 on 2021-03-24 11:01

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='team',
            name='members',
            field=models.ManyToManyField(null=True, related_name='member', to=settings.AUTH_USER_MODEL),
        ),
    ]