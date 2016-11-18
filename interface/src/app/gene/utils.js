angular.module('adage.gene.utils', [

])

.factory('CommonGeneFuncts', [function() {
  return {

    getGeneLabel: function(gene) {
      // Returns standard_name if it exists and systematic_name otherwise.
      var geneLabel = gene.systematic_name;

      if (gene.standard_name) {
        geneLabel = gene.standard_name;
      }

      return geneLabel;
    }

  };
}])

;
