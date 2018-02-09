angular.module('adage.gene.selected', [
  'adage.gene.utils',
  'adage.gene.enrichedSignatures'
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
    controller: ['$scope', 'SelectedGenesFactory', '$state', 'CommonGeneFuncts',
      function($scope, SelectedGenesFactory, $state, CommonGeneFuncts) {
        $scope.selectedGenes = SelectedGenesFactory.returnGenes();

        $scope.sendToNetwork = function() {
          CommonGeneFuncts.sendToNetwork($scope, $state);
        };
      }
    ],
    restrict: 'E',
    scope: {
      mlModel: '@'
    },
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
    scope: {
      gene: '='
    },
    templateUrl: 'gene/selected/selected-gene-button.tpl.html'
  };
}])

;
