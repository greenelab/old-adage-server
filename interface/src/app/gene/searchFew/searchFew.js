angular.module('adage.gene.searchFew', [
  'adage.gene.resource',
  'adage.gene.selected'
])


// Directive for whole gene search form
.directive('autocompleteSearchPanel', [function() {
  return {
    controller: ['$scope', function($scope) {
      $scope.switchToMany = function() {
        $scope.autocomplete.autocomplete = false;
      };
    }],
    restrict: 'E',
    scope: {
      organism: '=',
      autocomplete: '='
    },
    templateUrl: 'gene/searchFew/autocomplete-search-panel.tpl.html'
  };
}])

.directive('autocompleteSearchForm', [function() {
  return {
    controller: ['$scope', '$state', 'Gene', 'SelectedGenesFactory',
      function($scope, $state, Gene, SelectedGenesFactory) {
        var numResultsToReturn = 10;
        $scope.errors = null;
        $scope.autocompleteQuery = '';
        $scope.selectedGenes = SelectedGenesFactory.returnGenes();

        $scope.searchGenes = function(val) {
          $scope.loadingGenes = true;
          var qparams = {
            query: val,
            limit: numResultsToReturn
            // TODO: Whenever we add multi-organism support, we should
            // add the desired organism to qparams.
          };

          return Gene.autocomplete(qparams,
            // Success function
            function(data) {
              $scope.errors = null;
              $scope.loadingGenes = false;

              if (data.results.length === 0) {
                $scope.noResults = true;
              } else {
                $scope.noResults = false;
              }

              return data.results;
            },

            // Error function
            function(responseObject, responseHeaders) {
              $scope.errors = 'Gene search is temporarily down';
            }
          ).$promise.then(function(response) {
            return response.results;
          });
        };

        $scope.onSelect = function($item, $model, $label) {
          // Callback function from angular-bootstrap's typeahead
          SelectedGenesFactory.addGene($item);
          $scope.autocompleteQuery = '';
        };

        $scope.sendToNetwork = function() {
          var geneIds = Object.keys($scope.selectedGenes);
          var geneString = geneIds.join();

          $state.go('gene_network', {
            'genes': geneString
          });
        };
      }
    ],
    scope: {
      organism: '='
    },
    restrict: 'E',
    templateUrl: 'gene/searchFew/autocomplete-search-form.tpl.html'
  };
}])

;
