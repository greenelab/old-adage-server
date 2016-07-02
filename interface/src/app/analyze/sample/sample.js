angular.module( 'adage.analyze.sample', ['ngResource'])
.config(['$resourceProvider', function($resourceProvider) {
  // Don't strip trailing slashes from calculated URLs
  $resourceProvider.defaults.stripTrailingSlashes = false;
}])
.factory( 'Sample', ['$resource', '$http', '$log', 
  function($resource, $http, $log) {
  Sample = $resource(
    '/api/v0/sample/:id/',
    // TODO need to add logic for handling pagination of results.
    // then, can change "limit" below to something sensible
    { id: '@id', limit: 0 },
    // Angular expects a query service to give only a list but our Tastypie
    // interface wraps the response list with pagination so we tell Angular to
    // expect an object instead via isArray: false
    {
      'get': {
        method: 'GET',
        isArray: false
      },
      'getExperiments': {
        url: '/api/v0/sample/:id/get_experiments/',
        method: 'GET',
        isArray: true
      }
    }
  );
  Sample.getUri = function(uri) {
    // We can't easily get Tastypie-supplied resource_uris via $resource, so
    // this uses $http directly and returns the HttpPromise
    return $http({url: uri, method: 'GET'});
  };
  return Sample;
}])
.controller( 'SampleCtrl', ['$scope', '$log', '$location', 'Sample',
  'Experiment',
  function SampleCtrl($scope, $log, $location, Sample, Experiment) {
    $scope.makeHref = Experiment.makeHref;
    
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
      Sample.getExperiments({id: id},
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
