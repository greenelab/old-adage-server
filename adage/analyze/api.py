from django.conf.urls import url
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from django.http import HttpResponse
from organisms.api import OrganismResource
from genes.api import GeneResource
from tastypie import fields, http
from tastypie.resources import Resource, ModelResource, convert_post_to_VERB
from tastypie.utils import trailing_slash
from tastypie.bundle import Bundle
from tastypie.exceptions import BadRequest
from haystack.query import SearchQuerySet
from haystack.inputs import AutoQuery
from models import (
    Experiment, Sample, SampleAnnotation, AnnotationType, MLModel, Signature,
    Activity, Edge, ParticipationType, Participation, ExpressionValue
)

# Many helpful hints for this implementation came from:
# https://michalcodes4life.wordpress.com/2013/11/26/custom-tastypie-resource-from-multiple-django-models/


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

        # restrict our search to the Experiment and Sample models
        sqs = SearchQuerySet().models(Experiment, Sample)

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
            elif result.model_name == 'sample':
                new_obj.item_type = result.model_name
                new_obj.description = result.object.name
                s = Sample.objects.get(pk=result.pk)
                new_obj.related_items = [e.pk for e in s.experiments.all()]
            else:
                new_obj.item_type = result.model_name
                new_obj.description = result.verbose_name
                new_obj.related_items = []
            new_obj.snippet = ' ...'.join(result.highlighted)
            object_list.append(new_obj)

        return object_list


class ExperimentResource(ModelResource):
    sample_set = fields.ManyToManyField(
        'analyze.api.SampleResource', 'sample_set')

    class Meta:
        queryset = Experiment.objects.all()
        allowed_methods = ['get']
        filtering = {
            'signature': ('exact', ),  # See apply_filters().
        }

    # Implementation of "signature" filter, which allows the API to get
    # the experiements that are related to a given signature.  According
    # to the database schema, "Signature" model has many-to-many
    # relationship with "Sample" model through "Activity" model; and
    # "Sample" model has (implicit) many-to-many relationship with
    # "Experiment" model through the "experiments" field in "Sample".
    def apply_filters(self, request, applicable_filters):
        object_list = super(ExperimentResource, self).apply_filters(
            request, applicable_filters)
        signature = request.GET.get('signature', None)
        if signature:
            # Catch ValueError exception that may be raised by int() below,
            # and raise a customized BadRequest exception with more details.
            try:
                sig_id = int(signature)
            except ValueError:
                raise BadRequest("Invalid signature ID: %s" % signature)

            samples = Activity.objects.filter(signature=sig_id).values(
                'sample')
            experiments = Sample.objects.filter(pk__in=samples).values(
                'experiments').distinct()
            object_list = object_list.filter(pk__in=experiments)
        return object_list


class AnnotationTypeResource(ModelResource):
    class Meta:
        queryset = AnnotationType.objects.all()
        allowed_methods = ['get']


