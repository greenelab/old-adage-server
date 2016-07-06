angular.module( 'adage.analyze.experiment', [
  'adage.analyze.sample',
  'ngResource'
])

.config(['$resourceProvider', function($resourceProvider) {
  // Don't strip trailing slashes from calculated URLs
  $resourceProvider.defaults.stripTrailingSlashes = false;
}])

.factory( 'Experiment', ['$resource', function($resource) {
  var Experiment = $resource(
    '/api/v0/experiment/:accession/',
    // TODO need to add logic for handling pagination of results.
    // then, can change "limit" below to something sensible
    { accession: '@accession', limit: 0 },
    // Angular expects a query service to give only a list but our Tastypie
    // interface wraps the response list with pagination so we tell Angular to
    // expect an object instead via isArray: false
    { 'get': { method: 'GET', isArray: false } }
  );
  Experiment.makeHref = {
    // These functions create formatted URLs for direct linking to source 
    // material on ArrayExpress. They are attached to the Experiment factory
    // so they can be made available in the same places that Experiment data
    // are shown.
    mlDataSource: function(experimentId, mlDataSource) {
      return ("http://www.ebi.ac.uk/arrayexpress/files/{expId}/" +
        "{expId}.raw.1.zip/{mlDataSource}")
        .replace(/{expId}/g, experimentId)
        .replace(/{mlDataSource}/g, mlDataSource);
    },
    arrExpExperiment: function(experimentId) {
      return ("http://www.ebi.ac.uk/arrayexpress/experiments/{id}/")
        .replace(/{id}/g, experimentId);
    }
  };
  return Experiment;
}])

.controller( 'ExperimentCtrl', ['$scope', '$log', '$location', 'Sample',
  'Experiment',
  function ExperimentCtrl($scope, $log, $location, Sample, Experiment) {
    $scope.makeHref = Experiment.makeHref;
    
    var queryError = function(responseObject, responseHeaders) {
      $log.warn('Query errored with: ' + responseObject);
      $scope.experiment.status = "Query failed.";
    };
    
    $scope.show = function(id) {
      $scope.experiment = {
        status: "retrieving...",
        related_samples: []
      };
      var getSampleDetails = function(uri) {
        Sample.getUri(uri).then(
          function(responseObject) {
            if (responseObject) {
              $scope.experiment.status = "";
              $scope.experiment.related_samples.push(responseObject.data);
            }
          },
          queryError
        );
      };
      Experiment.get({ accession: id },
        function(responseObject, responseHeaders) {
          if (responseObject) {
            $scope.experiment.results = responseObject;
            $scope.experiment.status = "Retrieving sample details...";
            for (var i=0; i< responseObject.sample_set.length; i++) {
              getSampleDetails(responseObject.sample_set[i]);
            }
          }
        },
        queryError
      );
    };
  }
])

.directive('experimentDetail', function() {
  return {
    restrict: 'E',
    scope: {
      id: '='
    },
    templateUrl: 'analyze/experiment/experimentDetail.tpl.html',
    controller: 'ExperimentCtrl',
    link: function(scope) {
      scope.$watch('id', function(val) {
        scope.show(val);
      });
    }
  };
})
;
