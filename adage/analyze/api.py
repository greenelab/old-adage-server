from django.conf.urls import url
from models import Experiment, Sample, SampleAnnotation
from tastypie import fields
from tastypie.resources import Resource, ModelResource
from tastypie.utils import trailing_slash
from tastypie.paginator import Paginator
from tastypie.bundle import Bundle
from haystack.query import SearchQuerySet
from haystack.inputs import AutoQuery

# credit to: https://michalcodes4life.wordpress.com/2013/11/26/custom-tastypie-resource-from-multiple-django-models/

class SearchItemObject(object):
    pass

class SearchResource(Resource):
    item_type = fields.CharField(attribute='item_type')
    pk = fields.CharField(attribute='pk')
    description = fields.CharField(attribute='description')
    snippet = fields.CharField(attribute='snippet')
    related_items = fields.ListField(attribute='related_items')
    
    class Meta:
        resource_name = 'search'
        allowed_methods = ['get']
        object_class = SearchItemObject
    
    def resource_uri_kwargs(self, bundle_or_obj):
        kwargs = {
            'resource_name': self._meta.resource_name,
        }
        
        if self._meta.api_name is not None:
            kwargs['api_name'] = self._meta.api_name
        if bundle_or_obj is not None:
            if isinstance(bundle_or_obj, Bundle):
                obj = bundle_or_obj.obj
            else:
                obj = bundle_or_obj
            kwargs['resource_name'] = obj.item_type
            kwargs['pk'] = obj.pk
        
        return kwargs
    
    def obj_get_list(self, request=None, **kwargs):
        if not request:
            request = kwargs['bundle'].request
        return self.get_object_list(request)
    
    def get_object_list(self, request):
        # unpack the query string from the request headers
        query_str = request.GET.get('q', '')
        
        # restrict our search to the Experiment and SampleAnnotation models
        sqs = SearchQuerySet().models(Experiment, SampleAnnotation)
        
        # run the query and specify we want highlighted results
        sqs = sqs.filter(content=AutoQuery(query_str)).load_all().highlight()
        
        object_list = []
        for result in sqs:
            new_obj = SearchItemObject()
            
            new_obj.pk = result.pk
            if result.model_name == 'experiment':
                new_obj.item_type = result.model_name
                new_obj.description = result.object.name
                e = Experiment.objects.get(pk=result.pk)
                new_obj.related_items = [s.pk for s in e.sample_set.all()]
            elif result.model_name == 'sampleannotation':
                new_obj.item_type = 'sample'
                new_obj.description = result.object.description
                s = Sample.objects.get(pk=result.pk)
                new_obj.related_items = [e.pk for e in s.experiments.all()]
            else:
                new_obj.item_type = result.model_name
                new_obj.description = result.verbose_name
                new_obj.related_items = []
            new_obj.snippet = ' ...'.join(result.highlighted)
            object_list.append(new_obj)
        
        return object_list
    
    # def dehydrate_related_items(self, bundle):
        # related_item_list = []
        # print(bundle.obj.pk)
        # if bundle.obj.item_type == 'experiment':
        #     e = Experiment.objects.get(pk=bundle.obj.pk)
        #     return e.sample_set
        # elif bundle.obj.item_type == 'sample':
        #     s = Sample.objects.get(pk=bundle.obj.pk)
        #     return s.experiments
        # return bundle.obj.related_items

class ExperimentResource(ModelResource):
    sample_set = fields.ManyToManyField(
            'analyze.api.SampleResource', 'sample_set')
    
    class Meta:
        queryset = Experiment.objects.all()
        allowed_methods = ['get']
    
    def prepend_urls(self):
        return [
            url(r'^(?P<resource_name>%s)/search%s$' % (self._meta.resource_name, trailing_slash()),
                self.wrap_view('get_search'), name='api_get_search'),
        ]
    
    def get_samples(self, request, pk=None, **kwargs):
        if pk:
            sample_obj = Experiment.objects.get(pk=pk)
        objects = []
        # TODO stopped here.
        er = ExperimentResource()
        for e in sample_obj.get_experiments():
            bundle = er.build_bundle(obj=e, request=request)
            bundle = er.full_dehydrate(bundle)
            objects.append(bundle)
        
        return self.create_response(request, objects)
    
    def get_search(self, request, **kwargs):
        """
        provide a search API via haystack's SearchQuerySet API
        Return: results to display with query terms highlighted
        """
        self.method_check(request, allowed=['get'])
        self.throttle_check(request)
        
        # unpack the query string from the request headers
        query_str = request.GET.get('q', '')
        
        # restrict our search to the Experiment models
        sqs = SearchQuerySet().models(Experiment)
        
        # run the query and specify we want highlighted results
        sqs = sqs.filter(content=AutoQuery(query_str)).load_all().highlight()
        
        objects = []
        for result in sqs:
            # This is they way whoosh returns highlighted results
            # snippet = { 'snippet': result.highlighted['text'][0] }
            # This is the way elasticsearch returns highlighted results
            snippet = { 'snippet': ' ...'.join(result.highlighted) }
            bundle = self.build_bundle(obj=result.object, data=snippet, request=request)
            bundle = self.full_dehydrate(bundle)
            objects.append(bundle)
        
        self.log_throttled_access(request)
        return self.create_response(request, objects)

class SampleResource(ModelResource):
    class Meta:
        queryset = SampleAnnotation.objects.all()
        allowed_methods = ['get']
    
    def prepend_urls(self):
        # FIXME this <pk> regex is not tested
        return [
            url(r'^(?P<resource_name>%s)/(?P<pk>[A-Za-z0-9 ]+)/get_experiments%s$' % \
                    (self._meta.resource_name, trailing_slash()),
                    self.wrap_view('get_experiments'), name='api_get_experiments'),
        ]
    
    def get_experiments(self, request, pk=None, **kwargs):
        if pk:
            sample_obj = SampleAnnotation.objects.get(pk=pk)
        # print("sample_obj.get_experiments() = %s" % sample_obj.get_experiments())
        objects = []
        # TODO move this method to ExperimentResource and try again
        er = ExperimentResource()
        for e in sample_obj.get_experiments():
            bundle = er.build_bundle(obj=e, request=request)
            bundle = er.full_dehydrate(bundle)
            objects.append(bundle)
        
        return self.create_response(request, objects)
