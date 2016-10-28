angular.module('adage.analyze.search', ['ngResource'])

.factory('Search', ['$resource', function($resource) {
  return $resource(
    '/api/v0/search/',
    // TODO need to add logic for handling pagination of results.
    // then, can change "limit" below to something sensible
    {q: '', limit: 0},
    // Angular expects a query service to give only a list but our Tastypie
    // interface wraps the response list with pagination so we tell Angular to
    // expect an object instead via isArray: false
    {'query': {method: 'GET', isArray: false}}
  );
}])

.controller('SearchCtrl', ['$scope', '$log', '$location', 'Search',
  function SearchCtrl($scope, $log, $location, Search) {
    $scope.results = [];
    $scope.search = {
      query: {
        text: '',
        status: ''
      },

      get: function() {
        $scope.results = [];
        $scope.search.query.status = '';
        if (!$scope.search.query.text) {
          $log.info('Query text is empty, so skipping search.');
          return;
        }
        $location.search('q', $scope.search.query.text);
        $scope.search.query.status =
          'Searching for: ' + $scope.search.query.text + '...';
        Search.query({q: $scope.search.query.text},
          function(responseObject, responseHeaders) {
            var objectList = responseObject.objects;
            var noun = '';
            if (objectList.length === 1) {
              noun = ' match.';
            } else {
              noun = ' matches.';
            }
            $scope.search.query.status = 'Found ' + objectList.length + noun;
            $scope.results = objectList;
          },
          function(responseObject, responseHeaders) {
            $log.info('Query errored with: ' + responseObject);
            $scope.search.query.status = 'Query failed.';
          }
        );
      }

    };

    // check for search text in location field and load, if present
    var params = $location.search();
    if ('q' in params) {
      $scope.search.query.text = params['q'];
      $scope.search.get();
    }
  }])

.directive('search', function() {
  return {
    restrict: 'E',
    scope: {
      placeholder: '@',
      results: '='
    },
    templateUrl: 'analyze/search/search.tpl.html',
    controller: 'SearchCtrl'
  };
})
;
