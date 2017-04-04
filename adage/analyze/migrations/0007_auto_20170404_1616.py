# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analyze', '0006_expressionvalue'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='expressionvalue',
            unique_together=set([('sample', 'gene')]),
        ),
    ]
