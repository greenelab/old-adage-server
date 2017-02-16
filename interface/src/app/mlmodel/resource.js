angular.module('adage.mlmodel.resource', ['ngResource'])

.factory('MlModel', ['$resource', function($resource) {
  return $resource(
    '/api/v0/mlmodel/'
  );
}])

;
