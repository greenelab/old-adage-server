angular.module('adage.tribe_client.directives', [
  'adage.tribe_client',
  'adage.tribe_client.resource',
  'adage.tribe_client.utils'
])

.directive('profileButton', ['UserFactory', 'CommonFuncts',
  function(UserFactory, CommonFuncts) {
    return {
      controller: ['$scope', 'UserFactory', function($scope, UserFactory) {
        UserFactory.getPromise().$promise.then(function() {
          $scope.userObj = UserFactory.getUser();
        });
      }],
      link: CommonFuncts.updateUser,
      replace: true,
      restrict: 'E',
      templateUrl: 'tribe_client/tribe-profile-button.tpl.html'
    };
  }
])

.directive('loginButton', ['UserFactory', 'CommonFuncts',
  function(UserFactory, CommonFuncts) {
    return {
      controller: [
        '$scope', 'UserFactory', '$uibModal', '$rootScope', '$window',
        function($scope, UserFactory, $uibModal, $rootScope, $window) {
          UserFactory.getPromise().$promise.then(function() {
            $scope.userObj = UserFactory.getUser();
          });

          $scope.openLoginModal = function() {
            var modalInstance = $uibModal.open({
              templateUrl: 'tribe_client/tribe-login-modal.tpl.html',
              controller: [
                '$scope', '$uibModalInstance', 'TribeSettings',
                function($scope, $uibModalInstance, TribeSettings) {
                  TribeSettings.get({}, function(data) {
                    $scope.tribe_url = data['tribe_url'];
                    $scope.access_code_url = data['access_code_url'];
                    $scope.tribe_scope = data['scope'];
                    $scope.client_id = data['client_id'];
                  });

                  $scope.refresh = function() {
                    $rootScope.$broadcast('user.update');
                    $uibModalInstance.close();
                    $window.location.reload();
                  };

                  $scope.cancel = function() {
                    $uibModalInstance.dismiss('cancel');
                  };
                }
              ]
            });

            modalInstance.result.then(
              function(result) {
                // This gets called when the $uibModalInstance.close()
                // function gets called. We might need this bit in the
                // future, as we make the login process smoother, so we
                // won't get rid of it yet.
              }, function() {
              // This gets called if modal gets dismissed
              // ($uibModalInstance.dismiss()), which happens when the
              // user clicks outside the modal, etc.
            });
          };
        }
      ],
      link: CommonFuncts.updateUser,
      replace: true,
      restrict: 'E',
      templateUrl: 'tribe_client/tribe-login-button.tpl.html'
    };
  }
])

;
