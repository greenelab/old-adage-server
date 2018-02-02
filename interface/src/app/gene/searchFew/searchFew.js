angular.module('adage.gene.searchFew', [
  'adage.gene.resource',
  'adage.gene.selected'
])


// Directive for whole gene search form
.directive('autocompleteSearchPanel', [function() {
  return {
    controller: ['$scope', function($scope) {
      $scope.switchToMany = function() {
        $scope.autocomplete = false;
      };
    }],
    restrict: 'E',
    scope: {
      organism: '@',
      mlModel: '@',
      autocomplete: '='
    },
    templateUrl: 'gene/searchFew/autocomplete-search-panel.tpl.html'
  };
}])

.directive('autocompleteSearchForm', [function() {
  return {
    controller: [
      '$scope', '$state', 'Gene', 'SelectedGenesFactory', 'CommonGeneFuncts',
      function($scope, $state, Gene, SelectedGenesFactory, CommonGeneFuncts) {
        var numResultsToReturn = 10;
        $scope.errors = null;
        $scope.autocompleteQuery = '';
        $scope.selectedGenes = SelectedGenesFactory.returnGenes();

        $scope.searchGenes = function(val) {
          $scope.loadingGenes = true;
          var qparams = {
            'query': val,
            'organism': $scope.organism
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
            },

            // Error function
            function(responseObject, responseHeaders) {
              $scope.errors = 'Gene search is temporarily down';
            }
          ).$promise.then(
            function(response) {
              var selectedIDs = Object.keys($scope.selectedGenes);
              var geneResultsList = response.results.filter(function(result) {
                return selectedIDs.indexOf(result.id.toString()) === -1;
              });
              return geneResultsList.slice(0, numResultsToReturn);
            }
          );
        };

        $scope.onSelect = function($item, $model, $label) {
          // Callback function from angular-bootstrap's typeahead
          SelectedGenesFactory.addGene($item);
          $scope.autocompleteQuery = '';
        };

        $scope.sendToNetwork = function() {
          CommonGeneFuncts.sendToNetwork($scope, $state);
        };

        $scope.findEnrichedSignatures = function() {
          CommonGeneFuncts.findEnrichedSignatures($scope, $state);
        };
      }
    ],
    scope: {
      organism: '@',
      mlModel: '@',
      switchToMany: '&'
    },
    restrict: 'E',
    templateUrl: 'gene/searchFew/autocomplete-search-form.tpl.html'
  };
}])

;
