/* Resource classes used in signature modules. */

angular.module('adage.signature.resources', [
  'ngResource',
  'adage.utils'
])

.factory('Signature', ['$resource', 'ApiBasePath',
  function($resource, ApiBasePath) {
    return $resource(ApiBasePath + 'node/:id');
  }
])

.factory('ParticipationType', ['$resource', 'ApiBasePath',
  function($resource, ApiBasePath) {
    return $resource(ApiBasePath + 'participationtype/');
  }
])

.factory('Participation', ['$resource', 'ApiBasePath',
  function($resource, ApiBasePath) {
    return $resource(ApiBasePath + 'participation');
  }
])

.factory('Activity', ['$resource', 'ApiBasePath',
  function($resource, ApiBasePath) {
    return $resource(ApiBasePath + 'activity');
  }
])

.factory('Experiment', ['$resource', 'ApiBasePath',
  function($resource, ApiBasePath) {
    return $resource(ApiBasePath + 'experiment');
  }
])

;
