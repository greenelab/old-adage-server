angular.module('adage.gene.search', [
  'adage.gene.resource'
])

.config(function($stateProvider) {
  $stateProvider
    .state('gene_search', {
      url: '/gene_search',
      views: {
        "main": {
          templateUrl: 'gene/gene-network.tpl.html',
          controller: ['$scope', 'UserFactory',
            function($scope, UserFactory) {
              UserFactory.getPromise().$promise.then(function() {
                $scope.userObj = UserFactory.getUser();
              });
            }
          ]
        }
      },
      data: {
        pageTitle: 'Gene Search'
      }
    })

  .state('gene_network', {
    url: '/gene_network/',
    views: {
      "main": {}
    },
    data: {
      pageTitle: 'Gene Network'
    }
  });
})

.factory('SearchResults', ['$rootScope', 'Gene', function($rootScope, Gene) {
  var queries = [];
  var searchResults = {};

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
      // Search for genes and add the results to the service
      Gene.search(qparams, function(data) {
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
        $rootScope.$broadcast('results.searchResultsReturned');
      });
    }
  };
}])

.factory('SelectedGenesFactory', function() {
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
})

// Directive for whole gene search form
.directive('geneSearchForm', ['SearchResults', function(SearchResults) {
  return {
    controller: ['$scope', '$rootScope', 'SearchResults',
      function($scope, $rootScope, SearchResults) {
        $scope.loadingSearchResults = false;

        // Clear any existing search results
        SearchResults.clear();

        $scope.searchGenes = function() {
          if (!$scope.genesToAdd) { // if the query is empty
            return false;
          }
          $scope.loadingSearchResults = true;

          $rootScope.$broadcast('results.loadingSearchResults');

          var qparams = {
            'query': $scope.genesToAdd.query
          };

          if ($scope.organism) {
            // TODO: adage doesn't currently support multiple organisms.
            // Therefore, when retrieving gene objects from the API gene
            // search endpoint, this will return *all* gene objects it finds,
            // without filtering for organism. At the point when we add
            // genes for more than one species to the database, we will
            // need to set this $scope.organism to whatever organism is in
            // the ML model (or genes for many organisms will be returned).
            qparams['organism'] = $scope.organism;
          }

          SearchResults.search(qparams);
        };

        $scope.$on('results.searchResultsReturned', function() {
          $scope.loadingSearchResults = false;
        });
      }
    ],
    replace: true,
    restrict: "E",
    scope: {
      query: '@'
    },
    templateUrl: 'gene/gene-search-form.tpl.html'
  };
}])

// Directive for table containing search results
.directive('searchResultTable', ['SearchResults', function(SearchResults) {
  return {
    controller: ['$scope', 'SearchResults', 'SelectedGenesFactory',
      function($scope, SearchResults, SelectedGenesFactory) {
        $scope.currentPage = 1;
        $scope.itemsPerPage = 10;
        $scope.totalResults = 0;
        $scope.maxSize = 10;
        $scope.resultsForPage = [];
        $scope.searchResults = SearchResults.getSearchResults();
        $scope.loadingSearchResults = false;

        $scope.addAllNonAmbiguous = function() {
          // Function to automatically add all genes that
          // only have one search result.
          var searchResults = SearchResults.getSearchResults();
          for (var key in searchResults) {
            var results = searchResults[key];
            if (results.found.length <= 1) {
              if (results.found[0]) {
                SelectedGenesFactory.addGene(results.found[0]);
                SearchResults.remove(key);
              }
            }
          }
        };

        $scope.removeNotFound = function() {
          // Function to get rid of all the queries that returned no results.
          var searchResults = SearchResults.getSearchResults();
          for (var key in searchResults) {
            var results = searchResults[key];
            if (results.found.length === 0) {
              SearchResults.remove(key);
            }
          }
        };
      }
    ],

    link: function(scope, element, attr) {
      scope.$on('results.update', function() {
        scope.totalResults = SearchResults.size();
        var begin = ((scope.currentPage - 1) * scope.itemsPerPage);
        var end = begin + scope.itemsPerPage;
        scope.resultsForPage = SearchResults.getQueries().slice(begin, end);
      });

      scope.$on('results.loadingSearchResults', function() {
        scope.loadingSearchResults = true;
      });

      scope.$on('results.searchResultsReturned', function() {
        scope.loadingSearchResults = false;
      });

      // Watch for page changes and update
      scope.$watch('currentPage', function() {
        var begin = ((scope.currentPage - 1) * scope.itemsPerPage);
        var end = begin + scope.itemsPerPage;
        scope.resultsForPage = SearchResults.getQueries().slice(begin, end);
      });
    },
    replace: true,
    restrict: "E",
    scope: true,
    templateUrl: 'gene/search-result-table.tpl.html'
  };
}])

