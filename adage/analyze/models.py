from django.db import models
from django.contrib.auth.models import User

class Experiment(models.Model):
    accession = models.CharField(max_length=48, primary_key=True)
    name = models.CharField(max_length=1000)
    description = models.TextField()
    
    def __unicode__(self):
        return self.accession

# TODO: implement absolute urls for Experiments. see https://docs.djangoproject.com/en/1.8/ref/models/instances/#get-absolute-url
# TODO: implement a model for samples - files from ArrayExpress and uploaded by users
