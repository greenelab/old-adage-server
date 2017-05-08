# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('analyze', '0009_auto_20170503_1700'),
    ]

    operations = [
        migrations.AlterField(
            model_name='participation',
            name='participation_type',
            field=models.ForeignKey(to='analyze.ParticipationType', on_delete=django.db.models.deletion.PROTECT),
        ),
    ]
