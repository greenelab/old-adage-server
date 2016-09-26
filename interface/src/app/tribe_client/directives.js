angular.module('adage.tribe_client.directives', [
    'adage.tribe_client.resource',
])

.directive('profileButton', [ 'UserFactory', function(UserFactory) {
    return {
        controller: ['$scope', 'UserFactory', function( $scope, UserFactory ) {

            UserFactory.getPromise().$promise.then( function() {
                $scope.userObj = UserFactory.getUser();
            });

        }],
        link: function(scope, element, attr) {
            scope.$on('user.update', function() {
                UserFactory.resetPromise();
                UserFactory.getPromise().$promise.then( function() {
                    scope.userObj = UserFactory.getUser();
                });
            });
        },
        replace: true,
        restrict: "E",
        templateUrl: 'tribe_client/tribe-profile-button.tpl.html'
    };
}])

;