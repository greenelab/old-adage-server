"""
Management command that deletes a ParticipationType object in the
database that matches a certain 'name'. If there are no existing
ParticipationType objects with that 'name' in the database, a message
will be printed to the terminal stating this.

Example usage:
python manage.py delete_participation_type "High-weight genes"
"""

from __future__ import print_function
from django.core.management.base import BaseCommand, CommandError
from analyze.models import ParticipationType

import logging
logger = logging.getLogger(__name__)
logger.addHandler(logging.NullHandler())


class Command(BaseCommand):
    help = ("Deletes a participation type in the database.")

    def add_arguments(self, parser):
        parser.add_argument('name', type=str)

    def handle(self, **options):
        try:
            name = options['name']

            if not name or name.isspace():
                raise Exception("Name for participation type was not provided "
                                "or was blank.")
            else:
                try:
                    existing_pt = ParticipationType.objects.get(name=name)
                    existing_pt.delete()
                    self.stdout.write(self.style.NOTICE(
                        "Participation type with name '%s' has been deleted." %
                        name))

                except ParticipationType.DoesNotExist:
                    self.stdout.write(self.style.NOTICE(
                        "Participation type with name '%s' was not found" %
                        name))

        except Exception as e:
            raise CommandError(
                "Failed to delete participation type with data: %s" % e)
