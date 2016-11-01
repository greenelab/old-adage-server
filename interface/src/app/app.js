angular.module('adage', [
  'templates-app',
  'templates-common',
  'adage.home',
  'adage.about',
  'adage.analyze',
  'adage.download',
  'adage.tribe_client',
  'adage.gene.search',
  'adage.gene.network',
  'ui.router',
  'ngResource'
])

.config(function myAppConfig($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/home');
})

// This configuration is required for all REST calls to the back end.
.config(['$resourceProvider', function($resourceProvider) {
  // Don't strip trailing slashes from calculated URLs.
  $resourceProvider.defaults.stripTrailingSlashes = false;
}])

.controller('AppCtrl', ['$scope', 'UserFactory',
  function AppCtrl($scope, UserFactory) {
    $scope.$on('$stateChangeSuccess',
      function(event, toState, toParams, fromState, fromParams) {
        if (angular.isDefined(toState.data.pageTitle)) {
          $scope.pageTitle = toState.data.pageTitle + ' | adage';
        }
      });

    UserFactory.getPromise().$promise.then(function() {
      $scope.userObj = UserFactory.getUser();
    });
  }
])
;
