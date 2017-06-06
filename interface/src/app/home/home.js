/**
 * adage.home module.
 */
angular.module('adage.home', [
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
.controller('HomeCtrl', ['GlobalModelInfo',
  function HomeController(GlobalModelInfo) {
    var self = this;
    self.modelInfo = GlobalModelInfo;
    self.changeModel = function(newModel) {
      GlobalModelInfo.set(newModel);
    };
  }
])
;
