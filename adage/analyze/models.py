# coding: utf-8 (see https://www.python.org/dev/peps/pep-0263/)

from django.db import models


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


class SampleAnnotation(models.Model):
    sample = models.OneToOneField(
        Sample,
        on_delete=models.PROTECT,
        primary_key=True)

    strain = models.CharField(
        "strain",
        max_length=60,
        blank=True)
    genotype = models.CharField(
        "genotype",
        max_length=130,
        blank=True)
    abx_marker = models.CharField(
        "abx marker, auxotrophy",
        max_length=20,
        blank=True)
    variant_phenotype = models.CharField(
        "variant phenotype (QS defective, mucoid, SCV, …)",
        max_length=60,
        blank=True)
    medium = models.TextField(
        "medium (biosynthesis/energy)",
        blank=True)
    treatment = models.CharField(
        "treatment (drug/small molecule)",
        max_length=200,
        blank=True)
    # biotic_interactor_level_1 = models.CharField(
    biotic_int_lv_1 = models.CharField(
        "biotic interactor level 1 (Plant, Human, Bacteria, …)",
        max_length=70,
        blank=True)
    # biotic_interactor_level_2 = models.CharField(
    biotic_int_lv_2 = models.CharField(
        "biotic interactor level 2 (Lung, epithelial cells, Staphylococcus "
            "aureus, …)",
        max_length=80,
        blank=True)
    growth_setting_1 = models.CharField(
        "growth setting (planktonic, colony, biofilm, …)",
        max_length=40,
        blank=True)
    growth_setting_2 = models.CharField(
        "growth setting (For planktonic - aerated, static) (For biofilms - "
            "flow cell, static, …)",
        max_length=70,
        blank=True)
    nucleic_acid = models.CharField(
        "nucleic Acid",
        max_length=10,
        blank=True)
    temperature = models.CharField(
        "temperature",
        max_length=10,
        blank=True)
    od = models.CharField(
        "OD",
        max_length=40,
        blank=True)
    additional_notes = models.TextField(
        "additional notes (markers)",
        blank=True)
    description = models.TextField(
        "description (strain, replicates, and a brief glimpse of the exp.)",
        blank=False)

    def __unicode__(self):
        return "%d (%s)" % (self.sample.id, self.sample.name)

    def get_experiments(self):
        return self.sample.experiments.all()


class MLModel(models.Model):
    title = models.CharField(max_length=1000, unique=True)

    def __unicode__(self):
        return "MLModel %s" % self.title


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
        return "Sample %s at Node %s with value %f" % (self.sample.sample,
                                                       self.node.name,
                                                       self.value)

    class Meta:
        unique_together = ('sample', 'node')
