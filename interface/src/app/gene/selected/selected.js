angular.module('adage.gene.selected', [
  'adage.gene.utils'
])

.factory('SelectedGenesFactory', [function() {
  var selectedGenes = {};

  return {
    clear: function() {
      selectedGenes = {};
    },

    addGene: function(geneObj) {
      selectedGenes[geneObj.id] = geneObj;
    },

    removeGene: function(geneObj) {
      delete selectedGenes[geneObj.id];
    },

    returnGenes: function() {
      return selectedGenes;
    }
  };
}])


// Directive for table containing search results
.directive('selectedGenesPanel', [function() {
  return {
    controller: ['$scope', 'SelectedGenesFactory', '$state',
      function($scope, SelectedGenesFactory, $state) {
        $scope.selectedGenes = SelectedGenesFactory.returnGenes();

        $scope.sendToNetwork = function() {
          var geneIds = Object.keys($scope.selectedGenes);
          var geneString = geneIds.join();

          $state.go('gene_network', {
            'genes': geneString
          });
        };
      }
    ],
    replace: true,
    restrict: 'E',
    scope: true,
    templateUrl: 'gene/selected/selected-genes-panel.tpl.html'
  };
}])

// Button directive for each of the genes that have been selected.
// Clicking it should remove the gene from the selected genes object
// in SelectedGenesFactory.
.directive('selectedGeneButton', [function() {
  return {
    controller: ['$scope', 'SelectedGenesFactory', 'CommonGeneFuncts',
      function($scope, SelectedGenesFactory, CommonGeneFuncts) {
        $scope.geneLabel = CommonGeneFuncts.getGeneLabel($scope.gene);

        $scope.removeGene = function() {
          SelectedGenesFactory.removeGene($scope.gene);
        };
      }
    ],
    restrict: 'E',
    replace: true,
    templateUrl: 'gene/selected/selected-gene-button.tpl.html'
  };
}])

;
