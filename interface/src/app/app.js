angular.module('adage', [
  'ui.router',
  'ngResource',
  'templates-app',
  'templates-common',
  'adage.home',
  'adage.about',
  'adage.analyze',
  'adage.analyze.analysis',
  'adage.analyze.sampleBin',
  'adage.experimentDetail.view',
  'adage.sampleDetail.view',
  'adage.download',
  'adage.tribe_client',
  'adage.gene.searchFew',
  'adage.gene.searchMany',
  'adage.gene.network',
  'adage.signature',
  'adage.signatureSearch',
  'adage.help',
  'adage.sampleAnnotation',
  'adage.volcano-plot.view',
  'adage.utils'
])

.config(function myAppConfig($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/home');
})

// This configuration is required for all REST calls to the back end.
.config(['$resourceProvider', function($resourceProvider) {
  // Don't strip trailing slashes from calculated URLs.
  $resourceProvider.defaults.stripTrailingSlashes = false;
}])

.controller('AppCtrl', ['$scope', '$state', 'UserFactory', 'MlModelTracker',
  function AppCtrl($scope, $state, UserFactory, MlModelTracker) {
    // Machine learning model
    $scope.modelInfo = MlModelTracker;

    // inStateArr indicates whether the current state is in the stateArr
    // array. (Used by index.html to highlight tabs for ui-router states)
    $scope.inStateArr = function(stateArr) {
      var currState = $state.current.name;
      if (stateArr.indexOf(currState) === -1) {
        return false;
      } else {
        return true;
      }
    };

    $scope.$on('$stateChangeSuccess',
      function(event, toState, toParams, fromState, fromParams) {
        if (angular.isDefined(toState.data.pageTitle)) {
          $scope.pageTitle = toState.data.pageTitle + ' | adage';
        }
      }
    );

    UserFactory.getPromise().then(function() {
      $scope.userObj = UserFactory.getUser();
    });
  }
])
;
