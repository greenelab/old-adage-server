angular.module('adage.help', [
])

.config(function config($stateProvider) {
  $stateProvider
    .state('help', {
      url: '/help',
      views: {
        'main': {
          templateUrl: 'help/help.tpl.html'
        }
      },
      data: {pageTitle: 'Help'}
    })
  ;
})

;
