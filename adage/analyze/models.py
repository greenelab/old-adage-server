# coding: utf-8 (see https://www.python.org/dev/peps/pep-0263/)

import re
from django.db import models
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from organisms.models import Organism
from genes.models import Gene


def validate_pyname(value):
    """
    Raise a ValidationError if value is not a valid Python name. See Python
    docs at:
    https://docs.python.org/2/reference/lexical_analysis.html#identifiers
    for full specification.
    """
    if not re.match(r'[A-Za-z_][A-Za-z0-9_]*', value):
        raise ValidationError(
            "%(value)s is not a valid Python identifier",
            params={'value': value},
        )


class Experiment(models.Model):
    accession = models.CharField(max_length=48, primary_key=True)
    name = models.CharField(max_length=1000)
    description = models.TextField()

    def __unicode__(self):
        return self.accession

# TODO: implement absolute urls for Experiments. see
#  https://docs.djangoproject.com/en/1.8/ref/models/instances/#get-absolute-url
# TODO: implement a model for samples uploaded by users


class Sample(models.Model):
    name = models.CharField(
        "sample name",
        max_length=80,
        blank=False)
    ml_data_source = models.CharField(
        "Machine Learning data used for modeling, e.g. CEL file",
        max_length=120,
        null=True,
        unique=True,
        blank=True)
    experiments = models.ManyToManyField(Experiment)

    def __unicode__(self):
        return "%d (%s)" % (self.id, self.name)

    def get_annotation_dict(self):
        return SampleAnnotation.objects.get_as_dict(self)

    def get_annotation_items(self):
        return SampleAnnotation.objects.get_as_dict(self).iteritems()


class AnnotationTypeManager(models.Manager):
    def create(self, typename, description=''):
        ann_type = AnnotationType(
            typename=typename,
            description=description,
        )
        ann_type.full_clean()
        ann_type.save()
        return ann_type

    def get_or_create(self, typename, description=''):
        try:
            ann_type = self.get(typename=typename)
            created = False
        except ObjectDoesNotExist:
            ann_type = self.create(
                typename=typename,
                description=description)
            created = True
        return (ann_type, created)


class AnnotationType(models.Model):
    typename = models.CharField(
        "name for this AnnotationType (usable as a Python identifier)",
        max_length=40,
        unique=True,
        blank=False,
        validators=[validate_pyname])
    description = models.CharField(
        max_length=140,
        blank=True)

    objects = AnnotationTypeManager()

    def __unicode__(self):
        return "%d (%s)" % (self.id, self.typename)


class SampleAnnotationManager(models.Manager):
    def create_from_dict(self, sample, ann_dict):
        for k, v in ann_dict.iteritems():
            if not v:
                continue
            ann_type, created = AnnotationType.objects.get_or_create(k)
            sa = SampleAnnotation(
                sample=sample,
                annotation_type=ann_type,
                text=v,
            )
            sa.save()

    def get_as_dict(self, sample):
        annotations_for_sample = self.get_queryset().filter(sample=sample)
        result = {sa.annotation_type.typename: sa.text
                  for sa in annotations_for_sample}
        return result


class SampleAnnotation(models.Model):
    annotation_type = models.ForeignKey(
        AnnotationType,
        on_delete=models.PROTECT)
    sample = models.ForeignKey(
        Sample,
        on_delete=models.CASCADE)
    text = models.TextField(
        "annotation text",
        blank=True)

    objects = SampleAnnotationManager()

    class Meta:
        unique_together = (("annotation_type", "sample"),)

    def __unicode__(self):
        return "%d: (%s for %s)" % \
            (self.id, self.annotation_type.typename, self.sample.name)

    def get_experiments(self):
        return self.sample.experiments.all()


class MLModel(models.Model):
    title = models.CharField(max_length=1000, unique=True)
    organism = models.ForeignKey(Organism, on_delete=models.PROTECT)

    # A boolean flag that indicates whether gene-to-gene relationship
    # edges (see "Edge" model below) are directed or not. Default is
    # False (not directed).
    directed_g2g_edge = models.BooleanField(default=False)

    def __unicode__(self):
        edge_info = "directed" if self.directed_g2g_edge else "undirected"
        return ("MLModel %s of organism %s with %s gene-gene edges" %
                (self.title, self.organism.common_name, edge_info))


class Node(models.Model):
    name = models.CharField(max_length=100, blank=False)
    mlmodel = models.ForeignKey(MLModel, on_delete=models.PROTECT)
    samples = models.ManyToManyField(Sample, through='Activity')

    def __unicode__(self):
        return "Node %s of Model %s" % (self.name, self.mlmodel.title)

    class Meta:
        unique_together = ('name', 'mlmodel')


class Activity(models.Model):
    sample = models.ForeignKey(Sample, on_delete=models.PROTECT)
    node = models.ForeignKey(Node, on_delete=models.PROTECT)
    value = models.FloatField()

    def __unicode__(self):
        return "Sample %s at Node %s with value %f" % (self.sample.name,
                                                       self.node.name,
                                                       self.value)

    class Meta:
        unique_together = ('sample', 'node')


class Edge(models.Model):
    mlmodel = models.ForeignKey(MLModel, on_delete=models.PROTECT)
    gene1 = models.ForeignKey(Gene, related_name="gene1",
                              on_delete=models.PROTECT)
    gene2 = models.ForeignKey(Gene, related_name="gene2",
                              on_delete=models.PROTECT)
    weight = models.FloatField()

    def __unicode__(self):
        return "%s: %s vs. %s, weight is %f" % (self.mlmodel.title,
                                                self.gene1.entrezid,
                                                self.gene2.entrezid,
                                                self.weight)

    class Meta:
        unique_together = ('mlmodel', 'gene1', 'gene2')


class ParticipationType(models.Model):
    """
    A model to keep track to the types of gene participation in nodes
    that are available. The 'Participation' objects in the database
    (see below) will have a Foreign Key to this model.
    """
    name = models.CharField(max_length=256, unique=True, blank=False)
    description = models.TextField()

    def __unicode__(self):
        return self.name


class Participation(models.Model):
    """
    This class models the many-to-many relationship between Node and
    Gene.  It shows which genes are related to which nodes and vice
    versa.  Although this relationship can be modeled implicitly because
    it doesn't include any other fields, we create the model explicitly
    so that the corresponding API ("ParticipationResource" in api.py)
    will be easier to handle.
    """
    node = models.ForeignKey(Node, on_delete=models.PROTECT)
    gene = models.ForeignKey(Gene, on_delete=models.PROTECT)
    participation_type = models.ForeignKey(ParticipationType, null=True,
                                           on_delete=models.PROTECT)

    class Meta:
        unique_together = ('node', 'gene')

    def __unicode__(self):
        return "Model: %s, Node: %s, Gene: %s" % (self.node.mlmodel.title,
                                                  self.node.name,
                                                  self.gene.entrezid)


class ExpressionValue(models.Model):
    """
    ExpressionValue models the many-to-many relationship between Gene and
    Sample.  For each ExpressionValue, Gene 'gene' has RMA processed and
    zero-one normalized gene expression 'value' in Sample 'sample'.
    """
    sample = models.ForeignKey(Sample, on_delete=models.PROTECT)
    gene = models.ForeignKey(Gene, on_delete=models.PROTECT)
    value = models.FloatField()

    class Meta:
        unique_together = ('sample', 'gene')

    def __unicode__(self):
        return "Expression value %f for Sample %s and Gene %s" % (
            self.value, self.sample.name, self.gene.entrezid)
