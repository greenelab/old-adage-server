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

.controller('AppCtrl', ['$scope', '$state', 'UserFactory', 'GlobalModelInfo',
  function AppCtrl($scope, $state, UserFactory, GlobalModelInfo) {
    // Machine learning model
    $scope.modelInfo = GlobalModelInfo;

    // Function that indicates whether the current state is 'gene_search'
    // or 'gene_network'. (Used by index.html to highlight the 'GeneNetwork'
    // tab on web UI in either state.)
    $scope.inGeneStates = function() {
      var currState = $state.current.name;
      return currState === 'gene_search' || currState === 'gene_network';
    };

    // Function that indicates whether the current state is 'signature' or
    // 'signature_search'. (Used by index.html to highlight the 'signature' tab
    // on web UI in either state.)
    $scope.inSignatureStates = function() {
      var currState = $state.current.name;
      return currState === 'signature' || currState === 'signature_search';
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
