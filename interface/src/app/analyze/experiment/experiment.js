angular.module( 'adage.analyze.experiment', [
  'adage.analyze.sample',
  'ngResource'
])
.config(['$resourceProvider', function($resourceProvider) {
  // Don't strip trailing slashes from calculated URLs
  $resourceProvider.defaults.stripTrailingSlashes = false;
}])
.factory( 'Experiment', ['$resource', function($resource) {
  return $resource(
    '/api/v0/experiment/:accession/',
    // TODO need to add logic for handling pagination of results.
    // then, can change "limit" below to something sensible
    { accession: '@accession', limit: 0 },
    // Angular expects a query service to give only a list but our Tastypie
    // interface wraps the response list with pagination so we tell Angular to
    // expect an object instead via isArray: false
    { 'get': { method: 'GET', isArray: false } }
  );
}])
.controller( 'ExperimentCtrl', ['$scope', '$log', '$location', 'Sample',
  'Experiment',
  function ExperimentCtrl($scope, $log, $location, Sample, Experiment) {
    /*
      TODO Continue refactoring here (need to get Sample by URI)
    */
    $scope.detail.related_items = [];
    var getSampleDetails = function(pk) {
      Sample.get({id: pk},
        function(responseObject, responseHeaders) {
          if (responseObject) {
            $scope.detail.status = "";
            $scope.detail.related_items.push(responseObject);
          }
        },
        function(responseObject, responseHeaders) {
          $log.warn('Query errored with: ' + responseObject);
          $scope.detail.status = "Query failed.";
        }
      );
    };
    Experiment.get({ accession: search_item.pk },
      function(responseObject, responseHeaders) {
        if (responseObject) {
          $scope.detail.results = responseObject;
          $scope.detail.status = "Retrieving sample details...";
          for (var i=0; i< search_item.related_items.length; i++) {
            getSampleDetails(search_item.related_items[i]);
          }
        }
      },
      function(responseObject, responseHeaders) {
        $log.warn('Query errored with: ' + responseObject);
        $scope.detail.status = "Query failed.";
      }
    );
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
