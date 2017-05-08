"""
This management command will save a new ParticipationType object to the
database with the 'name' and 'description' that are passed in the
command-line arguments. First argument after the command is the 'name'
argument and the second is the 'description' argument.

Example usage:
python manage.py create_or_update_participation_type "High-weight genes" \
    "High-weight genes are those that most strongly influence the node's ..."
"""

from __future__ import print_function
from django.core.management.base import BaseCommand, CommandError
from analyze.models import ParticipationType

import logging
logger = logging.getLogger(__name__)
logger.addHandler(logging.NullHandler())


class Command(BaseCommand):
    help = ("Creates a participation type in the database for the "
            "participation of genes in a node.")

    def add_arguments(self, parser):
        parser.add_argument('name', type=str)
        parser.add_argument('description', type=str)

    def handle(self, **options):
        try:
            (name, description) = (options['name'], options['description'])

            if not name or name.isspace():
                raise Exception("Name for participation type was not provided "
                                "or was blank.")
            elif not description or description.isspace():
                raise Exception("Description for participation type was not "
                                "provided or was blank.")
            else:
                try:
                    existing_pt = ParticipationType.objects.get(name=name)
                    existing_pt.description = description
                    existing_pt.save()
                    self.stdout.write(self.style.NOTICE(
                        "Description for participation type with name '%s' "
                        "has been updated." % name))

                except ParticipationType.DoesNotExist:
                    ParticipationType.objects.create(
                        name=name, description=description)

                    self.stdout.write(self.style.NOTICE(
                        "Participation type '%s' created "
                        "successfully." % name))

        except Exception as e:
            raise CommandError("Failed to create or update participation "
                               "type with data: %s" % e)
