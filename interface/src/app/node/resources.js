/* Resource classes used in node modules. */

angular.module('adage.node.resources', [
  'ngResource',
  'adage.utils'
])

.factory('NodeInfo', ['$resource', 'ApiBasePath',
  function($resource, ApiBasePath) {
    return $resource(ApiBasePath + 'node/:id');
  }
])

.factory('Participation', ['$resource', 'ApiBasePath',
  function($resource, ApiBasePath) {
    return $resource(ApiBasePath + 'participation/');
  }
]);
