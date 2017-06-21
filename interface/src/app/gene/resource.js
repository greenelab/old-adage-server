angular.module('adage.gene.resource', [
  'ngResource',
  'adage.utils'
])

.factory('Gene', ['$resource', 'ApiBasePath', function($resource, ApiBasePath) {
  return $resource(
    ApiBasePath + 'gene/:id', {
      id: '@id'
    }, {
      post: {
        url: ApiBasePath + 'gene/',
        method: 'POST',
        // Setting Content-Type is required. Django will not process the
        // POST data the way Angular's defaults send it.
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      },
      search: {
        url: ApiBasePath + 'gene/search/',
        method: 'GET',
        isArray: true
      },
      autocomplete: {
        url: ApiBasePath + 'gene/autocomplete/',
        method: 'GET'
      }
    }
  );
}])

;
