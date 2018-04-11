angular.module('adage.sample.service', [
  'ngResource',
  'adage.utils'
])

.factory('Sample', ['$resource', '$http', '$q', 'ApiBasePath',
  function($resource, $http, $q, ApiBasePath) {
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

    Sample.cache = {};
    Sample.getCached = function(id) {
      return this.cache[id];
    };
    Sample.setCache = function(id, obj) {
      this.cache[id] = obj;
    };

    Sample.promises = {};
    Sample.getSamplePromise = function(pk) {
      var pSample = Sample.get({id: pk},
        function success(responseObject, responseHeaders) {
          if (responseObject) {
            Sample.setCache(pk, responseObject);
          } else {
            $log.warn('Query for sample ' + pk + ' returned nothing.');
            // TODO user error reporting
          }
        },
        function error(responseObject, responseHeaders) {
          $log.error($scope.analysis.queryStatus);
        }
      ).$promise;
      Sample.promises[pk] = pSample;
      return pSample;
    };
    Sample.getSampleListPromise = function(pkList) {
      return $q(function(resolve, reject) {
        var cachedSamples = [];
        var promisedSampleIDs = [];
        var newSamplePromises = [];
        // check cached samples and promise queue before making any
        // redundant requests
        pkList.forEach(function(pk) {
          var cached = Sample.getCached(pk);
          if (!!cached) {
            cachedSamples.push(cached);
          } else if (!!Sample.promises[pk]) {
            promisedSampleIDs.push(pk);
            newSamplePromises.push(Sample.promises[pk]);
          } else {
            // not cached and not in promise queue yet, so make a new request
            promisedSampleIDs.push(pk);
            newSamplePromises.push(Sample.getSamplePromise(pk));
          }
        });

        // when the promises in our list all come back we can finish up
        $q.all(newSamplePromises)
          .then(function() {
            promisedSampleIDs.forEach(function(pk) {
              cachedSamples.push(Sample.getCached(pk));
            });
            resolve(cachedSamples);
          }).catch(function(errObject) {
            $log.error('getSampleListPromise failed:', errObject);
            reject(errObject);
          });
      });
    };

    return Sample;
  }
])

;
