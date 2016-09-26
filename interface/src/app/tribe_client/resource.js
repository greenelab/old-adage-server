/*
 * The resources for fetching the OAuth2 token from the tribe_client url
 */
angular.module("adage.tribe_client.resource", ['ngResource'])
    .factory('User', ['$resource', function($resource) {
        return $resource('/tribe_client/return_user', {}, {});
    }])
;
