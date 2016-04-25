# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
import analyze.models


class Migration(migrations.Migration):

    dependencies = [
        ('analyze', '0003_auto_20150623_1616'),
    ]

    operations = [
        migrations.CreateModel(
            name='AnnotationType',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('typename', models.CharField(unique=True, max_length=40, verbose_name=b'name for this AnnotationType (usable as a Python identifier)', validators=[analyze.models.validate_pyname])),
                ('description', models.CharField(max_length=140, blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Sample',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=80, verbose_name=b'sample name')),
                ('ml_data_source', models.CharField(max_length=120, unique=True, null=True, verbose_name=b'Machine Learning data used for modeling, e.g. CEL file', blank=True)),
                ('experiments', models.ManyToManyField(to='analyze.Experiment')),
            ],
        ),
        migrations.CreateModel(
            name='SampleAnnotation',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('text', models.TextField(verbose_name=b'annotation text', blank=True)),
                ('annotation_type', models.ForeignKey(to='analyze.AnnotationType', on_delete=django.db.models.deletion.PROTECT)),
                ('sample', models.ForeignKey(to='analyze.Sample')),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='sampleannotation',
            unique_together=set([('annotation_type', 'sample')]),
        ),
    ]
