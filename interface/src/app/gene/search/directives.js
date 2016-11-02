angular.module('adage.gene.search.directives', [
  'adage.gene.search.services',
  'adage.gene.utils'
])

// Directive for whole gene search form
.directive('geneSearchForm', ['SearchResults', function(SearchResults) {
  return {
    controller: ['$scope', '$rootScope', 'SearchResults',
      function($scope, $rootScope, SearchResults) {
        $scope.loadingSearchResults = false;

        // Clear any existing search results
        SearchResults.clear();

        $scope.errors = null;

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
          var searchSuccess = SearchResults.getSearchSuccess();
          if (searchSuccess === null || searchSuccess === false) {
            $scope.errors = 'Gene search is temporarily down';
          } else {
            $scope.errors = null;
          }
        });
      }
    ],
    replace: true,
    restrict: 'E',
    scope: {
      query: '@'
    },
    templateUrl: 'gene/search/gene-search-form.tpl.html'
  };
}])

// Directive for table containing search results
.directive('searchResultTable', ['SearchResults', 'CommonGeneFuncts',
  function(SearchResults, CommonGeneFuncts) {
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

            var searchResultKeys = Object.keys(searchResults);

            for (var i = 0; i < searchResultKeys.length; i++) {
              var key = searchResultKeys[i];
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

            var searchResultKeys = Object.keys(searchResults);

            for (var i = 0; i < searchResultKeys.length; i++) {
              var key = searchResultKeys[i];
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
          scope.resultsForPage = CommonGeneFuncts.updatePageGenes(
            scope, SearchResults);
        });

        scope.$on('results.loadingSearchResults', function() {
          scope.loadingSearchResults = true;
        });

        scope.$on('results.searchResultsReturned', function() {
          scope.loadingSearchResults = false;
        });

        // Watch for page changes and update
        scope.$watch('currentPage', function() {
          scope.resultsForPage = CommonGeneFuncts.updatePageGenes(
            scope, SearchResults);
        });
      },
      replace: true,
      restrict: 'E',
      scope: true,
      templateUrl: 'gene/search/search-result-table.tpl.html'
    };
  }
])

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
    templateUrl: 'gene/search/selected-genes-panel.tpl.html'
  };
}])

// A noResultButton is shown next to query tokens that found no matches
// for a gene in the database. Clicking this button removes the query token
// from the list of search results.
.directive('noResultButton', ['SearchResults', function(SearchResults) {
  return {
    link: function(scope, element, attr) {
      element.bind('click', function() {
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
    restrict: 'E',
    scope: {
      query: '@'
    },
    templateUrl: 'gene/search/no-result-button.tpl.html'
  };
}])

// Directive for button with a gene, should add gene
// and remove entire row from list
.directive('geneResultButton',
  ['SearchResults', 'SelectedGenesFactory', 'CommonGeneFuncts',
  function(SearchResults, SelectedGenesFactory, CommonGeneFuncts) {
    return {
      controller: function($scope) {
        $scope.geneLabel = CommonGeneFuncts.getGeneLabel($scope.gene);
      },
      restrict: 'E',
      link: function(scope, element, attr) {
        element.bind('click', function() {
          scope.$apply(function() {
            SelectedGenesFactory.addGene(scope.gene);
            SearchResults.remove(scope.query);
          });
        });
      },
      replace: true,
      templateUrl: 'gene/search/gene-result-button.tpl.html'
    };
  }
])

// Button directive for each of the genes that have been selected.
// Clicking it should remove the gene from the selected genes object
// in SelectedGenesFactory.
.directive('selectedGeneButton', ['SelectedGenesFactory', 'CommonGeneFuncts',
  function(SelectedGenesFactory, CommonGeneFuncts) {
    return {
      controller: function($scope) {
        $scope.geneLabel = CommonGeneFuncts.getGeneLabel($scope.gene);
      },
      restrict: 'E',
      link: function(scope, element, attr) {
        element.bind('click', function() {
          scope.$apply(function() {
            SelectedGenesFactory.removeGene(scope.gene);
          });
        });
      },
      replace: true,
      templateUrl: 'gene/search/gene-result-button.tpl.html'
    };
  }
])

// Directive for button to get more options, should get
// next page of search results for this query from the server
.directive('moreResultButton', ['SearchResults', 'CommonGeneFuncts',
  function(SearchResults, CommonGeneFuncts) {
    return {
      link: function(scope, element, attr) {
        element.bind('click', function() {
          scope.page = scope.pageDict.page + 1;
          scope.$apply(CommonGeneFuncts.updatePageNumbers(scope));
        });
      },
      replace: true,
      restrict: 'E',
      scope: false,
      templateUrl: 'gene/search/more-result-button.tpl.html'
    };
  }
])

// Directive for button to get previous search results
.directive('previousResultButton', ['SearchResults', 'CommonGeneFuncts',
  function(SearchResults, CommonGeneFuncts) {
    return {
      link: function(scope, element, attr) {
        element.bind('click', function() {
          scope.page = scope.pageDict.page - 1;
          scope.$apply(CommonGeneFuncts.updatePageNumbers(scope));
        });
      },
      replace: true,
      restrict: 'E',
      scope: false,
      templateUrl: 'gene/search/previous-result-button.tpl.html'
    };
  }
])

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
    restrict: 'E',
    replace: true,
    scope: {
      query: '='
    },
    templateUrl: 'gene/search/search-buttonset.tpl.html'
  };
}])

;
