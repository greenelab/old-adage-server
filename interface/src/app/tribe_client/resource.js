/*
 * The factories for fetching resources from the tribe_client urls
 */
angular.module("adage.tribe_client.resource", ['ngResource'])

.factory('User', ['$resource', function($resource) {
  return $resource('/tribe_client/return_user');
}])

.factory('TribeSettings', ['$resource', function($resource) {
  return $resource('/tribe_client/get_settings');
}])

.factory('Genesets', ['$resource', function($resource) {
  return $resource(
    'https://tribe.greenelab.com/api/v1/geneset/:creator/:slug/',
    {
      creator: '@creator',
      slug: '@slug'
    },

    {
      query: {
        method: 'JSONP',
        params: {
          callback: 'JSON_CALLBACK'
        },
        isArray: false
      }
    }
  );
}])

;
