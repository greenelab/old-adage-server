# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('analyze', '0004_sample_sampleannotation'),
    ]

    operations = [
        migrations.RenameField(
            model_name='sampleannotation',
            old_name='biotic_interactor_level_1',
            new_name='biotic_int_lv_1',
        ),
        migrations.RenameField(
            model_name='sampleannotation',
            old_name='biotic_interactor_level_2',
            new_name='biotic_int_lv_2',
        ),
        migrations.RemoveField(
            model_name='sampleannotation',
            name='id',
        ),
        migrations.AlterField(
            model_name='sampleannotation',
            name='sample',
            field=models.OneToOneField(primary_key=True, on_delete=django.db.models.deletion.PROTECT, serialize=False, to='analyze.Sample'),
        ),
    ]
