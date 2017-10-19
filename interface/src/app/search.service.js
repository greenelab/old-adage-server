angular.module('adage.search.service', [
  'ngResource'
])

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

;
