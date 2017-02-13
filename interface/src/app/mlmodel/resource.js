angular.module('adage.mlmodel.resource', ['ngResource'])

.factory('MLModel', ['$resource', function($resource) {
  return $resource(
    '/api/v0/mlmodel/'
  );
}])

;
