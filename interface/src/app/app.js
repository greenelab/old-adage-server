angular.module('adage', [
  'templates-app',
  'templates-common',
  'adage.home',
  'adage.about',
  'adage.analyze',
  'adage.analyze.analysis',
  'adage.analyze.sampleBin',
  'adage.download',
  'adage.tribe_client',
  'adage.gene.searchFew',
  'adage.gene.searchMany',
  'adage.gene.network',
  'adage.node',
  'adage.help',
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
