# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations

from analyze.models import Participation, ParticipationType


def create_participation_type_if_nonexistent(apps, schema_editor):
    """
    Function that creates the ParticipationType "High weight genes"
    and assigns it to all the existing Participation objects if
    no ParticipationTypes were previously in the database.
    """
    if not ParticipationType.objects.exists():
        new_participation_type = ParticipationType.objects.create(
            name="High weight genes", description="A high weight gene in a "
            "signature is a genes whose weight is more than 2.5 standard "
            "deviations away from the mean weight of genes in that node."
        )

        for participation_obj in Participation.objects.all():
            participation_obj.participation_type = new_participation_type
            participation_obj.save()


class Migration(migrations.Migration):

    dependencies = [
        ('analyze', '0008_auto_20170501_1359'),
    ]

    operations = [
        migrations.RunPython(create_participation_type_if_nonexistent),
    ]
