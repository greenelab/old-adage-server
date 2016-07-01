angular.module( 'adage.analyze.sample', ['ngResource'])
.config(['$resourceProvider', function($resourceProvider) {
  // Don't strip trailing slashes from calculated URLs
  $resourceProvider.defaults.stripTrailingSlashes = false;
}])
.factory( 'Sample', ['$resource', function($resource) {
  return $resource(
    '/api/v0/sample/:id/',
    // TODO need to add logic for handling pagination of results.
    // then, can change "limit" below to something sensible
    { id: '@id', limit: 0 },
    // Angular expects a query service to give only a list but our Tastypie
    // interface wraps the response list with pagination so we tell Angular to
    // expect an object instead via isArray: false
    { 'get': { method: 'GET', isArray: false } }
  );
}])
.factory( 'SampleExperiments', ['$resource', function($resource) {
  return $resource(
    '/api/v0/sample/:id/get_experiments/',
    { id: '@id', limit: 0 },
    { 'get': { method: 'GET', isArray: true } }
  );
}])
.controller( 'SampleCtrl', ['$scope', '$log', '$location', 'Sample',
  'SampleExperiments',
  function SampleCtrl($scope, $log, $location, Sample, SampleExperiments) {
    $scope.make_ml_data_source_href = function(experimentId, mlDataSource) {
      /*
        TODO find a place where this URL template belongs
      */
      return ("http://www.ebi.ac.uk/arrayexpress/files/{expId}/" +
        "{expId}.raw.1.zip/{mlDataSource}")
        .replace(/{expId}/g, experimentId)
        .replace(/{mlDataSource}/g, mlDataSource);
    };
    
    var queryError = function(responseObject, responseHeaders) {
      $log.warn('Query errored with: ' + responseObject);
      $scope.sample.status = "Query failed.";
    };

    $scope.show = function(id) {
      $scope.sample = {
        status: "retrieving..."
      };
      Sample.get({id: id},
        function(responseObject, responseHeaders) {
          if (responseObject) {
            $scope.sample.status = "";
            $scope.sample.results = responseObject;
          }
        },
        queryError
      );
      SampleExperiments.get({id: id},
        function(responseObject, responseHeaders) {
          if (responseObject) {
            $scope.sample.status = "";
            $scope.sample.related_experiments = responseObject;
          }
        },
        queryError
      );
    };
  }
])
.directive('sampleDetail', function() {
  return {
    restrict: 'E',
    scope: {
      id: '='
    },
    templateUrl: 'analyze/sample/sampleDetail.tpl.html',
    controller: 'SampleCtrl',
    link: function(scope) {
      scope.$watch('id', function(val) {
        scope.show(val);
      });
    }
  };
})
;
