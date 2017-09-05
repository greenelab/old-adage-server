from haystack import indexes
from analyze.models import Experiment, Sample


class ExperimentIndex(indexes.SearchIndex, indexes.Indexable):
    """ This object exposes the parts of the model for Haystack to index """
    text = indexes.CharField(document=True, use_template=True)
    accession = indexes.CharField(model_attr='accession')
    name = indexes.CharField(model_attr='name')

    def get_model(self):
        return Experiment

    def index_queryset(self, using=None):
        """ Used when the entire index for model is updated. """
        return self.get_model().objects


class SampleIndex(indexes.SearchIndex, indexes.Indexable):
    """
    This object exposes a model interface for Haystack to index
    Note that SampleIndex combines Sample and SampleAnnotation. The distinction
    between the two is not made at the presentation layer, so we reflect that
    in the index.
    """
    text = indexes.CharField(document=True, use_template=True)
    name = indexes.CharField(model_attr='name')
    experiments = indexes.MultiValueField()
    ml_data_source = indexes.CharField(model_attr='ml_data_source', null=True)

    def get_model(self):
        return Sample

    def index_queryset(self, using=None):
        return self.get_model().objects

    def prepare_experiments(self, obj):
        return [e.accession for e in obj.experiments.all()]
