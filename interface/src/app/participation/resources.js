angular.module('adage.participation.resources', [
  'ngResource',
  'adage.utils'
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

;
