"""
This management command will read an input gene-gene network file and
populate the "Edge" table in the database.  A valid input file must be
tab-delimited and each line should include 4 columns:

  (1) System name of "from" gene;
  (2) System name of "to" gene;
  (3) Weight of correlation between "from" and "to" genes;
  (4) Sign of the weight (either "+" or "-");

The file's first line will be ignored because it only has column names.
Here is an example input file:
  adage-server/adage/data/eADAGE_net300_allNodes_ADAGEnet_PAID_corCutoff0.4.txt

The command requires two arguments:
  (1) gene_network_file;
  (2) ml_model_name: the name of machine learning model that corresponds
      to gene_network_file.

For example, to import the data lines in an input file "eADAGE.txt" whose
machine leaning model is "Ensemble ADAGE 300", we will type:
  python manage.py import_gene_network /path/of/eADAGE.txt "Ensemble ADAGE 300"

IMPORTANT: Before running this command, please make sure that ml_model_name
already exists in "MLModel" table of the database.
"""

from __future__ import print_function
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from genes.models import Gene
from analyze.models import MLModel, Edge

import logging
logger = logging.getLogger(__name__)
logger.addHandler(logging.NullHandler())

NUM_COLUMNS = 4


class Command(BaseCommand):
    help = ("Imports gene-gene network data into Edge table in the database.")

    def add_arguments(self, parser):
        parser.add_argument('gene_network_file', type=file)
        parser.add_argument('ml_model_name', type=str)

    def handle(self, **options):
        try:
            import_network(options['gene_network_file'],
                           options['ml_model_name'])
            self.stdout.write(self.style.NOTICE(
                "Gene-gene network data imported successfully"))
        except Exception as e:
            raise CommandError(
                "Gene-gene network data import encountered an error: %s" % e)


def import_network(file_handle, ml_model_name):
    """
    This function takes care of network data importing.  It first
    validates input ml_model_name, then read each valid data line in the
    input file into the database.  If any error is detected, it will
    throw an exception. The whole reading/importing process is enclosed
    in a transaction context manager so that any exception thrown during
    this process will roll back the database.  More details can be found
    at:
    https://docs.djangoproject.com/en/dev/topics/db/transactions/#controlling-transactions-explicitly
    """

    # Check whether ml_model_name exists in the database's "MLModel" table.
    try:
        ml_model = MLModel.objects.get(title=ml_model_name)
    except MLModel.DoesNotExist:
        raise Exception("%s does NOT exist in the database" % ml_model_name)

    # Put reading process in a transaction.
    with transaction.atomic():
        check_and_import(file_handle, ml_model)


def check_and_import(file_handle, ml_model):
    """
    Read valid data lines into the database.  An exception will be thrown
    for any errors detected in file_handle.
    """
    gene_pairs_in_file = set()
    for line_index, line in enumerate(file_handle):
        # Skip the first line, which includes column names only.
        if line_index == 0:
            continue

        # Check the number of columns in the line.
        tokens = line.rstrip('\n').split('\t')
        if len(tokens) != NUM_COLUMNS:
            raise Exception("Input file line #%d: number of fields is not "
                            "%d" % (line_index + 1, NUM_COLUMNS))

        # Check whether we can convert the combination of column #4 and
        # #3 to a floating point value.
        try:
            weight = float(tokens[3] + tokens[2])
        except ValueError:
            raise Exception("Input file line #%d: %s can not be converted "
                            "into floating point value"
                            % (line_index + 1, tokens[3] + tokens[2]))

        # Check whether the converted floating point value in the range
        # of [-1.0, 1.0].
        if weight < -1.0 or weight > 1.0:
            raise Exception("Input file line #%d: %s is not a floating point "
                            "value in [-1.0, 1.0]" % (line_index + 1,
                                                      tokens[3] + tokens[2]))

        # Check whether the pair of (column #1, column #2) is duplicate
        # in the file.
        pair01 = tokens[0] + '\t' + tokens[1]
        if pair01 in gene_pairs_in_file:
            raise Exception("Input file line #%d: The pair of (%s, %s) is "
                            "duplicate inside the file"
                            % (line_index + 1, tokens[0], tokens[1]))
        # Check whether the pair of (column #1, column #2) is duplicate
        # in the file.
        pair10 = tokens[1] + '\t' + tokens[0]
        if pair10 in gene_pairs_in_file:
            raise Exception("Input file line #%d: The pair of (%s, %s) is "
                            "duplicate inside the file"
                            % (line_index + 1, tokens[1], tokens[0]))

        # Keep track of all pairs of (column #1, column #2) that we have
        # processed so that we can check the duplicate in the file later.
        gene_pairs_in_file.add(pair01)

        # If token[0] does not match one and only one gene's
        # systematic_name field in the database, skip the line.
        gene1 = find_gene(line_index + 1, tokens[0])
        if not gene1:
            continue

        # If token[1] does not match one and only one gene's
        # systematic_name field in the database, skip the line.
        gene2 = find_gene(line_index + 1, tokens[1])
        if not gene2:
            continue

        # Check whether the triplet (ml_model, gene1, gene2) is unique.
        if not unique_together(ml_model, gene1, gene2):
            raise Exception("Input file line #%d: (%s, %s, %s) is not unique-"
                            "together in the database" % (line_index + 1,
                                                          tokens[0], tokens[1],
                                                          ml_model.title))

        # Import the valid data line into the database.
        Edge.objects.create(mlmodel=ml_model, gene1=gene1, gene2=gene2,
                            weight=weight)


def find_gene(line_num, systematic_name):
    """
    This function returns the gene record in the database whose
    systematic_name matches the input "systematci_name".  If no gene is
    found or multiple genes exist in the database, it will generate a
    warning and return None.
    """
    try:
        gene = Gene.objects.get(systematic_name=systematic_name)
    except Gene.DoesNotExist:
        logger.warning("Input file line #%d will be skipped: gene name %s "
                       "does not exist in the database"
                       % (line_num, systematic_name))
        return None
    except Gene.MultipleObjectsReturned:
        logger.warning("Input file line #%d will be skipped: gene name %s "
                       "matches multiple genes in the database"
                       % (line_num, systematic_name))
        return None

    return gene


def unique_together(ml_model, gene1, gene2):
    """
    Check whether the triplet of (ml_model, gene1, gene2) or
    (ml_model, gene2, gene1) already exists in the database.  Although
    this "unique together" constraint has been enforced at database
    level, it is still checked explicitly here so that the invalid
    line's number in input file will be reported too.
    """
    # Because of the database's "unique together" constraint, the two
    # get() methods inside "try" blocks will never throw
    # MultipleObjectsReturned exception.
    try:
        Edge.objects.get(mlmodel=ml_model, gene1=gene1, gene2=gene2)
        return False
    except Edge.DoesNotExist:
        pass

    try:
        Edge.objects.get(mlmodel=ml_model, gene1=gene2, gene2=gene1)
        return False
    except Edge.DoesNotExist:
        return True
