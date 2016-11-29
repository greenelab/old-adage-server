# coding: utf-8 (see https://www.python.org/dev/peps/pep-0263/)

from __future__ import unicode_literals
from __future__ import print_function
import os
import random
import re
import sys
import codecs
import unittest

from django.db.models import Q
from django.test import TestCase
from organisms.models import Organism
from genes.models import Gene
from analyze.models import Experiment, Sample, AnnotationType, SampleAnnotation
from analyze.models import MLModel, Node, Activity, Edge, Participation
from analyze.management.commands.import_data import (
    bootstrap_database, JSON_CACHE_FILE_NAME)
from datetime import datetime
from tastypie.test import ResourceTestCaseMixin
from fixtureless import Factory

sys.path.append(os.path.abspath('../../'))
import get_pseudo_sdrf as gp
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
factory = Factory()

from adage.settings import CONFIG
from analyze.api import SampleResource


class ModelsTestCase(TestCase):
    """
    Test all aspects of defining and manipulating models here
    """
    experiment_data = {
        'accession':    'E-GEOD-31227',
        'name':         'Expression data of Pseudomonas aeruginosa isolates '
                        'from Cystic Fibrosis patients in Denmark',
        'description':  'CF patients suffer from chronic and recurrent '
                'respiratory tract infections which eventually lead to lung '
                'failure followed by death. Pseudomonas aeruginosa is one '
                'of the major pathogens for CF patients and is the principal '
                'cause of mortality and morbidity in CF patients. Once it '
                'gets adapted, P. aeruginosa can persist for several decades '
                'in the respiratory tracts of CF patients, overcoming host '
                'defense mechanisms as well as intensive antibiotic '
                'therapies. P. aeruginosa CF strains isolated from different '
                'infection stage were selected for RNA extraction and '
                'hybridization on Affymetrix microarrays. Two batch of P. '
                'aeruginosa CF isolates are chosen : 1) isolates from a '
                'group of patients since 1973-2008 as described in ref '
                '(PMID: 21518885); 2) isolates from a group of newly '
                'infected children as described in ref (PMID: 20406284).'
    }

    sample_list = [
        {
            'name': 'GSM774085 1',
            'ml_data_source': 'GSM774085_CF30-1979a.CEL',
        }
    ]

    @staticmethod
    def create_test_experiment(experiment_data=None):
        """Create an experiment record to use for tests"""
        if experiment_data is None:
            experiment_data = ModelsTestCase.experiment_data
        return Experiment.objects.create(**experiment_data)

    def test_create_experiment(self):
        """Experiment is persisted in the database without errors"""
        self.create_test_experiment()
        obj = Experiment.objects.get(pk=self.experiment_data['accession'])
        self.assertEqual(obj.name, self.experiment_data['name'])

    def test_create_sample_solo(self):
        """Sample is persisted in the database without errors"""
        Sample.objects.create(**self.sample_list[0])
        obj = Sample.objects.get(name=self.sample_list[0]['name'])
        self.assertEqual(obj.name, self.sample_list[0]['name'])
        self.assertEqual(
            obj.ml_data_source, self.sample_list[0]['ml_data_source'])

    def test_create_sample_linked(self):
        """
        Sample is persisted in the database and linked to an Experiment without
        errors
        """
        exp_obj = self.create_test_experiment()
        exp_obj.sample_set.create(**self.sample_list[0])
        # obj = Sample.objects.create(**self.sample_list[0])
        # obj.experiments.add(exp_obj)
        # FIXME need a uniqueness constraint on name? better way to get below?
        obj2 = Sample.objects.get(name=self.sample_list[0]['name'])
        self.assertEqual(obj2.name, self.sample_list[0]['name'])
        self.assertEqual(obj2.experiments.all()[0].accession, 'E-GEOD-31227')

    def test_annotations(self):
        """
        AnnotationTypes and Annotations are persisted in the database without
        errors
        """
        # need a few samples to annotate
        sample_count = 5
        factory.create(Sample, sample_count)
        # ensure that we actually created all sample_count samples
        self.assertEqual(Sample.objects.count(), sample_count)

        # also need a collection of annotation types to use
        annotation_type_count = 8
        factory.create(AnnotationType, annotation_type_count)
        # check that we have all annotation_type_count AnnotationTypes
        self.assertEqual(AnnotationType.objects.count(), annotation_type_count)

        # now fill in a random subset of annotation types for each sample
        for s in Sample.objects.all():
            samp_size = random.randint(1, annotation_type_count)
            for at in random.sample(AnnotationType.objects.all(), samp_size):
                factory.create(SampleAnnotation, {
                    'annotation_type': at,
                    'sample': s,
                })
            # check that we got the expected number of annotations
            self.assertEqual(len(s.get_annotation_dict()), samp_size)

    def test_activity(self):
        # 1 Organism record
        organism = factory.create(Organism)
        # 1 ML model record
        ml_model = MLModel.objects.create(title="test model",
                                          organism=organism)
        # 2 node records
        node1 = Node.objects.create(name="node #1", mlmodel=ml_model)
        Node.objects.create(name="node #2", mlmodel=ml_model)
        # 5 sample records
        sample_counter = 5
        factory.create(Sample, sample_counter)
        # 2 * 5 = 10 activity records
        for s in Sample.objects.all():
            for n in Node.objects.all():
                Activity.objects.create(sample=s, node=n,
                                        value=random.random())
        # Check activities on node1
        node1_activities = Activity.objects.filter(node=node1)
        self.assertEqual(node1_activities.count(), sample_counter)
        self.assertEqual(node1_activities[0].node.name, node1.name)

    @staticmethod
    def create_edges(gene_counter, num_gene1, num_gene2):
        if Organism.objects.exists():
            organism = Organism.objects.first()
        else:
            organism = factory.create(Organism)

        if MLModel.objects.exists():
            ml_model = MLModel.objects.first()
        else:
            ml_model = factory.create(MLModel)

        # Create genes:
        for i in range(gene_counter):
            Gene.objects.create(entrezid=(i + 1),
                                systematic_name="sys_name #" + str(i + 1),
                                standard_name="sys_name #" + str(i + 1),
                                organism=organism)

        # Select the first "num_gene1" genes as gene1.
        gene1_list = Gene.objects.all()[:num_gene1]
        # Select the last "num_gene2" genes as gene2.
        gene2_list = Gene.objects.all()[gene_counter - num_gene2:]
        for gene1 in gene1_list:
            edges = []
            for gene2 in gene2_list:
                new_edge = Edge(gene1=gene1, gene2=gene2, mlmodel=ml_model,
                                weight=random.random())
                edges.append(new_edge)
            # Create edges in bulk for each gene1
            Edge.objects.bulk_create(edges)

    def test_edges(self):
        """ Test records in Edge table. """
        gene_counter = 1000  # Total number of genes
        num_gene1 = 100      # Number of unique genes in "gene1" field
        num_gene2 = 100      # Number of unique genes in "gene2" field
        self.create_edges(gene_counter, num_gene1, num_gene2)

        gene1_list = Gene.objects.all()[:num_gene1]
        for gene1 in gene1_list:
            edges = Edge.objects.filter(gene1=gene1)
            self.assertEqual(edges.count(), num_gene2)

        # The number of edges whose "gene2" field is the last gene
        # should be num_gene1.
        last_gene = Gene.objects.all()[gene_counter - 1]
        edges = Edge.objects.filter(gene2=last_gene)
        self.assertEqual(edges.count(), num_gene1)

    @staticmethod
    def create_participations(num_nodes, num_genes):
        """
        Static method that builds Participation table based on the input
        number of nodes and number of genes.
        """
        if Organism.objects.exists():
            organism = Organism.objects.first()
        else:
            organism = factory.create(Organism)

        if MLModel.objects.exists():
            ml_model = MLModel.objects.first()
        else:
            ml_model = factory.create(MLModel)

        # Create nodes manually instead of calling factory.create(),
        # because the latter does not respect database constraint.
        for i in range(num_nodes):
            Node.objects.create(name=("node_%s" % (i + 1)), mlmodel=ml_model)

        # Create genes manually.  factory.create(Gene, num_genes) does
        # NOT work due to the contraint that standard_name and
        # systematic_name can not be both empty.
        for i in range(num_genes):
            Gene.objects.create(entrezid=(i + 1),
                                systematic_name="sys_name #" + str(i + 1),
                                standard_name="std_name #" + str(i + 1),
                                organism=organism)
        # Build a complete node-gene network.
        for node in Node.objects.all():
            for gene in Gene.objects.all():
                Participation.objects.create(node=node, gene=gene)

    def test_participations(self):
        num_nodes = 23
        num_genes = 17
        self.create_participations(num_nodes, num_genes)
        self.assertEqual(Participation.objects.count(), num_nodes * num_genes)
        for node in Node.objects.all():
            self.assertEqual(Participation.objects.filter(node=node).count(),
                             num_genes)


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
        self.cache_dir_name = os.path.join(CONFIG['data']['data_dir'],
                                           "bootstrap_cache_{:%Y%m%d}".format(
                                               datetime.now()))
        # n.b. we need a plain bytestream for use with unicodecsv, so this
        # open() call is correct even though we are opening a Unicode file.
        with open(CONFIG['data']['annotation_file'], mode='rb') as anno_fh:
            try:
                bootstrap_database(anno_fh, dir_name=self.cache_dir_name)
                logger.info("bootstrap_database succeeded.")
            except Exception:
                logger.warn("bootstrap_database threw an exception",
                            exc_info=1)

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
        Ensure that `name` and `description` for each Experiment match
        what we retrieved from ArrayExpress by peeking at the JSON cache
        we saved during bootstrap_database().
        """
        ae_experiments = gp.AERetriever(
            ae_url=gp._AEURL_EXPERIMENTS,
            cache_file_name=os.path.join(self.cache_dir_name,
                                         JSON_CACHE_FILE_NAME)
        ).ae_json_to_experiment_text()
        for e in ae_experiments:
            if Experiment.objects.filter(pk=e['accession']).exists():
                self.test_example_experiment(test_experiment=e)

    # FIXME make this test work again by educating it about meaningless diffs
    @unittest.skip("inconsistent annotations are auto-resolved, but this test "
                   "still flags those diffs")
    def test_annotations_import_export_match(self):
        """
        Ensure that exported data match what we imported with
        bootstrap_database.
        """
        # for our test, we need to independently confirm that the import worked
        # so we now re-open the file with the matching 'utf-8' encoding and
        # then minimally process the lines so we can compare our results with
        # the database export
        db_import = []
        with codecs.open(CONFIG['data']['annotation_file'],
                         mode='rb', encoding='utf-8') as anno_fh:
            last_col = re.compile(ur'\t[^\t]*$', flags=re.UNICODE)
            for line in anno_fh:
                line = last_col.sub(u'', line)   # strip off last column
                db_import.append(line)

        raw_export = SampleResource.get_annotations(annotation_types=[
            'strain', 'genotype', 'abx_marker', 'variant_phenotype',
            'medium', 'treatment', 'biotic_int_lv_1', 'biotic_int_lv_2',
            'growth_setting_1', 'growth_setting_2', 'nucleic_acid',
            'temperature', 'od', 'additional_notes', 'description',
        ]
        )
        db_export = raw_export.content.decode(raw_export.charset).splitlines()

        self.maxDiff = None     # report all diffs to be most helpful
        self.assertItemsEqual(db_export, db_import)

    # TODO Enhance tests to take advantage of bootstrapped data
    # test Elasticsearch (build index, check that we find what we want)
    # test search API


class APIResourceTestCase(ResourceTestCaseMixin, TestCase):
    # API tests:
    # For all of our interfaces, we should be able to GET, but every other
    # REST API should fail: POST, PUT, PATCH, DELETE

    baseURI = '/api/v0/'

    @staticmethod
    def random_object(ModelName):
        """
        There are various ways to get a random object from a table. See:
        http://stackoverflow.com/questions/9354127/how-to-grab-one-random-item-from-a-database-in-django-postgresql
        Since the tables created by the tests here are small, either approach
        listed in the above link will be okay. (We use an approach that seems
        to be the easiest to understand.)
        """
        return random.choice(ModelName.objects.all())

    def setUp(self):
        super(APIResourceTestCase, self).setUp()
        # create a test experiment to retrive with the API
        self.test_experiment = ModelsTestCase.experiment_data
        ModelsTestCase.create_test_experiment(
            experiment_data=self.test_experiment)
        self.experimentURI = (self.baseURI + 'experiment/{accession}/'.format(
            **self.test_experiment))

        # Create a few annotation types to retrieve with the API
        self.at_count = 10
        factory.create(AnnotationType, self.at_count)
        self.annotationtype_listURI = self.baseURI + 'annotationtype/'
        self.annotationtypeURI = self.annotationtype_listURI + str(
            self.random_object(AnnotationType).id) + '/'

        # Create some test samples to retrieve with the API
        self.s_counter = 29
        factory.create(Sample, self.s_counter)
        self.sampleURI = self.baseURI + 'sample/' + str(
            self.random_object(Sample).id) + '/'

        # Create relationships between Sample and Experiment
        for s in Sample.objects.all():
            s.experiments.add(Experiment.objects.all()[0])
        self.get_experiment_URI = (self.baseURI + 'sample/' +
                                   str(self.random_object(Sample).id) +
                                   '/get_experiments/')

        # Create activity records
        self.node_counter = 50
        self.create_activities(self.node_counter)

        self.activityURI = (self.baseURI + "activity/" +
                            str(self.random_object(Activity).id) + "/")
        self.activity_sample_URI = (self.baseURI + "activity/?sample=" +
                                    str(self.random_object(Sample).id))

        # Depending on the numbers of genes and edges we want to create
        # in the test, ModelsTestCase.create_edges() may take a few
        # seconds (or longer time) to create these records.  Since not
        # every test case needs them, ModelsTestCase.create_edges()
        # will be called ONLY in the tests where they are needed,
        # instead of being called in setUp(), which will be invoked at
        # the beginning of EVERY test case.
        self.gene_counter = 1000
        self.num_gene1 = 100
        self.num_gene2 = 100

    @staticmethod
    def create_activities(node_counter):
        """
        Create activity related records. "node_counter" is the number of
        records that will be created in Node table.
        Note that "factory.create(ModelName, n)" in fixtureless module is not
        used here because it does NOT gurantee unique_together constraint.
        """
        organism = factory.create(Organism)
        ml_model_1 = MLModel.objects.create(title="test model #1",
                                            organism=organism)
        ml_model_2 = MLModel.objects.create(title="test model #2",
                                            organism=organism)
        for i in xrange(node_counter // 2):
            node_name = "node " + str(i + 1)
            Node.objects.create(name=node_name, mlmodel=ml_model_1)
            Node.objects.create(name=node_name, mlmodel=ml_model_2)

        for s in Sample.objects.all():
            for n in Node.objects.all():
                Activity.objects.create(sample=s, node=n,
                                        value=random.random())

    def call_get_API(self, uri):
        '''
        Helper method: asserts that GET method is allowed via input URI.
        '''
        resp = self.api_client.get(uri, data={'format': 'json'})
        self.assertValidJSONResponse(resp)

    def call_non_get_API(self, uri):
        '''
        Helper method: assert that the methods of POST, PUT, PATCH and DELETE
        are NOT allowed via input URI.
        '''
        # POST
        resp = self.api_client.post(uri, data={'format': 'json'})
        self.assertHttpMethodNotAllowed(resp)
        # PUT
        resp = self.api_client.put(uri, data={'format': 'json'})
        self.assertHttpMethodNotAllowed(resp)
        # PATCH
        resp = self.api_client.patch(uri, data={'format': 'json'})
        self.assertHttpMethodNotAllowed(resp)
        # DELETE
        resp = self.api_client.delete(uri, data={'format': 'json'})
        self.assertHttpMethodNotAllowed(resp)

    def test_experiment_get(self):
        """
        We should be able to GET data from our test experiment via the API.
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
        Test POST, PUT, PATCH and DELETE methods via 'experiment/<pk>/' API.
        """
        self.call_non_get_API(self.experimentURI)

    def test_annotationtype_get(self):
        """
        Test GET method via 'annotationtype/<pk>/' API.
        """
        # Test GET method.
        self.call_get_API(self.annotationtypeURI)

    def test_annotationtype_non_get(self):
        """
        Test POST, PUT, PATCH and DELETE methods via
        'annotationtype/<pk>/' API.
        """
        self.call_non_get_API(self.annotationtypeURI)

    def test_annotationtype_list(self):
        """
        Test GET method via 'annotationtype/' API to list all AnnotationTypes.
        """
        # Make sure AnnotationTypes were created as expected
        self.assertEqual(AnnotationType.objects.count(), self.at_count)
        # Test GET method and ensure we get all records back
        resp = self.api_client.get(self.annotationtype_listURI,
                                   data={'format': 'json', 'limit': 0})
        self.assertValidJSONResponse(resp)
        atresp = self.deserialize(resp)
        self.assertEqual(len(atresp['objects']), self.at_count)

    def test_annotationtype_list_non_get(self):
        """
        Test POST, PUT, PATCH and DELETE methods via 'annotationtype/' API.
        """
        self.call_non_get_API(self.annotationtype_listURI)

    def test_sample_get(self):
        """
        Test GET method via 'sample/<pk>/' API.
        """
        # Make sure Sample table is not empty.
        self.assertEqual(Sample.objects.count(), self.s_counter)
        # Test GET method.
        self.call_get_API(self.sampleURI)

    def test_sample_non_get(self):
        """
        Test POST, PUT, PATCH and DELETE methods via 'sample/<pk>/' API.
        """
        # Make sure Sample table is not empty.
        self.assertEqual(Sample.objects.count(), self.s_counter)
        # Test non-GET methods.
        self.call_non_get_API(self.sampleURI)

    def test_get_experiment_get(self):
        """
        Test GET method via 'sample/<pk>/get_experiments/' API.
        """
        self.call_get_API(self.get_experiment_URI)

    def test_get_experiment_non_get(self):
        """
        Test POST, PUT, PATCH and DELETE methods via
        'sample/<pk>/get_experiments/' API.
        """
        self.call_non_get_API(self.get_experiment_URI)

    def check_annotations_param(self, resp, atypes):
        rows = resp.content.decode(resp.charset).splitlines()

        # we should get back a row for each sample we've created (+1 = header)
        self.assertEqual(len(rows), self.s_counter + 1)
        # we should also only get the columns we wanted in the same order
        self.assertEqual(rows[0].split(u'\t')[3:], atypes)

    def test_get_annotations_direct_param(self):
        """
        Test calling get_annotations directly with a parameter passed
        """
        atypes = [at.typename
                  for at in random.sample(AnnotationType.objects.all(), 3)]
        resp = SampleResource.get_annotations(annotation_types=atypes)
        self.check_annotations_param(resp, atypes)

    def test_get_annotations_get_param(self):
        """
        Test GET method via 'sample/get_annotations' API with parameter
        """
        atypes = [at.typename
                  for at in random.sample(AnnotationType.objects.all(), 3)]
        atstr = ','.join(atypes)
        resp = self.api_client.get(
            self.baseURI + 'sample/get_annotations/?annotation_types=' + atstr)
        self.check_annotations_param(resp, atypes)

    def check_annotations_default(self, resp):
        rows = resp.content.decode(resp.charset).splitlines()

        # we should get back a row for each sample we've created (+1 = header)
        self.assertEqual(len(rows), self.s_counter + 1)
        # we should also get all of the columns in alphabetical order
        cols = rows[0].split(u'\t')[3:]
        self.assertEqual(len(cols), AnnotationType.objects.count())
        self.assertEqual(cols, [
            at.typename
            for at in AnnotationType.objects.order_by('typename')
        ])

    def test_get_annotations_direct_default(self):
        """
        Test calling get_annotations directly with no parameters
        """
        resp = SampleResource.get_annotations()
        self.check_annotations_default(resp)

    def test_get_annotations_get_default(self):
        """
        Test GET method via 'sample/get_annotations/' API.
        """
        resp = self.api_client.get(
            self.baseURI + 'sample/get_annotations/')
        self.check_annotations_default(resp)

    def test_activity_get(self):
        """
        Test GET method via 'activity/<pk>/' API.
        """
        self.call_get_API(self.activityURI)

    def test_activity_non_get(self):
        """
        Test POST, PUT, PATCH and DELETE methods via 'activity/<pk>/' API.
        """
        self.call_non_get_API(self.activityURI)

    def test_activity_sample_get(self):
        """
        Test GET method via "activity/?sample=<id>&format=json" API.
        """
        self.call_get_API(self.activity_sample_URI)

    def test_activity_sample_non_get(self):
        """
        Test POST, PUT, PATCH and DELETE methods via
        "activity/?sample=<id>&format=json" API.
        """
        self.call_non_get_API(self.activity_sample_URI)

    def test_activity_mlmodel_filter(self):
        """
        Test "activity/?sample=<id>&mlmodel=<ml_id>" API.
        """
        uri = (self.baseURI + "activity/?sample=" +
               str(self.random_object(Sample).id) + "&mlmodel=" +
               str(self.random_object(MLModel).id))
        # Test GET method
        resp = self.api_client.get(uri)
        self.assertValidJSONResponse(resp)

        # Confirm the number of records returned.
        records = self.deserialize(resp)
        self.assertEqual(len(records['objects']), self.node_counter // 2)

        # Test non-GET methods
        self.call_non_get_API(uri)

    def test_one_edge(self):
        """
        Test GET, POST, PUT, PATCH and DELETE methods via
        'api/v0/edge/<pk>/' API.
        """
        ModelsTestCase.create_edges(self.gene_counter, self.num_gene1,
                                    self.num_gene2)
        uri = self.baseURI + "edge/" + str(self.random_object(Edge).id) + "/"
        self.call_get_API(uri)
        self.call_non_get_API(uri)

    def test_edge_union(self):
        """
        Test edge unions via
        'api/v0/edge/?genes=<id1,id2,...>&format=json' API.
        """
        ModelsTestCase.create_edges(self.gene_counter, self.num_gene1,
                                    self.num_gene2)

        id1 = Gene.objects.first().id  # The first gene
        id2 = Gene.objects.last().id   # The last gene

        # The number of edges in the union of the first and last genes
        # should be: num_gene1 + num_gene2 - 1, "-1" is due to double
        # counting of the edge between the first and last genes.
        uri = "%sedge/?genes=%s,%s&%s" % (self.baseURI, id1, id2,
                                          "format=json")
        resp = self.api_client.get(uri)
        resp = self.deserialize(resp)
        api_result = len(resp['objects'])
        self.assertEqual(api_result, self.num_gene1 + self.num_gene2 - 1)

        # Also confirm that api_result matches the Django query result.
        qset = Q(gene1__in=[id1, id2]) | Q(gene2__in=[id1, id2])
        query_result = Edge.objects.filter(qset).distinct().count()
        self.assertEqual(api_result, query_result)

        # Confirm the union of edges that involve 100 randomly selected
        # genes.
        random_genes = random.sample(Gene.objects.all(), 100)
        ids_str = ",".join([str(gene.id) for gene in random_genes])
        uri = "%sedge/?genes=%s&%s" % (self.baseURI, ids_str, "format=json")
        resp = self.api_client.get(uri)
        resp = self.deserialize(resp)
        api_result = len(resp['objects'])

        qset = Q(gene1__in=random_genes) | Q(gene2__in=random_genes)
        query_result = Edge.objects.filter(qset).distinct().count()
        self.assertEqual(api_result, query_result)

    def test_edge_intersection(self):
        """
        Test edge intersections via:
        'api/v0/edge/?gene1__in=id1,id2,...&gene2__in=id1,id2,...&format=json'
        API.
        """
        ModelsTestCase.create_edges(self.gene_counter, self.num_gene1,
                                    self.num_gene2)

        # Confirm that an edge exists between the first and last genes.
        id1 = Gene.objects.first().id  # First gene
        id2 = Gene.objects.last().id   # Last gene
        ids_str = str(id1) + "," + str(id2)
        uri = "%sedge/?gene1__in=%s&gene2__in=%s&%s" % (self.baseURI,
                                                        ids_str, ids_str,
                                                        "format=json")
        resp = self.api_client.get(uri)
        resp = self.deserialize(resp)
        api_result = len(resp['objects'])
        self.assertEqual(api_result, 1)

        # Confirm the intersection of edges that involve 100 randomly
        # selected genes.
        random_genes = random.sample(Gene.objects.all(), 100)
        ids_str = ",".join([str(gene.id) for gene in random_genes])
        uri = "%sedge/?gene1__in=%s&gene2__in=%s&%s" % (self.baseURI,
                                                        ids_str, ids_str,
                                                        "format=json")
        resp = self.api_client.get(uri)
        resp = self.deserialize(resp)
        api_result = len(resp['objects'])
        query_result = Edge.objects.filter(
            gene1__in=random_genes, gene2__in=random_genes).distinct().count()
        self.assertEqual(api_result, query_result)

    def test_edge_ordering(self):
        """
        Test acending order of edges via:
        'api/v0/edge/?<field>=<value>&order_by=weight&format=json'
        and descending order of edges via:
        'api/v0/edge/?<field>=<value>&order_by=-weight&format=json'
        """
        ModelsTestCase.create_edges(self.gene_counter, self.num_gene1,
                                    self.num_gene2)

        # Test edges from the first gene.
        id1 = Gene.objects.first().id  # The first gene
        uri = "%sedge/?gene1=%s&%s&%s" % (self.baseURI, id1,
                                          "order_by=weight", "format=json")
        resp = self.api_client.get(uri)
        resp = self.deserialize(resp)
        edges = resp['objects']
        num_edges = len(edges)
        # Confirm the number of edges from the first gene is num_gene2.
        self.assertEqual(num_edges, self.num_gene2)

        # Confirm the edges are sorted in ascending order.
        ascending_order = all(edges[i]['weight'] <= edges[i + 1]['weight']
                              for i in xrange(num_edges - 1))
        self.assertEqual(ascending_order, True)

        # Test edges to the last gene.
        id2 = Gene.objects.last().id
        uri = "%sedge/?gene2=%s&%s&%s" % (self.baseURI, id2,
                                          "order_by=-weight", "format=json")

        resp = self.api_client.get(uri)
        resp = self.deserialize(resp)
        edges = resp['objects']
        num_edges = len(edges)
        # Confirm the number of edges to the last gene is num_gene1.
        self.assertEqual(num_edges, self.num_gene1)

        # Confirm the edges are sorted in descending order.
        descending_order = all(edges[i]['weight'] >= edges[i + 1]['weight']
                               for i in xrange(num_edges - 1))
        self.assertEqual(descending_order, True)

    def test_participation(self):
        """
        Test GET, POST, PUT, PATCH and DELETE methods via
        'api/v0/participation/<pk>/' API.
        """
        ModelsTestCase.create_participations(13, 29)
        uri = self.baseURI + "participation/" + str(
            self.random_object(Participation).id) + "/"
        self.call_get_API(uri)
        self.call_non_get_API(uri)

    def test_heavy_genes(self):
        """
        Test "heavy_genes" queries in NodeResource.
        """
        ModelsTestCase.create_participations(13, 29)
        g1 = Gene.objects.first().id  # The first gene
        g2 = Gene.objects.last().id   # The last gene
        uri = "%snode/?heavy_genes=%s,%s&%s" % (self.baseURI, g1, g2,
                                                "format=json&limit=0")
        resp = self.api_client.get(uri)
        resp = self.deserialize(resp)
        api_result = len(resp['objects'])
        self.assertEqual(api_result, Node.objects.count())

        self.call_non_get_API(uri)  # Test non-get methods too.

    def test_node_filter_in_experiment(self):
        """
        Test the "node" filter in ExperimentResource.
        """
        # Create a few more random experiments:
        num_extra_exp = 3
        factory.create(Experiment, num_extra_exp)
        self.assertEqual(Experiment.objects.count(), num_extra_exp + 1)
        # Build relationship between the first sample and the last experiment:
        Sample.objects.first().experiments.add(Experiment.objects.last())

        # Confirm that a random node is related to both the experiment that is
        # created from ModelsTestCase.experiment_data and the last experiment.
        # (Note that when the database was initialized in setup(), the
        # experiement that was created from ModelsTestCase.experiment_data was
        # related to all samples, and each sample was related to all nodes.)
        node = self.random_object(Node)
        self.assertEqual(Activity.objects.filter(node=node).count(),
                         self.s_counter)
        node_filter_uri = "%sexperiment/?node=%s&format=json" % (
            self.baseURI, node.id)
        resp = self.api_client.get(node_filter_uri)
        related_experiments = self.deserialize(resp)['objects']
        self.assertEqual(len(related_experiments), 2)
        self.assertEqual(related_experiments[0]['accession'],
                         ModelsTestCase.experiment_data['accession'])
        self.assertEqual(related_experiments[1]['accession'],
                         Experiment.objects.last().accession)
