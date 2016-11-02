angular.module('adage.gene.search', [
  'adage.gene.search.directives'
])

.config(function($stateProvider) {
  $stateProvider
    .state('gene_search', {
      url: '/gene_search',
      views: {
        'main': {
          templateUrl: 'gene/gene-network.tpl.html',
          controller: ['$scope', 'UserFactory',
            function($scope, UserFactory) {
              $scope.userObj = null;
              UserFactory.getPromise().$promise.then(function() {
                $scope.userObj = UserFactory.getUser();
              });

              // TODO: Right now, we are hard-coding this organism
              // as Pseudomonas (since it is the only one currently
              // supported by ADAGE). However, as we incorporate
              // multi-species support, this organism will have to
              // be obtained from the ML model. This is the same as
              // the issue in geneSearchForm (also with $scope.organism).
              $scope.organism = 'Pseudomonas aeruginosa';
            }
          ]
        }
      },
      data: {
        pageTitle: 'Gene Search'
      }
    })
  ;
})

;
