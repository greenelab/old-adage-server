/**
 * adage.home module.
 */
angular.module('adage.home', [
  'ngSanitize',    // required by ng-bind-html
  'ui.router',
  'ui.bootstrap',
  'adage.mlmodel.components',
  'adage.utils'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config($stateProvider) {
  $stateProvider.state('home', {
    url: '/home',
    views: {
      'main': {
        controller: 'HomeCtrl as ctrl',
        templateUrl: 'home/home.tpl.html'
      }
    },
    data: {pageTitle: 'Home'}
  });
})

/**
 * And of course we define a controller for our route.
 */
.controller('HomeCtrl', ['MlModelTracker', function(MlModelTracker) {
  var self = this;
  self.modelInfo = MlModelTracker;
  self.changeModel = function(newModel) {
    MlModelTracker.set(newModel);
  };
}])
;
