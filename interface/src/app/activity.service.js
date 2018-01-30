angular.module('adage.activity.service', [
  'ngResource',
  'adage.utils'
])

.factory('Activity', ['$cacheFactory', '$resource', 'ApiBasePath',
  function($cacheFactory, $resource, ApiBasePath) {
    var Activity = $resource(ApiBasePath + 'activity');

    Activity.cache = $cacheFactory('activity');

    Activity.listSamplesNotCached = function(sampleList) {
      var notCached = [];
      sampleList.forEach(function(sampleID) {
        if (!Activity.cache.get(sampleID)) {
          notCached.push(sampleID);
        }
      });
      return notCached;
    };

    return Activity;
  }
])

;
