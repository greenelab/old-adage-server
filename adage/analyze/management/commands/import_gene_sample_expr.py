#!/usr/bin/env python

"""
This management command reads an input file of gene-sample expression values
and load the valild data into the database.  It should be invoked like this:

  python manage.py import_gene_sample_expr <expression_filename>

If a data source (on the first row) or gene name (on the c=first column) is
not found in the database, a warning message will be generated and the
corresponding rows or columns will be skipped.
"""


from __future__ import print_function
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from genes.models import Gene
from analyze.models import Sample, ExpressionValue

import logging
logger = logging.getLogger(__name__)
logger.addHandler(logging.NullHandler())


class Command(BaseCommand):
    help = ("Import gene-sample expression values from an input file.")

    def add_arguments(self, parser):
        parser.add_argument('expression_filename', type=file)

    def handle(self, **options):
        try:
            import_expr(options['expression_filename'])
            self.stdout.write(self.style.NOTICE(
                "Imported gene-sample expression values successfully"))
        except Exception as e:
            raise CommandError(
                "Raised exception when importing gene-sample expression "
                "values: %s" % e)


def import_expr(file_handle):
    """
    Function that reads input file and load gene-sample expression values
    into the database.
    """

    # Enclose reading/importing process in a transaction context manager.
    # Any exception raised inside the manager will terminate the transaction
    # and roll back the database.
    with transaction.atomic():
        samples = []
        for line_index, line in enumerate(file_handle):
            tokens = line.rstrip('\r\n').split('\t')
            if line_index == 0:
                tokens = tokens[1:]
                read_header(tokens, samples)
            else:
                import_data_line(line_index + 1, tokens, samples)


def read_header(tokens, samples):
    """
    Read input tokens on header line and save the corresponding sample
    object into "samples". (Each token will be searched in the database
    using "ml_data_source" field. If a token does not match any sample's
    ml_data_source, put None into "samples".)

    An exception will be raised if any of the following errors is detected:
      * Sample token is blank (null or consists of space characters only);
      * Sample token is duplicate;
    """

    token_set = set()
    for index, data_source in enumerate(tokens):
        if not data_source or data_source.isspace():
            raise Exception("Input file line #1 column #%d: blank data_source"
                            % index + 2)
        elif data_source in token_set:
            raise Exception("Input file line #1 column #%d: %s is duplicate" %
                            (index + 2, data_source))
        else:
            try:
                token_set.add(data_source)
                sample = Sample.objects.get(ml_data_source=data_source)
                samples.append(sample)
            except Sample.DoesNotExist:
                samples.append(None)
                logger.warn(
                    "Input file line #1: data_source in column #%d not found "
                    "in the database: %s", index + 2, data_source)


def import_data_line(line_num, tokens, samples):
    """
    Function that imports numerical values in input tokens into the database.
    An exception will be raised if any of the following errors is detected:
      * The number of columns on this line is not equal to the number of
        samples plus 1.
      * The gene's "systematic_name" field (column #1) is blank;
      * Data field (from column #2 to the end) can not be converted into a
        float type.
    """

    if len(tokens) != len(samples) + 1:
        raise Exception("Input file line #%d: Number of columns is not %d" %
                        (line_num, len(samples) + 1))

    gene_name = tokens[0]
    if not gene_name or gene_name.isspace():
        raise Exception("Input file line #%d: gene systematic_name (column #1)"
                        " is blank" % line_num)

    try:
        gene = Gene.objects.get(systematic_name=gene_name)
    except Gene.DoesNotExist:
        # If a gene is not found in database, generate a warning message
        # and skip this line.
        logger.warn(
            "Input file line #%d: gene systematic_name (column #1) is not "
            "found in the database: %s", line_num, gene_name)
        return

    values = tokens[1:]
    # To speed up the importing process, all expression values on current data
    # line will be saved in "records" and created in bulk at the end.
    records = []
    col_num = 2   # Expression values start from column #2.
    for sample, value in zip(samples, values):
        try:
            float_val = float(value)
        except ValueError:
            raise Exception("Input file line #%d column #%d: %s is not numeric"
                            % (line_num, col_num, value))
        if sample is not None:
            records.append(
                ExpressionValue(sample=sample, gene=gene, value=float_val))
        col_num += 1
    ExpressionValue.objects.bulk_create(records)  # Create records in bulk.
