#!/usr/bin/env python

"""
Load activity spreadsheet (generated by Jie) into the database.
This module should be invoked as a management command:

  python manage.py import_activity <activity_filename> <ml_model_name>

The two required arguments of this commands are:
  (1) activity_filename: a tab-delimited activity spreadsheet;
  (2) ml_model_name: machine learning model's name that corresponds to
      activity_filename;

IMPORTANT:
Before running this command, please make sure that ml_model_name already
exists in the database.  If it doesn't, you can use the management
command "add_ml_model.py" to add it into the database.
"""

from __future__ import print_function
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from analyze.models import Sample, MLModel, Node, Activity

import logging
logger = logging.getLogger(__name__)
logger.addHandler(logging.NullHandler())


class Command(BaseCommand):
    help = ("Import activity data from an input  spreadsheet.")

    def add_arguments(self, parser):
        parser.add_argument('activity_file', type=file)
        parser.add_argument('ml_model_name', type=str)

    def handle(self, **options):
        try:
            import_activity(options['activity_file'],
                            options['ml_model_name'])
            self.stdout.write(self.style.NOTICE(
                "Imported activity data successfully"))
        except Exception as e:
            raise CommandError(
                "Failed to import activity data: import_activity raised "
                "an exception:\n%s" % e)


def import_activity(file_handle, ml_model_name):
    """
    Read the data in activity sheet into the database.
    This function first checks whether ml_model_name exists in the
    database, then call import_nodes() and import_activity_line() to
    populate "Node" and "Activity" tables in the database.
    """

    # Raise an exception if ml_model_name doesn't exist in the database.
    try:
        mlmodel = MLModel.objects.get(title=ml_model_name)
    except MLModel.DoesNotExist:
        raise Exception("Input ml_model_name %s does not exist in the database"
                        % ml_model_name)

    # Enclose reading/importing process in a transaction context
    # manager.  Any exception raised inside the manager will
    # terminate the transaction and roll back the database.
    with transaction.atomic():
        nodes = []
        for line_index, line in enumerate(file_handle):
            tokens = line.rstrip('\r\n').split('\t')
            if line_index == 0:
                nodes = tokens[1:]
                import_node_line(nodes, mlmodel)
            else:
                import_activity_line(line_index + 1, nodes, tokens, mlmodel)


def import_node_line(nodes, mlmodel):
    """
    Load input nodes into "Node" table in the database.

    This function will raise an exception if any of the following errors
    are detected:
      * Node name is blank (null or consists of space characters only);
      * Node name is duplicate;
      * The combination of Node name and given ml_model_name is not
        unique.
    """
    node_set = set()
    for index, name in enumerate(nodes):
        if not name or name.isspace():
            raise Exception("Input file line #1 column #%d: blank node name" %
                            index + 2)
        elif name in node_set:
            raise Exception("Input file line #1 column #%d: %s is NOT unique" %
                            (index + 2, name))
        elif Node.objects.filter(name=name, mlmodel=mlmodel).exists():
            raise Exception("Input file line #1 column #%d: Node name %s "
                            "already exists in Node table" % (index + 2, name))
        else:
            node_set.add(name)
            Node.objects.create(name=name, mlmodel=mlmodel)


def import_activity_line(line_num, nodes, tokens, mlmodel):
    """
    Load numerical values in input tokens into "Activity" table.

    This function will raise an exception if any of the following errors
    are detected on the data line:
      * The number of columns on this line is not equal to the number of
        nodes plus 1.
      * The data source field (in column #1) is blank;
      * Any field from column #2 to the end can not be converted into a
        float type.
    """
    if len(tokens) != len(nodes) + 1:
        raise Exception("Input file line #%d: Number of columns is not %d" %
                        (line_num, len(nodes) + 1))

    data_source = tokens[0]
    if not data_source or data_source.isspace():
        raise Exception("Input file line #%d: column #1 (data_source) is blank"
                        % line_num)

    try:
        sample = Sample.objects.get(ml_data_source=data_source)
    except Sample.DoesNotExist:
        # If data_source on the line is not found in Sample table, then
        # instead of raising an exception, generate a warning message
        # and skip this activity data line.
        logger.warn(
            "Input file line #%d: data_source in column #1 is not found in "
            "the database: %s", line_num, data_source)
        return

    values = tokens[1:]
    # In order to speed up the import, all activity records on the same
    # line will be saved in "records" and created in bulk at the end.
    records = []
    col_num = 2   # The numerical values start from column #2.
    for node_name, value in zip(nodes, values):
        try:
            float_val = float(value)
        except ValueError:
            raise Exception("Input file line #%d column #%d: %s can not be "
                            "converted into a float type" %
                            (line_num, col_num, value))

        node = Node.objects.get(name=node_name, mlmodel=mlmodel)
        records.append(Activity(sample=sample, node=node, value=float_val))
        col_num += 1
    Activity.objects.bulk_create(records)  # Create records in bulk.
