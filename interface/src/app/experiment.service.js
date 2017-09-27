angular.module('adage.experiment.service', [
  'ngResource',
  'adage.utils'
])

.factory('Experiment', ['$resource', 'ApiBasePath',
  function($resource, ApiBasePath) {
    var Experiment = $resource(
      ApiBasePath + 'experiment/:accession/',
      // TODO need to add logic for handling pagination of results.
      // then, can change "limit" below to something sensible
      {limit: 0}
    );
    Experiment.makeHref = {
      // These functions create formatted URLs for direct linking to source
      // material on ArrayExpress. They are attached to the Experiment factory
      // so they can be made available in the same places that Experiment data
      // are shown.
      mlDataSource: function(experimentId, mlDataSource) {
        return ('http://www.ebi.ac.uk/arrayexpress/files/{expId}/' +
          '{expId}.raw.1.zip/{mlDataSource}')
          .replace(/{expId}/g, experimentId)
          .replace(/{mlDataSource}/g, mlDataSource);
      },
      arrExpExperiment: function(experimentId) {
        return ('http://www.ebi.ac.uk/arrayexpress/experiments/{id}/')
          .replace(/{id}/g, experimentId);
      }
    };
    return Experiment;
  }
])

;