class SampleResource(ModelResource):
    annotations = fields.DictField(attribute='get_annotation_dict')

    class Meta:
        queryset = Sample.objects.all()
        allowed_methods = ['get']
        experiments_allowed_methods = allowed_methods
        annotations_allowed_methods = allowed_methods
        filtering = {
            'id': ('in',),
            'experiment': ('exact', ),  # Implemented in apply_filters()
        }

    def prepend_urls(self):
        return [
            url((r'^(?P<resource_name>%s)/'
                 r'(?P<pk>[0-9]+)/get_experiments%s$') %
                (self._meta.resource_name, trailing_slash()),
                self.wrap_view('dispatch_experiments'),
                name='api_get_experiments'),
            url((r'^(?P<resource_name>%s)/'
                 r'get_annotations%s$') %
                (self._meta.resource_name, trailing_slash()),
                self.wrap_view('dispatch_annotations'),
                name='api_get_annotations'),
        ]

    def dispatch_experiments(self, request, **kwargs):
        """
        This handler takes a URL request (see above) and dispatches it to the
        get_experiments method via Tastypie's built-in ModelResource.dispatch()
        (inherited from Resource). We do this in order to take advantage of the
        Tastypie-supplied dispatcher, which properly checks if a method is
        allowed, does request throttling and authentication (if required). See
        Resource.dispatch() for details.
        """
        return self.dispatch('experiments', request, **kwargs)

    def get_experiments(self, request, pk=None, **kwargs):
        if pk:
            try:
                sample_obj = Sample.objects.get(pk=pk)
            except ObjectDoesNotExist:
                return http.HttpNotFound()
        else:
            return http.HttpNotFound()
        objects = []
        er = ExperimentResource()
        for e in sample_obj.experiments.all():
            bundle = er.build_bundle(obj=e, request=request)
            bundle = er.full_dehydrate(bundle)
            objects.append(bundle)

        return self.create_response(request, objects)

    def dispatch_annotations(self, request, **kwargs):
        """
        This handler takes a URL request (see above) and dispatches it to the
        get_annotations method via Tastypie's built-in ModelResource.dispatch()
        (inherited from Resource). We do this in order to take advantage of the
        Tastypie-supplied dispatcher, which properly checks if a method is
        allowed, does request throttling and authentication (if required). See
        Resource.dispatch() for details.
        """
        return self.dispatch('annotations', request, **kwargs)

    @staticmethod
    def get_annotations(request=None, **kwargs):
        """
        Return a tab-delimited file containing all samples for every Experiment
        with Sample properties for each and all annotations (by default) or, if
        `annotation_types` is specified, return only those annotation types for
        each sample, and do so in the order specified.
        """
        if 'annotation_types' in kwargs:
            # an explicitly-passed annotation_types param takes precedence
            annotation_types = kwargs['annotation_types']
        elif request and 'annotation_types' in request.GET:
            # process the comma-separated list of typenames
            annotation_types = request.GET['annotation_types'].split(",")
        else:
            # default: supply all AnnotationTypes in alphabetical order
            annotation_types = [
                at.typename
                for at in AnnotationType.objects.order_by('typename')
            ]
        rows = []
        # include a header as the first row
        headers = ['experiment', 'sample_name', 'ml_data_source']
        headers.extend(annotation_types)
        rows.append(u'\t'.join(headers) + u'\n')
        for e in Experiment.objects.all():
            for s in e.sample_set.all():
                sa = SampleAnnotation.objects.get_as_dict(s)
                ml_data_source = s.ml_data_source if s.ml_data_source else ''
                sa_cols = [e.accession, s.name, ml_data_source, ]
                for at in annotation_types:
                    sa_cols.append(sa.get(at, ''))
                rows.append(u'\t'.join(sa_cols) + u'\n')
        response = HttpResponse(rows, content_type='text/tab-separated-values')
        response['Content-Disposition'] = (
            'attachment; filename="sample_annotations.tsv"')
        return response

    def apply_filters(self, request, applicable_filters):
        """
        Implementation of "experiment" filter, which allows the API to
        get all samples that are related to a given experiment (whose
        primary key is "accession").
        """
        object_list = super(SampleResource, self).apply_filters(
            request, applicable_filters)
        experiment = request.GET.get('experiment', None)
        if experiment:
            try:
                e = Experiment.objects.get(pk=experiment)
            except ObjectDoesNotExist:
                # Return an empty set if the experiment is not found.
                return Sample.objects.none()
            samples = e.sample_set.all()
            object_list = object_list.filter(pk__in=samples)
        return object_list


class MLModelResource(ModelResource):
    organism = fields.ForeignKey(OrganismResource, "organism", full=True)

    class Meta:
        queryset = MLModel.objects.all()
        allowed_methods = ['get']


