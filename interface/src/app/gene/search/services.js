angular.module('adage.gene.search.services', [
  'adage.gene.resource'
])

.factory('SearchResults', ['$rootScope', 'Gene', function($rootScope, Gene) {
  var queries = [];
  var searchResults = {};
  var searchSuccess = null;

  return {
    getQueries: function() {
      return queries;
    },
    getQueryResults: function(query) {
      return searchResults[query];
    },
    getSearchResults: function() {
      return searchResults;
    },
    getSearchSuccess: function() {
      return searchSuccess;
    },
    remove: function(query) { // Remove a query and its associated result
      queries = queries.filter(function(el) {
        return el !== query;
      });
      delete searchResults[query];
      $rootScope.$broadcast('results.update');
    },
    clear: function() { // Clear the service
      queries = [];
      searchResults = {};
      $rootScope.$broadcast('results.update');
    },
    size: function() {
      return queries.length;
    },
    search: function(qparams) {
      // Gene.search will query for all of the search terms in qparams
      // returning a list of objects containing each search term and the
      // gene results for that term in each objects. If the search
      // contained terms already found in our cache of searchResults,
      // those results are ignored while terms not already present will
      // be added to the cache.
      Gene.search(qparams,
        function(data) {
          var previousQueries = queries.length;
          for (var i = 0; i < data.length; i++) {
            var query = data[i].search;
            if (!searchResults[query]) {
              // If search term didn't already exist
              searchResults[query] = data[i]; // add it to the results
              queries.push(query); // add to the list of queries
            }
          }
          if (previousQueries !== queries.length) {
            $rootScope.$broadcast('results.update');
          }
          searchSuccess = true;
          $rootScope.$broadcast('results.searchResultsReturned');
        },
        function(responseObject, responseHeaders) {
          searchSuccess = false;
          $rootScope.$broadcast('results.searchResultsReturned');
        }
      );
    }
  };
}])

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

;
