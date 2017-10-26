angular.module('adage.search.service', [
  'ngResource',
  'adage.utils'
])

.factory('Search', [
  '$resource', 'ApiBasePath', function($resource, ApiBasePath) {
    return $resource(
      ApiBasePath + 'search/',
      // TODO need to add logic for handling pagination of results.
      // then, can change "limit" below to something sensible
      {q: '', limit: 0},
      // Angular expects a query service to give only a list but our Tastypie
      // interface wraps the response list with pagination so we tell Angular to
      // expect an object instead via isArray: false
      {
        'query': {
          method: 'GET',
          isArray: false,
          transformResponse: function(data, headersGetter, status) {
            var renameProperty = function(obj, oldProp, newProp) {
              if (obj.hasOwnProperty(oldProp)) {
                obj[newProp] = obj[oldProp];
                delete obj[oldProp];
              }
            };
            if (status === 200) {
              data = angular.fromJson(data);
              if (data.hasOwnProperty('objects')) {
                data.objects.forEach(function(obj) {
                  renameProperty(obj, 'item_type', 'itemType');
                  renameProperty(obj, 'related_items', 'relatedItems');
                  renameProperty(obj, 'resource_uri', 'resourceUri');
                });
              }
            }
            return data;
          }
        }
      }
    );
  }
])

;