// Directive for table containing search results
.directive('selectedGenesPanel', function() {
  return {
    controller: ['$scope', 'SelectedGenesFactory', '$state',
      function($scope, SelectedGenesFactory, $state) {
        $scope.selectedGenes = SelectedGenesFactory.returnGenes();

        $scope.sendToNetwork = function() {
          var genes = [];
          for (var gene in $scope.selectedGenes) {
            genes.push(gene);
          }
          $state.go('gene_network', {
            'genes': genes
          });
        };
      }
    ],
    replace: true,
    restrict: "E",
    scope: true,
    templateUrl: 'gene/selected-genes-panel.tpl.html'
  };
})

// A noResultButton is shown next to query tokens that found no matches
// for a gene in the database. Clicking this button removes the query token
// from the list of search results.
.directive('noResultButton', ['SearchResults', function(SearchResults) {
  return {
    link: function(scope, element, attr) {
      element.bind("click", function() {
        // Because this results in data being updated
        // and isn't using ng-* listeners we need to
        // wrap things in $apply()
        // http://jimhoskins.com/2012/12/17/angularjs-and-apply.html
        scope.$apply(function() {
          SearchResults.remove(scope.query);
        });
      });
    },
    replace: true,
    restrict: "E",
    scope: {
      query: '@'
    },
    templateUrl: 'gene/no-result-button.tpl.html'
  };
}])

// Directive for button with a gene, should add gene
// and remove entire row from list
.directive('geneResultButton', ['SearchResults', 'SelectedGenesFactory',
  function(SearchResults, SelectedGenesFactory) {
    return {
      restrict: "E",
      link: function(scope, element, attr) {
        element.bind("click", function() {
          scope.$apply(function() {
            SelectedGenesFactory.addGene(scope.gene);
            SearchResults.remove(scope.query);
          });
        });
      },
      replace: true,
      templateUrl: 'gene/gene-result-button.tpl.html'
    };
  }
])

// Button directive for each of the genes that have been selected.
// Clicking it should remove the gene from the selected genes object
// in SelectedGenesFactory.
.directive('selectedGeneButton', ['SelectedGenesFactory',
  function(SelectedGenesFactory) {
    return {
      restrict: "E",
      link: function(scope, element, attr) {
        element.bind("click", function() {
          scope.$apply(function() {
            SelectedGenesFactory.removeGene(scope.gene);
          });
        });
      },
      replace: true,
      templateUrl: 'gene/gene-result-button.tpl.html'
    };
  }
])

// Directive for button to get more options, should get
// next page of search results for this query from the server
.directive('moreResultButton', ['SearchResults', function(SearchResults) {
  return {
    link: function(scope, element, attr) {
      element.bind("click", function() {
        scope.page = scope.pageDict.page + 1;
        scope.$apply(function() {
          scope.pageDict.page = scope.page;
          scope.updatePage(scope.page);
        });
      });
    },
    replace: true,
    restrict: "E",
    scope: false,
    templateUrl: 'gene/more-result-button.tpl.html'
  };
}])

// Directive for button to get previous search results
.directive('previousResultButton', ['SearchResults', function(SearchResults) {
  return {
    link: function(scope, element, attr) {
      element.bind("click", function() {
        scope.page = scope.pageDict.page - 1;
        scope.$apply(function() {
          scope.pageDict.page = scope.page;
          scope.updatePage(scope.page);
        });
      });
    },
    replace: true,
    restrict: "E",
    scope: false,
    templateUrl: 'gene/previous-result-button.tpl.html'
  };
}])

// Directive for search buttonset, has buttons for handling
// search results
.directive('searchButtonset', ['SearchResults', function(SearchResults) {
  return {
    controller: function($scope) {
      $scope.pageDict = {
        page: 1
      };
      $scope.results = SearchResults.getQueryResults($scope.query);
      $scope.found = $scope.results.found;

      var begin;
      var end;

      $scope.updatePage = function(page) {
        // Number of gene results that appear in each
        // 'page' of the search button-set.
        var genesPerPage = 3;

        begin = (page - 1) * genesPerPage;
        end = begin + genesPerPage;

        $scope.pageGenes = $scope.found.slice(begin, end);

        // Boolean, telling whether or not there is (are) any
        // additional results page(s)
        $scope.additionalPages = (end < $scope.found.length);

        // Boolean, telling whether or not there is (are) any
        // previous results page(s)
        $scope.previousPages = (begin > 0);
      };
      $scope.updatePage($scope.pageDict.page);
    },
    restrict: "E",
    replace: true,
    scope: {
      query: '='
    },
    templateUrl: 'gene/search-buttonset.tpl.html'
  };
}])

;
