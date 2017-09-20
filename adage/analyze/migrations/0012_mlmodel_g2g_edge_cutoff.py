# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analyze', '0011_auto_20170505_1627'),
    ]

    operations = [
        migrations.AddField(
            model_name='mlmodel',
            name='g2g_edge_cutoff',
            field=models.FloatField(default=0.0),
        ),
    ]
