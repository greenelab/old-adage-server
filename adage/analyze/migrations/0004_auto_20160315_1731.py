# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('analyze', '0003_auto_20150623_1616'),
    ]

    operations = [
        migrations.CreateModel(
            name='Sample',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=80, verbose_name=b'sample name')),
                ('ml_data_source', models.CharField(max_length=120, unique=True, null=True, verbose_name=b'Machine Learning data used for modeling, e.g. CEL file', blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='SampleAnnotation',
            fields=[
                ('sample', models.OneToOneField(primary_key=True, on_delete=django.db.models.deletion.PROTECT, serialize=False, to='analyze.Sample')),
                ('strain', models.CharField(max_length=60, verbose_name=b'strain', blank=True)),
                ('genotype', models.CharField(max_length=130, verbose_name=b'genotype', blank=True)),
                ('abx_marker', models.CharField(max_length=20, verbose_name=b'abx marker, auxotrophy', blank=True)),
                ('variant_phenotype', models.CharField(max_length=60, verbose_name=b'variant phenotype (QS defective, mucoid, SCV, \xe2\x80\xa6)', blank=True)),
                ('medium', models.TextField(verbose_name=b'medium (biosynthesis/energy)', blank=True)),
                ('treatment', models.CharField(max_length=200, verbose_name=b'treatment (drug/small molecule)', blank=True)),
                ('biotic_int_lv_1', models.CharField(max_length=70, verbose_name=b'biotic interactor level 1 (Plant, Human, Bacteria, \xe2\x80\xa6)', blank=True)),
                ('biotic_int_lv_2', models.CharField(max_length=80, verbose_name=b'biotic interactor level 2 (Lung, epithelial cells, Staphylococcus aureus, \xe2\x80\xa6)', blank=True)),
                ('growth_setting_1', models.CharField(max_length=40, verbose_name=b'growth setting (planktonic, colony, biofilm, \xe2\x80\xa6)', blank=True)),
                ('growth_setting_2', models.CharField(max_length=70, verbose_name=b'growth setting (For planktonic - aerated, static) (For biofilms - flow cell, static, \xe2\x80\xa6)', blank=True)),
                ('nucleic_acid', models.CharField(max_length=10, verbose_name=b'nucleic Acid', blank=True)),
                ('temperature', models.CharField(max_length=10, verbose_name=b'temperature', blank=True)),
                ('od', models.CharField(max_length=40, verbose_name=b'OD', blank=True)),
                ('additional_notes', models.TextField(verbose_name=b'additional notes (markers)', blank=True)),
                ('description', models.TextField(verbose_name=b'description (strain, replicates, and a brief glimpse of the exp.)')),
            ],
        ),
        migrations.AddField(
            model_name='sample',
            name='experiments',
            field=models.ManyToManyField(to='analyze.Experiment'),
        ),
    ]
