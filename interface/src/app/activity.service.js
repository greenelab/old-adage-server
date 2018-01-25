angular.module('adage.activity.service', [
  'ngResource',
  'adage.utils'
])

.factory('Activity', ['$cacheFactory', '$resource', 'ApiBasePath',
  function($cacheFactory, $resource, ApiBasePath) {
    var Activity = $resource(ApiBasePath + 'activity');
    Activity.cache = $cacheFactory('activity');
    return Activity;
  }
])

;
