angular.module( 'adage.gene.resource', ['ngResource'])

.factory( 'Gene', ['$resource', function($resource) {
  return $resource(
    '/api/v0/gene/:id', {id: '@id'}, {

      query: {
        method: 'GET',
        isArray: false
      },

      search: {
          url: '/api/v0/gene/search/',
          method: 'GET',
          isArray: true
      }  

    }
  );
}])

;
