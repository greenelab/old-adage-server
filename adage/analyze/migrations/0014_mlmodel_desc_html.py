# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analyze', '0013_auto_20171108_1152'),
    ]

    operations = [
        migrations.AddField(
            model_name='mlmodel',
            name='desc_html',
            field=models.CharField(max_length=2048, blank=True),
        ),
    ]
