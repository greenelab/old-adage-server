#!/usr/bin/env python
# coding: utf-8 (see https://www.python.org/dev/peps/pep-0263/)

from __future__ import unicode_literals
from __future__ import print_function
from django.core.management.base import BaseCommand, CommandError
import argparse
import sys
import os
from operator import itemgetter
import logging
logger = logging.getLogger(__name__)

# import Django environment
from analyze.models import Experiment, Sample, SampleAnnotation

# import ADAGE utilities
# we've stashed a copy of get_pseudo_sdrf here for deployment (see fabfile.py)
# FIXME: Importing this way is fragile. We need to (a) move the code we need
#        from `get_pseudo_sdrf` and `gen_spreadsheets` in the `ADAGE`
#        repository into `adage-server` or (b) make the code we need into a
#        pip-installable utility package that gets imported by both the `ADAGE`
#        project and the `adage-server` project.
sys.path.append(os.path.abspath('../../'))
import get_pseudo_sdrf as gp
import gen_spreadsheets as gs

JSON_CACHE_FILE_NAME = 'json_cache.p'


def main():
    logger.error("This script is now a manage.py command. "
            "Please invoke it that way.")


class Command(BaseCommand):
    help = 'Imports data to initialize the database with Experiment, Sample '\
            'and SampleAnnotation records.'

    def add_arguments(self, parser):
        parser.add_argument('annotation_file', type=argparse.FileType('r'))

    def handle(self, **options):
        try:
            bootstrap_database(options['annotation_file'])
            self.stdout.write(
                    self.style.SUCCESS("Data import succeeded"))
        except Exception as e:
            raise CommandError(
                    "Data import encountered an error: bootstrap_database "
                    "threw an exception:\n%s" % e)


