import datetime
from haystack import indexes
from analyze.models import Experiment

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
