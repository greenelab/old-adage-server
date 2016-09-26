angular.module('adage.tribe_auth.user', [
    'adage.tribe_auth.resource',
])

.factory( 'UserFactory', function( User ) {
    var promise = false;
    var user = null;

    return {
        getUser: function() { //only call this when the promise completes
            return user;
        },
        getPromise: function() {
            if (!promise) {
                promise = User.query({}, function( data ) {
                    if (data.meta.total_count !== 0) {
                        user = data.objects[0];
                    }
                });
            }
            return promise;
        },
        resetPromise: function() { // reset the promise in case we need to check the user again
            promise = false;
        },
        setUser: function( newUser ) { //set the user object to have properties from the passed user
            var member = null;
            for (member in user) {
                delete user[member]; // delete properties from user
            }
            for (member in newUser) {
                user[member] = newUser[member];// add properties back to user
            }
        }
    };
})

.directive('profileButton', function(UserFactory) { 
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
        templateUrl: 'tribe_auth/tribe-profile-button.tpl.html'
    };
})

;
