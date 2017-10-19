angular.module('adage.sample.service', [
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
        'get': {
          method: 'GET',
          transformResponse: function(data, headersGetter, status) {
            var getAnnotation = function(typename) {
              // We are going to attach getAnnotation to an object, so use of
              // 'this' below is intentional: we are making a "safe" accessor
              // method that will return a blank string instead of undefined
              if (this.annotations !== undefined &&
                  this.annotations.hasOwnProperty(typename)) {
                return this.annotations[typename];
              } else {
                return '';
              }
            };
            if (status === 200) {
              data = angular.fromJson(data);
              if (data.hasOwnProperty('objects')) {
                // data has a pagination wrapper, so must iterate over list
                data.objects.forEach(function(obj) {
                  obj.getAnnotation = getAnnotation;
                });
              } else {
                // this is a single object, so just add our method
                data.getAnnotation = getAnnotation;
              }
            }
            return data;
          }
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
