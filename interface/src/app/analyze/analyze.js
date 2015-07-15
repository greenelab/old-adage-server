angular.module( 'adage.analyze', [
  'ui.router',
  'placeholders',
  'ui.bootstrap',
  'ngResource',
  'ngSanitize'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'analyze', {
    url: '/analyze',
    views: {
      "main": {
        controller: 'AnalyzeCtrl',
        templateUrl: 'analyze/analyze.tpl.html'
      }
    },
    data:{ pageTitle: 'Analyze' }
  });
})
.config(['$resourceProvider', function($resourceProvider) {
  // Don't strip trailing slashes from calculated URLs
  $resourceProvider.defaults.stripTrailingSlashes = false;
}])

.factory( 'ExperimentSearch', ['$resource', '$http', function($resource, $http) {
  return $resource('/api/v0/experiment/search/');
}])

.controller( 'AnalyzeCtrl', function AnalyzeCtrl( $scope, ExperimentSearch ) {
  $scope.query = {
    text: "",
    results: [],
    status: ""
  };
  // $scope.query.results = [];
  $scope.get_search = function( query ) {
    $scope.query.results = [];
    $scope.query.status = "";
    if (!$scope.query.text) {
      console.log('Query text is empty, so skipping search.');
      return;
    }
    $scope.query.status = "Searching for: " + $scope.query.text + "...";
    ExperimentSearch.query({ q: $scope.query.text },
      function(object_list, responseHeaders) {
        $scope.query.status = "Found " + object_list.length + " matches.";
        $scope.query.results = object_list;
      },
      function(object_list, responseHeaders) {
        console.log('Query errored with: ' + object_list);
        $scope.query.status = "Query failed.";
      }
    );
  };
})

;
