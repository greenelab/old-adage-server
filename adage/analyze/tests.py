# coding: utf-8 (see https://www.python.org/dev/peps/pep-0263/)

from __future__ import unicode_literals
import os, re, sys
import codecs
import unittest

from django.test import TestCase
from analyze.models import Experiment, Sample, SampleAnnotation
from import_data import bootstrap_database, JSON_CACHE_FILE_NAME
from datetime import datetime
from tastypie.test import ResourceTestCase

sys.path.append(os.path.abspath('../../ADAGE/'))
import get_pseudo_sdrf as gp
import logging
logger = logging.getLogger(__name__)

DATA_DIR = os.path.abspath('../data')
ANNOTATION_FILE_NAME = "Pseudomonas Annotation_complete-20151203-withCEL.txt"

class ModelsTestCase(TestCase):
    """
    Test all aspects of defining and manipulating models here
    """
    experiment_data = {
        'accession':    'E-GEOD-31227',
        'name':         'Expression data of Pseudomonas aeruginosa isolates '\
                        'from Cystic Fibrosis patients in Denmark',
        'description':  'CF patients suffer from chronic and recurrent '\
                'respiratory tract infections which eventually lead to lung '\
                'failure followed by death. Pseudomonas aeruginosa is one '\
                'of the major pathogens for CF patients and is the principal '\
                'cause of mortality and morbidity in CF patients. Once it '\
                'gets adapted, P. aeruginosa can persist for several decades '\
                'in the respiratory tracts of CF patients, overcoming host '\
                'defense mechanisms as well as intensive antibiotic '\
                'therapies. P. aeruginosa CF strains isolated from different '\
                'infection stage were selected for RNA extraction and '\
                'hybridization on Affymetrix microarrays. Two batch of P. '\
                'aeruginosa CF isolates are chosen : 1) isolates from a '\
                'group of patients since 1973-2008 as described in ref '\
                '(PMID: 21518885); 2) isolates from a group of newly '\
                'infected children as described in ref (PMID: 20406284).'
    }
    
    sample_list = [
        'GSM774085 1',
    ]
    
    @staticmethod
    def create_test_experiment(experiment_data=None):
        """Create an experiment record to use for tests"""
        if experiment_data == None:
            experiment_data = ModelsTestCase.experiment_data
        return Experiment.objects.create(**experiment_data)
    
    def test_create_experiment(self):
        """Experiment is persisted in the database without errors"""
        self.create_test_experiment()
        obj = Experiment.objects.get(pk=self.experiment_data['accession'])
        self.assertEqual(obj.name, self.experiment_data['name'])
    
    def test_create_sample_solo(self):
        """Sample is persisted in the database without errors"""
        Sample.objects.create(sample=self.sample_list[0])
        obj = Sample.objects.get(pk=self.sample_list[0])
        self.assertEqual(obj.sample, self.sample_list[0])
    
    def test_create_sample_linked(self):
        """
        Sample is persisted in the database and linked to an Experiment without 
        errors
        """
        exp_obj = self.create_test_experiment()
        exp_obj.sample_set.create(sample=self.sample_list[0])
        # obj = Sample.objects.create(sample=self.sample_list[0])
        # obj.experiments.add(exp_obj)
        obj2 = Sample.objects.get(pk=self.sample_list[0])
        self.assertEqual(obj2.sample, self.sample_list[0])
        self.assertEqual(obj2.experiments.all()[0].accession, 'E-GEOD-31227')


