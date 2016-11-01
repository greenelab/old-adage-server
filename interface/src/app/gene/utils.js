angular.module('adage.gene.utils', [

])

.factory('CommonGeneFuncts', [function() {
  return {

    updatePageGenes: function(scope, SearchResults) {
      var begin = (scope.currentPage - 1) * scope.itemsPerPage;
      var end = begin + scope.itemsPerPage;
      return SearchResults.getQueries().slice(begin, end);
    },

    updatePageNumbers: function(scope) {
      scope.pageDict.page = scope.page;
      scope.updatePage(scope.page);
    },

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