class SignatureResource(ModelResource):
    mlmodel = fields.ForeignKey(MLModelResource, "mlmodel",
                                full=True, full_list=False)

    class Meta:
        queryset = Signature.objects.all()
        resource_name = 'signature'
        allowed_methods = ['get']
        multiple_allowed_methods = ['post']
        filtering = {
            'name': ('exact', 'in', ),
            'heavy_genes': ('exact', ),  # New filter, see apply_filters().
            'mlmodel': ('exact', ),
        }
        ordering = ['name']

    def prepend_urls(self):
        return [
            url((r'^(?P<resource_name>%s)/'
                 r'post_multiple%s$') %
                (self._meta.resource_name, trailing_slash()),
                self.wrap_view('dispatch_multiple'),
                name='api_post_multiple'),
        ]

    def dispatch_multiple(self, request, **kwargs):
        return self.dispatch('multiple', request, **kwargs)

    def post_multiple(self, request, **kwargs):
        """
        use POSTs for retrieving long lists of Signatures
        """
        # we use the built-in Tastypie get_multiple implementation
        # but to do so, we need to convert the request to a GET
        request.method = 'GET'  # override the incoming POST
        converted_request = convert_post_to_VERB(request, 'GET')
        kwarg_name = '%s_list' % self._meta.detail_uri_name
        kwargs[kwarg_name] = converted_request.body
        return self.get_multiple(converted_request, **kwargs)

    def apply_filters(self, request, applicable_filters):
        object_list = super(SignatureResource, self).apply_filters(
            request, applicable_filters)
        heavy_genes = request.GET.get('heavy_genes', None)
        if heavy_genes:
            # Instead of relying on tastypie/resources.py to catch the
            # ValueError exception that may be raised in this function,
            # we catch the one that may be raised by int() below and
            # raise a customized BadRequest exception with more details.
            try:
                # Convert genes to a set of integers so that the
                # duplicate(s) will be removed implicitly.
                query_genes = {int(id) for id in heavy_genes.split(',')}
            except ValueError:
                raise BadRequest("Invalid gene IDs: %s" % heavy_genes)

            for (i, q) in enumerate(query_genes):
                q_signatures = {p.signature.id for p in
                                Participation.objects.filter(gene=q)}
                if i == 0:
                    related_signatures = q_signatures
                else:
                    related_signatures = related_signatures & q_signatures
            object_list = object_list.filter(id__in=related_signatures)
        return object_list


class ActivityResource(ModelResource):
    sample = fields.IntegerField(attribute='sample_id', null=False)
    signature = fields.IntegerField(attribute='signature_id', null=False)

    class Meta:
        queryset = Activity.objects.all()
        resource_name = 'activity'
        allowed_methods = ['get']
        include_resource_uri = False
        limit = 0      # Disable pagination
        max_limit = 0  # Disable pagination
        filtering = {
            'sample': ('exact', 'in', ),
            'signature': ('exact', 'in', ),
            'mlmodel': ('exact', ),  # See apply_filters()
        }
        ordering = [
            'sample', 'signature'
        ]

    def apply_filters(self, request, applicable_filters):
        """
        Instead of overriding prepend_url() method, we added a new
        filter "mlmodel" to retrieve the activity records of a specific
        mlmodel ID:
          api/v0/activity/?mlmodel=<mlmodel_id>&...
        """
        object_list = super(ActivityResource, self).apply_filters(
            request, applicable_filters)
        mlmodel = request.GET.get('mlmodel', None)
        if mlmodel:
            # Instead of relying on tastypie/resources.py to catch the
            # ValueError exception that may be raised in this function,
            # we catch the one that may be raised by int() below and
            # raise a customized BadRequest exception with more details.
            try:
                mlmodel_id = int(mlmodel)
            except ValueError:
                raise BadRequest("Invalid mlmodel ID: %s" % mlmodel)
            object_list = object_list.filter(signature__mlmodel=mlmodel_id)
        return object_list


