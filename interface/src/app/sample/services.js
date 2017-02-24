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
      {limit: 0},
      {
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
