/* Resource classes used in signature modules. */

angular.module('adage.signature.resources', [
  'ngResource',
  'adage.utils'
])

.factory('Signature', ['$resource', 'ApiBasePath',
  function($resource, ApiBasePath) {
    return $resource(ApiBasePath + 'signature/:id');
  }
])

.factory('SignatureExperiment', ['$resource', 'ApiBasePath',
  function($resource, ApiBasePath) {
    return $resource(ApiBasePath + 'experiment');
  }
])

;
