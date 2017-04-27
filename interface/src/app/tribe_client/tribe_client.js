angular.module('adage.tribe_client', [
  'adage.tribe_client.resource',
  'adage.tribe_client.directives',
  'adage.tribe_client.genesets'
])

.factory('UserFactory', ['User', function(User) {
  var promise = null;
  var user = null;

  return {
    getUser: function() {
      // Only call this function after the promise completes
      // to be able to get an actual user (instead of null).
      return user;
    },

    getPromise: function() {
      if (!promise) {
        promise = User.get({}, function(data) {
          if (data.meta.total_count !== 0) {
            user = data.objects[0];
          }
        }).$promise;
      }
      return promise;
    },

    resetPromise: function() {
      // reset the promise in case we need to check the user again
      promise = null;
    },

    resetAndGetPromise: function() {
      this.resetPromise();
      return this.getPromise();
    }
  };
}])

;
