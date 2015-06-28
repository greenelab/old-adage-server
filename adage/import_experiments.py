#!/usr/bin/env python
from __future__ import print_function
import sys, os, io

## import Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "adage.settings")
from analyze.models import Experiment

## import ADAGE utilities
sys.path.append(os.path.abspath('../../ADAGE'))
import get_pseudo_sdrf as gp

def main():
    ## invoke our ArrayExpress retriever to get the experiment descriptions to index
    r = gp.AERetriever(ae_url=gp._AEURL_EXPERIMENTS)
    exps = r.ae_json_to_experiment_text()

    ## create a filter so we can select only the experiments we want
    # generate this list with (datasets_list_* file from ADAGE_server on Dropbox):
    # > cut -f 1 datasets_list_02.22.2014.txt | python -c "import fileinput; print [ename.rstrip() for ename in fileinput.input()]"
    adage_exps = ['E-GEOD-9592', 'E-GEOD-46603', 'E-GEOD-24036', 'E-GEOD-25130', 'E-GEOD-13871', 'E-GEOD-7266', 'E-MEXP-87', 'E-GEOD-33275', 'E-GEOD-31227', 'E-GEOD-9989', 'E-MEXP-1183', 'E-GEOD-24038', 'E-GEOD-11544', 'E-GEOD-29879', 'E-GEOD-33160', 'E-GEOD-43641', 'E-GEOD-48982', 'E-GEOD-35286', 'E-MEXP-2396', 'E-MEXP-2867', 'E-GEOD-10030', 'E-GEOD-34762', 'E-MEXP-3764', 'E-GEOD-25945', 'E-GEOD-29665', 'E-GEOD-29789', 'E-GEOD-25481', 'E-GEOD-51076', 'E-GEOD-34141', 'E-GEOD-8083', 'E-GEOD-6769', 'E-GEOD-21508', 'E-GEOD-39044', 'E-MEXP-3970', 'E-GEOD-8408', 'E-GEOD-33245', 'E-GEOD-10604', 'E-GEOD-32032', 'E-GEOD-9991', 'E-GEOD-14253', 'E-GEOD-47173', 'E-GEOD-21966', 'E-MEXP-3117', 'E-MTAB-1381', 'E-GEOD-24784', 'E-GEOD-36753', 'E-GEOD-26142', 'E-GEOD-17179', 'E-GEOD-35248', 'E-GEOD-51409', 'E-MEXP-2812', 'E-GEOD-23007', 'E-GEOD-22665', 'all-pseudomonas', 'E-GEOD-13252', 'E-GEOD-26931', 'E-GEOD-22999', 'E-GEOD-33244', 'E-GEOD-28194', 'E-GEOD-17296', 'E-GEOD-29946', 'E-GEOD-10065', 'E-GEOD-27674', 'E-MEXP-3459', 'E-GEOD-28953', 'E-GEOD-12207', 'E-MEXP-2593', 'E-GEOD-10362', 'E-GEOD-40461', 'E-GEOD-25595', 'E-GEOD-12678', 'E-GEOD-21704', 'E-GEOD-48587', 'E-GEOD-9621', 'E-GEOD-13326', 'E-GEOD-7968', 'E-GEOD-41926', 'E-GEOD-49759', 'E-GEOD-48429', 'E-GEOD-30967', 'E-GEOD-6741', 'E-GEOD-33241', 'E-GEOD-33188', 'E-GEOD-36647', 'E-GEOD-4026', 'E-GEOD-16970', 'E-GEOD-22164', 'E-GEOD-25128', 'E-GEOD-28719', 'E-GEOD-30021', 'E-GEOD-35632', 'E-GEOD-18594', 'E-GEOD-26932', 'E-GEOD-9255', 'E-GEOD-52445', 'E-GEOD-22684', 'E-GEOD-2430', 'E-GEOD-9926', 'E-MEXP-1051', 'E-GEOD-9657', 'E-GEOD-15697', 'E-GEOD-24262', 'E-GEOD-23367', 'E-MEXP-1591', 'E-GEOD-45695', 'E-GEOD-25129', 'E-GEOD-33871', 'E-GEOD-34836', 'E-MEXP-2606', 'E-GEOD-7704']

    ## create copies of only the experiment text we want in our Django database
    # note: if the print statement fails due to unicode translation, try this in the shell> export PYTHONIOENCODING=utf-8
    for e in exps:
        if e['accession'] in adage_exps: Experiment.objects.create(**e)

if __name__ == '__main__':
    main()
