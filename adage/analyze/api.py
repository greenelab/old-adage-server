from django.conf.urls import url
from models import Experiment
from tastypie.resources import ModelResource
from tastypie.utils import trailing_slash
from haystack.query import SearchQuerySet
from haystack.inputs import AutoQuery

class ExperimentResource(ModelResource):
    class Meta:
        queryset = Experiment.objects.all()
    
    def prepend_urls(self):
        return [
            url(r'^(?P<resource_name>%s)/search%s$' % (self._meta.resource_name, trailing_slash()),
                self.wrap_view('get_search'), name='api_get_search'),
        ]
    
    def get_search(self, request, **kwargs):
        """
        provide a search API via haystack's SearchQuerySet API
        Return: results to display with query terms highlighted
        """
        self.method_check(request, allowed=['get'])
        self.throttle_check(request)
        
        # unpack the query string from the request headers
        query_str = request.GET.get('q', '')
        
        # restrict our search to the Experiment model only
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
