"""adage URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf.urls import include, url
from django.views.generic import TemplateView
from django.contrib import admin
from tastypie.api import Api
from organisms.api import OrganismResource
from genes.api import GeneResource
from analyze.api import SearchResource, ExperimentResource,\
    AnnotationTypeResource, SampleResource, NodeResource, ActivityResource,\
    EdgeResource, ParticipationResource

v0_api = Api(api_name='v0')
v0_api.register(SearchResource())
v0_api.register(ExperimentResource())
v0_api.register(AnnotationTypeResource())
v0_api.register(SampleResource())
v0_api.register(OrganismResource())
v0_api.register(GeneResource())
v0_api.register(NodeResource())
v0_api.register(ActivityResource())
v0_api.register(EdgeResource())
v0_api.register(ParticipationResource())

urlpatterns = [
    url(r'^$', TemplateView.as_view(template_name="index.html"), name='home'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include(v0_api.urls)),
    url(r'^search/', include('haystack.urls')),
    url(r'^tribe_client/', include('tribe_client.urls')),
]
