# -*- coding: utf-8 -*-

"""This migration file used to generate a default participation type and
set all Participation records to the default type.  These operations
have been moved to fabfile/adage_server.py now.
"""

from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('analyze', '0008_auto_20170501_1359'),
    ]

    operations = []
