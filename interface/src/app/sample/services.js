angular.module('adage.sample.services', [
  'ngResource',
  'adage.utils'
])

.factory('Sample', ['$resource', '$http', 'ApiBasePath',
  function($resource, $http, ApiBasePath) {
    var Sample = $resource(
      ApiBasePath + 'sample/:id/',
      // TODO need to add logic for handling pagination of results.
      // then, can change "limit" below to something sensible
      {id: '@id', limit: 0},
      // Angular expects a query service to give only a list but our Tastypie
      // interface wraps the response list with pagination so we tell Angular to
      // expect an object instead via isArray: false
      {
        'get': {
          method: 'GET',
          isArray: false
        },
        'getExperiments': {
          url: ApiBasePath + 'sample/:id/get_experiments/',
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
  }
])

;