class EdgeResource(ModelResource):
    gene1 = fields.IntegerField(attribute='gene1_id', null=False)
    gene2 = fields.IntegerField(attribute='gene2_id', null=False)
    mlmodel = fields.IntegerField(attribute='mlmodel_id', null=False)

    class Meta:
        queryset = Edge.objects.all()
        resource_name = 'edge'
        allowed_methods = ['get']
        include_resource_uri = False
        limit = 0      # Disable default pagination
        max_limit = 0  # Disable default pagination
        filtering = {
            'gene1': ('exact', 'in', ),
            'gene2': ('exact', 'in', ),
            'mlmodel': ('exact', 'in', ),
            'genes': ('exact', ),  # New filter, see apply_filters().
        }
        # Allow ordering by weight.
        # The following URL will sort the edges in ascending order of
        # weight:
        #   "api/v0/edge/?field=value&order_by=weight&format=json"
        # The following URL will sort the edges in descending order of
        # weight:
        #   "api/v0/edge/?field=value&order_by=-weight&format=json"
        # (Note the extra "-" character before "weight".)
        ordering = ['weight']

    def apply_filters(self, request, applicable_filters):
        """
        Instead of overriding prepend_url() method, we added a new
        filter "genes" to retrieve the edges whose "gene1" or "gene2"
        field is on the list of genes in a URL like this:
          api/v0/edge/?genes=id1,id2,...&...
        """
        object_list = super(EdgeResource, self).apply_filters(
            request, applicable_filters)
        genes = request.GET.get('genes', None)
        if genes:
            # Instead of relying on tastypie/resources.py to catch the
            # ValueError exception that may be raised in this function,
            # we catch the one that may be raised by int() below and
            # raise a customized BadRequest exception with more details.
            try:
                # Convert genes to a set of integers so that the
                # duplicate(s) will be removed implicitly.
                ids = {int(id) for id in genes.split(',')}
            except ValueError:
                raise BadRequest("Invalid gene IDs: %s" % genes)
            # "in" operator in Django supports both list and set.
            qset = Q(gene1__in=ids) | Q(gene2__in=ids)
            direct_edges = object_list.filter(qset).distinct()
            related_genes = set()
            for e in direct_edges:
                related_genes.add(e.gene1)
                related_genes.add(e.gene2)
            object_list = object_list.filter(
                gene1__in=related_genes, gene2__in=related_genes
            ).distinct()
        return object_list


class ParticipationTypeResource(ModelResource):

    class Meta:
        queryset = ParticipationType.objects.all()
        allowed_methods = ['get']
        limit = 0      # Disable default pagination
        max_limit = 0  # Disable default pagination


class ParticipationResource(ModelResource):
    """To avoid unnecessary table joins and improve the query
    performance, only "gene" is enabled as a foreign key (because the
    Signature page on frontend needs the gene details given a certain
    signature); "signature" is not set as a foreign key because at this
    time, we don't intend to do a query that returns signature details
    given an input gene.
    """
    signature = fields.IntegerField(attribute='signature_id', null=False)
    gene = fields.ForeignKey(GeneResource, "gene", full=True)
    participation_type = fields.ForeignKey(ParticipationTypeResource,
                                           "participation_type", full=True)

    class Meta:
        queryset = Participation.objects.all()
        allowed_methods = ['get']
        include_resource_uri = False
        limit = 0      # Disable default pagination
        max_limit = 0  # Disable default pagination
        filtering = {
            'signature': ('exact', 'in', ),
            'gene': ('exact', 'in', ),
            'participation_type': ('exact', 'in', ),
            'related_genes': ('exact')  # see apply_filters()
        }

    def apply_filters(self, request, applicable_filters):
        """Implementation of "related_genes" filter, which allows the
        API to get all pratitipation records of signatures that includes
        at least one of the entries in "related_genes" list.
        This filter is used to calculate enriched signatures given a
        list of genes.
        """
        object_list = super(ParticipationResource, self).apply_filters(
            request, applicable_filters)
        related_genes = request.GET.get('related_genes', None)
        if related_genes:
            try:
                query_genes = {int(id) for id in related_genes.split(',')}
            except ValueError:
                raise BadRequest("Invalid gene IDs: %s" % related_genes)

            signatures = Participation.objects.filter(
                gene__in=query_genes).values('signature').distinct()
            object_list = object_list.filter(signature__in=signatures)
        return object_list


class ExpressionValueResource(ModelResource):
    gene = fields.IntegerField(attribute='gene_id', null=False)
    sample = fields.IntegerField(attribute='sample_id', null=False)

    class Meta:
        queryset = ExpressionValue.objects.all()
        include_resource_uri = False
        list_allowed_methods = ['get', 'post']
        detail_allowed_methods = ['get']
        limit = 0
        max_limit = 0
        filtering = {
            'gene': ('exact', 'in', ),
            'sample': ('exact', 'in', ),
        }
        # Allow ordering by gene ID.
        ordering = ['gene']

    def post_list(self, request, **kwargs):
        """
        handle an incoming POST as a GET to work around URI length limitations
        """
        # The convert_post_to_VERB() technique is borrowed from
        # resources.py in tastypie source. This helps us to convert the POST
        # to a GET in the proper way internally.
        request.method = 'GET'  # override the incoming POST
        dispatch_request = convert_post_to_VERB(request, 'GET')
        return self.dispatch('list', dispatch_request, **kwargs)
