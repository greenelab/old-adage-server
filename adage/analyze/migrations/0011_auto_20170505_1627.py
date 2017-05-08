# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analyze', '0010_auto_20170503_1714'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='participation',
            unique_together=set([('node', 'gene', 'participation_type')]),
        ),
    ]
