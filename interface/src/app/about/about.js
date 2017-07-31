angular.module('adage.about', [
  'ui.router',
  'ui.bootstrap'
])

.config(function config($stateProvider) {
  $stateProvider.state('about', {
    url: '/about',
    views: {
      'main': {
        controller: 'AboutCtrl',
        templateUrl: 'about/about.tpl.html'
      }
    },
    data: {pageTitle: 'About'}
  });
})

.controller('AboutCtrl', function AboutCtrl($scope) {

})

;