# @unittest.skip("focus on other tests for now")
class BootstrapDBTestCase(TestCase):
    """
    Test the process of loading the database with initial "bootstrap" data.
    There are three data sources involved in bootstrapping the database:
    (1) ArrayExpress, the authority about experiments and samples
    (2) annotations spreadsheet, with our annotated sample data
    (3) a "sample list" from Jie, which maps experiments to samples used 
        by the ADAGE model
    All three sources should agree with one another, so this class has
    several test cases to check for that agreement.
    """
    @classmethod
    def setUpClass(self):
        """
        Bootstrap a test database using a real database initialization
        """
        super(BootstrapDBTestCase, self).setUpClass()
        self.cache_dir_name = os.path.join(DATA_DIR, 
                "bootstrap_cache_{:%Y%m%d}".format(datetime.now()))
        # n.b. we need a plain bytestream for use with unicodecsv, so this 
        # open() call is correct even though we are opening a Unicode file.
        with open(os.path.join(DATA_DIR, ANNOTATION_FILE_NAME), 
                mode='rb') as anno_fh:
            try:
                bootstrap_database(anno_fh, dir_name=self.cache_dir_name)
                logger.info("bootstrap_database succeeded.")
            except Exception as e:
                logger.warn("bootstrap_database threw an exception", exc_info=1)
    
    def test_example_experiment(
            self, 
            test_experiment=ModelsTestCase.experiment_data):
        """
        The experiment_data from ModelsTestCase are real data that should have 
        been loaded during bootstrap_database. Check that it worked.
        """
        e = Experiment.objects.get(pk=test_experiment['accession'])
        self.assertEqual(e.accession, test_experiment['accession'])
        self.assertEqual(e.name, test_experiment['name'])
        self.assertEqual(e.description, test_experiment['description'])
    
    def test_arrayexpress_metadata(self):
        """
        Ensure that `name` and `description` for each Experiment match what we 
        retrieved from ArrayExpress by peeking at the JSON cache we saved during
        bootstrap_database()
        """
        ae_experiments = gp.AERetriever(
                ae_url=gp._AEURL_EXPERIMENTS,
                cache_file_name=os.path.join(self.cache_dir_name, 
                                             JSON_CACHE_FILE_NAME)
                ).ae_json_to_experiment_text()
        for e in ae_experiments:
            if Experiment.objects.filter(pk=e['accession']).exists():
                self.test_example_experiment(test_experiment=e)
    
    # @unittest.skip("annotations are inconsistent")
    def test_annotations_import_export_match(self):
        """
        Ensure that exported data match what we imported with bootstrap_database
        """
        # for our test, we need to independently confirm that the import worked
        # so we now re-open the file with the matching 'utf-8' encoding and 
        # then minimally process the lines so we can compare our results with 
        # the database export
        db_import = []
        with codecs.open(os.path.join(DATA_DIR, ANNOTATION_FILE_NAME),
                mode='rb', encoding='utf-8') as anno_fh:
            last_col = re.compile(ur'\t[^\t]*$', flags=re.UNICODE)
            for line in anno_fh:
                line = last_col.sub(u'', line)   # strip off last column
                db_import.append(line)
        
        db_export = []
        for e in Experiment.objects.all():
            for s in e.sample_set.all():
                sa = s.sampleannotation
                print(sa.sample)
                db_export.append(u'\t'.join([e.accession, s.sample, sa.cel_file, 
                        sa.strain, sa.genotype, sa.abx_marker,
                        sa.variant_phenotype, sa.medium, sa.treatment,
                        sa.biotic_int_lv_1,
                        sa.biotic_int_lv_2, sa.growth_setting_1,
                        sa.growth_setting_2, sa.nucleic_acid, sa.temperature,
                        sa.od, sa.additional_notes, sa.description,
                        ]))
        self.maxDiff = None     # report all diffs to be most helpful
        self.assertItemsEqual(db_export, db_import)


class APIResourceTestCase(ResourceTestCase):
    # API tests:
    # For all of our interfaces, we should be able to GET, but every other 
    # REST API should fail: POST, PUT, PATCH, DELETE
    
    baseURI = '/api/v0/'
    
    def setUp(self):
        super(APIResourceTestCase, self).setUp()
        
        # create a test experiment to retrive with the API
        self.test_experiment = ModelsTestCase.experiment_data
        ModelsTestCase.create_test_experiment(
                experiment_data = self.test_experiment)
        self.experimentURI = (self.baseURI + 
                'experiment/{accession}/'.format(**self.test_experiment))
        
        # create some test samples to retrieve with the API
        # TODO stopped here
    
    def test_experiment_get(self):
        """
        We should be able to GET data from our test experiment via the API
        """
        # TODO is there a good way to run this method on a bootstrapped db?
        # print(self.experimentURI)
        resp = self.api_client.get(self.experimentURI, data={'format': 'json'})
        # print("vars: %s" % vars(resp))
        # print("resp: %s" % resp)
        self.assertValidJSONResponse(resp)
        e = self.deserialize(resp)
        self.assertEqual(e['accession'], self.test_experiment['accession'])
        self.assertEqual(e['name'], self.test_experiment['name'])
        self.assertEqual(e['description'], self.test_experiment['description'])
        # this line doesn't work because we have only a small test database
        # self.assertEqual(len(e[sample_set]), 78)
    
    def test_experiment_non_get(self):
        """
        We should not be able to POST, PUT, PATCH or DELETE
        """
        resp = self.api_client.post(self.experimentURI, data={'format': 'json'})
        self.assertHttpMethodNotAllowed(resp)
        resp = self.api_client.put(self.experimentURI, data={'format': 'json'})
        self.assertHttpMethodNotAllowed(resp)
        resp = self.api_client.patch(
                self.experimentURI, data={'format': 'json'})
        self.assertHttpMethodNotAllowed(resp)
        resp = self.api_client.delete(
                self.experimentURI, data={'format': 'json'})
        self.assertHttpMethodNotAllowed(resp)
    
    def test_sample_get(self):
        """
        We should be able to GET data from our test sample via the API
        """
        pass
    
    # def test_search_api(self):
    #     """
    #     Basic test using bootstrapped data that the search API works
    #     """
        