def bootstrap_database(annotation_fh, dir_name=None):
    """
    Import initial experiment, sample and annotation data to initialize the
    ADAGE database. Assumes we are starting with an empty database, so this
    will fail if any existing data are found that conflict with what is being
    imported.

    `annotation_fh`: a file handle open to the beginning of a UTF-8 plain text
    format of the annotated spreadsheet data (including a .CEL file column).
    File format is expected to match what is exported by
    gen_spreadsheets.gen_spreadsheets().

    `dir_name`: a directory for storing .sdrf.txt files to be downloaded by
    get_pseudo_sdrf.download_sdrf_to_dir(). If no `dir_name` is supplied, the
    current working directory will be used. This collection of files constitutes
    an authoritative reference for what samples comprise each experiment. In
    addition, a cache containing a record of the JSON data retrieved from
    ArrayExpress will be saved here.

    This function will raise errors if it is unable to complete successfully,
    and it will exit with no error if it succeeds in initializing the database.
    """
    if not dir_name: dir_name = os.getcwd()
    if not os.path.isdir(dir_name):
        os.mkdir(dir_name)
    ss = gs.Spreadsheet()
    ss.parse_txt_file(annotation_fh)

    # download all experiment attributes from ArrayExpress and create an
    # Experiment in the database for each matching experiment found in the
    # annotation spreadsheet. Raise an error if any annotated experiment
    # cannot be found in the data retrieved from ArrayExpress.
    ae_retriever = gp.AERetriever(ae_url=gp._AEURL_EXPERIMENTS,
        cache_file_name=os.path.join(dir_name, JSON_CACHE_FILE_NAME))
    ae_experiments = ae_retriever.ae_json_to_experiment_text()
    annotated_experiments = ss.get_experiment_ids()
    # we can fail fast by checking for missing experiments before we start
    missing_experiments = frozenset(annotated_experiments) - \
        frozenset([e['accession'] for e in ae_experiments])
    if missing_experiments:
        raise(RuntimeError(("The following annotated experiments are missing "
                "from ArrayExpress: [{:s}]").format(
                        ', '.join(missing_experiments)
                )
        ))
    # nothing missing, so proceed with importing!
    for e in ae_experiments:
        if e['accession'] in annotated_experiments:
            Experiment.objects.create(**e)

    # now that we have database records for every Experiment, we walk through
    # the annotation spreadsheet and create records for Samples, linking each
    # to one or more Experiment(s) and creating a SampleAnnotation for each
    # as we go.
    mismatches = {}  # mismatches indexed by sample and experiment ids
    for r in ss.rows():
        row_experiment = Experiment.objects.get(pk=r.accession)
        row_sample, created = Sample.objects.get_or_create(sample=r.sample)
        row_experiment.sample_set.add(row_sample)
        annotations = dict((k, v)
            for k, v in r._asdict().items() if k not in \
                ('accession', 'sample', 'expt_summary'))
        if created:
            # a new sample was created so we need new annotations for it
            row_sample_annotation = SampleAnnotation(
                sample=row_sample,
                **annotations)
            row_sample_annotation.save()
        else:
            # sample was already present, so check if our annotations match
            existing_annotation = SampleAnnotation.objects.get(sample=r.sample)
            existing_annotation_dict = existing_annotation.__dict__
            existing_annotation_changed = False
            for k, v in annotations.iteritems():
                if existing_annotation_dict[k] != v:
                    # In this section, we automatically handle several minor
                    # data inconsistencies in the manually-generated annotation
                    # spreadsheet and report the rest for follow-up
                    if existing_annotation_dict[k] == "" and v != "":
                        # data trump emptiness: update the existing annotation
                        setattr(existing_annotation, k, v)
                        existing_annotation_changed = True
                        continue
                    elif existing_annotation_dict[k] != "" and v == "":
                        # all okay here: nothing new to add.
                        continue
                    elif existing_annotation_dict[k].lower() == v.lower():
                        # don't care about minor differences in case
                        continue
                    elif existing_annotation_dict[k].lower().startswith(
                            v.lower()):
                        # nothing new to add (new annotation is a subset of
                        # what's there already)
                        continue
                    elif v.lower().startswith(
                            existing_annotation_dict[k].lower()):
                        # let's take the longer explanation (new annotation is
                        # a strict superset of what was provided already)
                        setattr(existing_annotation, k, v)
                        existing_annotation_changed = True
                        continue
                    # We organize our lists of mismatched fields by `sample`
                    # and the pair of experiments with conflicting annotations
                    # so we can report them at the end.  Build the err_key as:
                    # (sample, experiment, existing_experiment)
                    existing_experiment = existing_annotation.sample.\
                            experiments.exclude(accession=r.accession)[0]
                    err_key = (
                        r.sample,
                        r.accession,
                        existing_experiment.accession
                    )
                    if err_key not in mismatches: mismatches[err_key] = []
                    mismatches[err_key].append(k)
            if existing_annotation_changed:
                existing_annotation.save()
    if mismatches:
        # sort err_keys to match original spreadsheet order
        sorted_err_keys = sorted(mismatches.keys(), key=itemgetter(2, 0))
        warning_detail = []
        for key in sorted_err_keys:
            v = mismatches[key]
            # modify first element in ss.get_sample_row() to use gs._summary_url
            experiment_link = '=HYPERLINK("{url}", "{acc}")'.format(
                    url=(gs._summary_url % "{acc}"), acc="{acc}")
            e1 = list(ss.get_sample_row(key[1], key[0]))
            e1[0] = experiment_link.format(acc=e1[0])
            e2 = list(ss.get_sample_row(key[2], key[0]))
            e2[0] = experiment_link.format(acc=e2[0])
            warning_detail.append(
                ("Sample '{key[0]}' in experiment {key[1]} does not match"
                " experiment {key[2]}. (Check fields: {check})"
                "\n\t{e1}\n\t{e2}").format(
                    key=key, check=', '.join(v),
                    e1='\t'.join(e1),
                    e2='\t'.join(e2),
                )
            )
        logger.warn("Annotation mismatches found:\n{}".format(
                '\n'.join(warning_detail)))
        raise(RuntimeError(('Annotation mismatches found. Total: {} samples '\
                '(see warnings).').format(len(mismatches))
        ))


if __name__ == '__main__':
    main()
