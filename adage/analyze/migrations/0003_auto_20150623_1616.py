# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('analyze', '0002_auto_20150608_1710'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='experiment',
            name='id',
        ),
        migrations.AlterField(
            model_name='experiment',
            name='accession',
            field=models.CharField(max_length=48, serialize=False, primary_key=True),
        ),
    ]
