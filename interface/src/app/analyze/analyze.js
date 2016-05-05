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

.factory( 'Search', ['$resource', '$http', function($resource, $http) {
  return $resource(
    '/api/v0/search/',
    // TODO need to add logic for handling pagination of results.
    // then, can change "limit" below to something sensible
    { q: '', limit: 0 },
    // Angular expects a query service to give only a list but our Tastypie
    // interface wraps the response list with pagination so we tell Angular to
    // expect an object instead via isArray: false
    { 'query': { method: 'GET', isArray: false } }
  );
}])

.controller( 'AnalyzeCtrl', function AnalyzeCtrl( $scope, Search ) {
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
    Search.query({ q: $scope.query.text },
      function(response_object, responseHeaders) {
        object_list = response_object.objects;
        $scope.query.status = "Found " + object_list.length + " matches.";
        $scope.query.results = object_list;
      },
      function(response_object, responseHeaders) {
        console.log('Query errored with: ' + response_object);
        $scope.query.status = "Query failed.";
      }
    );
  };
})

;
