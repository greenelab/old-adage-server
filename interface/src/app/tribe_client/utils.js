angular.module('adage.tribe_client.utils', [
  'adage.tribe_client'
])

.factory('CommonFuncts', ['UserFactory', function(UserFactory) {
  return {

    updateUser: function(scope, element, attr) {
      scope.$on('user.update', function() {
        UserFactory.resetAndGetPromise().$promise.then(function() {
          scope.userObj = UserFactory.getUser();
        });
      });
    }

  };
}])

;
