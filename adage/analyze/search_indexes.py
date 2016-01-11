import datetime
from haystack import indexes
from analyze.models import Experiment, SampleAnnotation

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
    sample = indexes.CharField(model_attr='sample__sample')
    experiments = indexes.CharField(model_attr='get_experiments')
    
    cel_file = indexes.CharField(model_attr='cel_file')
    strain = indexes.CharField(model_attr='strain')
    genotype = indexes.CharField(model_attr='genotype')
    abx_marker = indexes.CharField(model_attr='abx_marker')
    variant_phenotype = indexes.CharField(model_attr='variant_phenotype')
    medium = indexes.CharField(model_attr='medium')
    treatment = indexes.CharField(model_attr='treatment')
    biotic_int_lv_1 = indexes.CharField(model_attr='biotic_int_lv_1')
    biotic_int_lv_2 = indexes.CharField(model_attr='biotic_int_lv_2')
    growth_setting_1 = indexes.CharField(model_attr='growth_setting_1')
    growth_setting_2 = indexes.CharField(model_attr='growth_setting_2')
    nucleic_acid = indexes.CharField(model_attr='nucleic_acid')
    temperature = indexes.CharField(model_attr='temperature')
    od = indexes.CharField(model_attr='od')
    
    def get_model(self):
        return SampleAnnotation
    
    def index_queryset(self, using=None):
        return self.get_model().objects
