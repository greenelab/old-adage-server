# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('analyze', '0007_auto_20170404_1616'),
    ]

    operations = [
        migrations.CreateModel(
            name='ParticipationType',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(unique=True, max_length=256)),
                ('description', models.TextField()),
            ],
        ),
        migrations.AddField(
            model_name='participation',
            name='participation_type',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='analyze.ParticipationType', null=True),
        ),
    ]
