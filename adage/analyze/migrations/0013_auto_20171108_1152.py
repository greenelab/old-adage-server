# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analyze', '0012_mlmodel_g2g_edge_cutoff'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Node',
            new_name='Signature',
        ),
        migrations.RenameField(
            model_name='activity',
            old_name='node',
            new_name='signature',
        ),
        migrations.RenameField(
            model_name='participation',
            old_name='node',
            new_name='signature',
        ),
        migrations.AlterUniqueTogether(
            name='activity',
            unique_together=set([('sample', 'signature')]),
        ),
        migrations.AlterUniqueTogether(
            name='participation',
            unique_together=set([('signature', 'gene', 'participation_type')]),
        ),
    ]
