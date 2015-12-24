#!/usr/bin/env python
# coding: utf-8 (see https://www.python.org/dev/peps/pep-0263/)

from __future__ import unicode_literals
from __future__ import print_function
from django.core.management.base import BaseCommand, CommandError
import argparse
import sys, os
from operator import itemgetter
import logging
logger = logging.getLogger(__name__)

## import Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "adage.settings")
from analyze.models import Experiment, Sample, SampleAnnotation

## import ADAGE utilities
# we've stashed a copy of get_pseudo_sdrf here for deployment (see fabfile.py)
# sys.path.append(os.path.abspath('../../'))
sys.path.append(os.path.abspath('../../ADAGE/'))
import get_pseudo_sdrf as gp
import gen_spreadsheets as gs

JSON_CACHE_FILE_NAME = 'json_cache.p'

def main():
    # import_default_experiments()
    logger.error("This script is now a manage.py command. "\
            "Please invoke it that way.")

class Command(BaseCommand):
    # TODO modify to act as a manage.py command
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
                    "Data import encountered an error: bootstrap_database "\
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
        raise(RuntimeError("The following annotated experiments are missing "\
            "from ArrayExpress: [{:s}]".format(', '.join(missing_experiments))))
    # nothing missing, so proceed with importing!
    for e in ae_experiments:
        if e['accession'] in annotated_experiments:
            Experiment.objects.create(**e)
    
    # now that we have database records for every Experiment, we walk through 
    # the annotation spreadsheet and create records for Samples, linking each 
    # to one or more Experiment(s) and creating a SampleAnnotation for each 
    # as we go.
    mismatches = {} # mismatches indexed by sample and experiment ids
    for r in ss.rows():
        row_experiment = Experiment.objects.get(pk=r.accession)
        ## FIXME: filter out experiments with repeat samples for testing
        skip_experiments = ['E-GEOD-16970', 'E-GEOD-22684', 'E-GEOD-24036',
                'E-GEOD-24038', 'E-GEOD-25128', 'E-GEOD-25130', 'E-GEOD-28953',
                'E-GEOD-33241', 'E-GEOD-33244', 'E-GEOD-33245', 'E-GEOD-35286',
                'E-GEOD-65869', 'E-GEOD-65870', 'E-GEOD-65882']
        if row_experiment.accession in skip_experiments:
            logger.warn(("Skipping {sample} (experiment {accession}) for "\
                    "testing.").format(**r._asdict()))
            continue
        row_sample, created = Sample.objects.get_or_create(sample=r.sample)
        row_experiment.sample_set.add(row_sample)
        annotations = dict((k, v) 
            for k, v in r._asdict().items() if k not in \
                ('accession', 'sample', 'expt_summary'))
        if created:
            # a new sample was created so we need new annotations for it
            # row_sample_annotation = row_sample.sampleannotation.create(
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
                    ## In this section, we automatically handle several minor
                    ## data inconsistencies in the manually-generated annotation
                    ## spreadsheet and report the rest for follow-up
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
                    if not err_key in mismatches: mismatches[err_key] = []
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
                ("Sample '{key[0]}' in experiment {key[1]} does not match"\
                " experiment {key[2]}. (Check fields: {check})"\
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

def import_default_experiments():
    """
    Import metadata for a specific list of experiments from ArrayExpress into
    the Experiment model defined for the analyze Django app. Take advantage of
    the utilities we built within get_pseudo_sdrf.py for downloading and 
    parsing data from ArrayExpress.
    """
    ## use our ArrayExpress retriever to get the experiment descriptions 
    r = gp.AERetriever(ae_url=gp._AEURL_EXPERIMENTS)
    exps = r.ae_json_to_experiment_text()

    ## create a filter so we can select only the experiments we want
    # TODO pass in the data file on the command line and automate this conversion
    # generate this list with (datasets_list_* file from ADAGE_server on Dropbox):
    # > cut -f 1 datasets_list_02.22.2014.txt | python -c "import fileinput; print [ename.rstrip() for ename in fileinput.input()]"
    adage_exps = [
        'E-GEOD-9592', 'E-GEOD-46603', 'E-GEOD-24036', 'E-GEOD-25130', 
        'E-GEOD-13871', 'E-GEOD-7266', 'E-MEXP-87', 'E-GEOD-33275',
        'E-GEOD-31227', 'E-GEOD-9989', 'E-MEXP-1183', 'E-GEOD-24038',
        'E-GEOD-11544', 'E-GEOD-29879', 'E-GEOD-33160', 'E-GEOD-43641',
        'E-GEOD-48982', 'E-GEOD-35286', 'E-MEXP-2396', 'E-MEXP-2867',
        'E-GEOD-10030', 'E-GEOD-34762', 'E-MEXP-3764', 'E-GEOD-25945',
        'E-GEOD-29665', 'E-GEOD-29789', 'E-GEOD-25481', 'E-GEOD-51076',
        'E-GEOD-34141', 'E-GEOD-8083', 'E-GEOD-6769', 'E-GEOD-21508',
        'E-GEOD-39044', 'E-MEXP-3970', 'E-GEOD-8408', 'E-GEOD-33245',
        'E-GEOD-10604', 'E-GEOD-32032', 'E-GEOD-9991', 'E-GEOD-14253',
        'E-GEOD-47173', 'E-GEOD-21966', 'E-MEXP-3117', 'E-MTAB-1381',
        'E-GEOD-24784', 'E-GEOD-36753', 'E-GEOD-26142', 'E-GEOD-17179',
        'E-GEOD-35248', 'E-GEOD-51409', 'E-MEXP-2812', 'E-GEOD-23007',
        'E-GEOD-22665', 'E-GEOD-13252', 'E-GEOD-26931', 'E-GEOD-22999',
        'E-GEOD-33244', 'E-GEOD-28194', 'E-GEOD-17296', 'E-GEOD-29946',
        'E-GEOD-10065', 'E-GEOD-27674', 'E-MEXP-3459', 'E-GEOD-28953',
        'E-GEOD-12207', 'E-MEXP-2593', 'E-GEOD-10362', 'E-GEOD-40461',
        'E-GEOD-25595', 'E-GEOD-12678', 'E-GEOD-21704', 'E-GEOD-48587',
        'E-GEOD-9621', 'E-GEOD-13326', 'E-GEOD-7968', 'E-GEOD-41926',
        'E-GEOD-49759', 'E-GEOD-48429', 'E-GEOD-30967', 'E-GEOD-6741',
        'E-GEOD-33241', 'E-GEOD-33188', 'E-GEOD-36647', 'E-GEOD-4026',
        'E-GEOD-16970', 'E-GEOD-22164', 'E-GEOD-25128', 'E-GEOD-28719',
        'E-GEOD-30021', 'E-GEOD-35632', 'E-GEOD-18594', 'E-GEOD-26932',
        'E-GEOD-9255', 'E-GEOD-52445', 'E-GEOD-22684', 'E-GEOD-2430',
        'E-GEOD-9926', 'E-MEXP-1051', 'E-GEOD-9657', 'E-GEOD-15697',
        'E-GEOD-24262', 'E-GEOD-23367', 'E-MEXP-1591', 'E-GEOD-45695',
        'E-GEOD-25129', 'E-GEOD-33871', 'E-GEOD-34836', 'E-MEXP-2606',
        'E-GEOD-7704']

    ## create copies of only the experiment text we want in our Django database
    # note: if the print statement fails due to unicode translation, try this in the shell> export PYTHONIOENCODING=utf-8
    for e in exps:
        if e['accession'] in adage_exps: Experiment.objects.create(**e)

def import_sample_annotations(file_name):
    """
    Import metadata for samples from our manually-curated annotation 
    spreadsheet
    """
    ## use our spreadsheet generator to help parse the annotated spreadsheet
    ss = gs.parse_spreadsheet(file_name)
    for r in ss.rows():
        attributes = dict((k, v) 
            for k, v in r._asdict().items() if k not in ('accession'))
        row_sample = SampleAnnotation.objects.create(**attributes)
        row_expt = Experiment.objects.get(pk=r.accession)
        row_sample.experiments.add(row_expt)

if __name__ == '__main__':
    main()
