from django.contrib import admin
from .models import Experiment

admin.site.site_header = 'ADAGE administration'


class ExperimentAdmin(admin.ModelAdmin):
    list_display = ['accession', 'name']
    ordering = ['accession']

admin.site.register(Experiment, ExperimentAdmin)
