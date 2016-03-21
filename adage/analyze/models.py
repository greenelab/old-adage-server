# coding: utf-8 (see https://www.python.org/dev/peps/pep-0263/)

import re
from django.db import models
from django.core.exceptions import ValidationError, ObjectDoesNotExist


def validate_pyname(value):
    """
    Raise a ValidationError if value is not a valid Python name. See Python docs
    at: https://docs.python.org/2/reference/lexical_analysis.html#identifiers
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

    # TODO update API to get experiments via Sample
    def get_experiments(self):
        return self.experiments.all()


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
        result['_sample'] = sample
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
        return "%d: (%s for %s)" % (self.id, self.annotation_type, self.sample)
