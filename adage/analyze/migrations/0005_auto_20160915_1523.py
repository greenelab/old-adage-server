# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('genes', '__first__'),
        ('organisms', '__first__'),
        ('analyze', '0004_auto_20160321_1415'),
    ]

    operations = [
        migrations.CreateModel(
            name='Activity',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('value', models.FloatField()),
            ],
        ),
        migrations.CreateModel(
            name='Edge',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('weight', models.FloatField()),
                ('gene1', models.ForeignKey(related_name='gene1', on_delete=django.db.models.deletion.PROTECT, to='genes.Gene')),
                ('gene2', models.ForeignKey(related_name='gene2', on_delete=django.db.models.deletion.PROTECT, to='genes.Gene')),
            ],
        ),
        migrations.CreateModel(
            name='MLModel',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(unique=True, max_length=1000)),
                ('directed_g2g_edge', models.BooleanField(default=False)),
                ('organism', models.ForeignKey(to='organisms.Organism', on_delete=django.db.models.deletion.PROTECT)),
            ],
        ),
        migrations.CreateModel(
            name='Node',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=100)),
                ('mlmodel', models.ForeignKey(to='analyze.MLModel', on_delete=django.db.models.deletion.PROTECT)),
                ('samples', models.ManyToManyField(to='analyze.Sample', through='analyze.Activity')),
            ],
        ),
        migrations.CreateModel(
            name='Participation',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('gene', models.ForeignKey(to='genes.Gene', on_delete=django.db.models.deletion.PROTECT)),
                ('node', models.ForeignKey(to='analyze.Node', on_delete=django.db.models.deletion.PROTECT)),
            ],
        ),
        migrations.AddField(
            model_name='edge',
            name='mlmodel',
            field=models.ForeignKey(to='analyze.MLModel', on_delete=django.db.models.deletion.PROTECT),
        ),
        migrations.AddField(
            model_name='activity',
            name='node',
            field=models.ForeignKey(to='analyze.Node', on_delete=django.db.models.deletion.PROTECT),
        ),
        migrations.AddField(
            model_name='activity',
            name='sample',
            field=models.ForeignKey(to='analyze.Sample', on_delete=django.db.models.deletion.PROTECT),
        ),
        migrations.AlterUniqueTogether(
            name='participation',
            unique_together=set([('node', 'gene')]),
        ),
        migrations.AlterUniqueTogether(
            name='node',
            unique_together=set([('name', 'mlmodel')]),
        ),
        migrations.AlterUniqueTogether(
            name='edge',
            unique_together=set([('mlmodel', 'gene1', 'gene2')]),
        ),
        migrations.AlterUniqueTogether(
            name='activity',
            unique_together=set([('sample', 'node')]),
        ),
    ]
