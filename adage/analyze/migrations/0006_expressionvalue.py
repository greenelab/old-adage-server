# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('genes', '0001_initial'),
        ('analyze', '0005_auto_20160915_1523'),
    ]

    operations = [
        migrations.CreateModel(
            name='ExpressionValue',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('value', models.FloatField()),
                ('gene', models.ForeignKey(to='genes.Gene', on_delete=django.db.models.deletion.PROTECT)),
                ('sample', models.ForeignKey(to='analyze.Sample', on_delete=django.db.models.deletion.PROTECT)),
            ],
        ),
    ]
