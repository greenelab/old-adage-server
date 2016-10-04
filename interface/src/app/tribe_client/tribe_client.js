angular.module('adage.tribe_client', [
    'adage.tribe_client.resource',
    'adage.tribe_client.directives',
])

.factory( 'UserFactory', ['User', function( User ) {
    var promise = null;
    var user = null;

    return {
        getUser: function() { //only call this when the promise completes
            return user;
        },
        getPromise: function() {
            if (!promise) {
                promise = User.get({}, function( data ) {
                    if (data.meta.total_count !== 0) {
                        user = data.objects[0];
                    }
                });
            }
            return promise;
        },
        resetPromise: function() { // reset the promise in case we need to check the user again
            promise = null;
        },
        setUser: function( newUser ) { //set the user object to have properties from the passed user
            for (var member in user) {
                delete user[member]; // delete properties from user
            }
            for (member in newUser) {
                user[member] = newUser[member];// add properties back to user
            }
        },
        resetAndGetPromise: function () {
            this.resetPromise();
            return this.getPromise();
        }
    };
}])

;
