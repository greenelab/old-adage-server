angular.module('adage.gene.searchMany', [
  'adage.gene.resource',
  'adage.gene.utils',
  'adage.gene.selected'
])

.config(function($stateProvider) {
  $stateProvider
    .state('gene_search', {
      url: '/gene_search',
      views: {
        'main': {
          templateUrl: 'gene/gene-network.tpl.html',
          controller: ['UserFactory', function(UserFactory) {
            var self = this;
            self.userObj = null;
            UserFactory.getPromise().$promise.then(function() {
              self.userObj = UserFactory.getUser();
            });

            // TODO: Right now, we are hard-coding this organism
            // as Pseudomonas (since it is the only one currently
            // supported by ADAGE). However, as we incorporate
            // multi-species support, this organism will have to
            // be obtained from the ML model. This is the same as
            // the issue in geneSearchForm (also with $scope.organism).
            self.organism = 'Pseudomonas aeruginosa';

            // '$scope.autocomplete' holds a boolean value, of whether or
            // not the user wants to use autocomplete search to llok up a
            // few genes. If not, then the autocomplete search panel will
            // disappear, and the panel to search many genes will appear.
            // *Note: This boolean value wasn't getting properly propagated
            // through the scopes of this state and the child directives
            // if it was just placed in the $scope object. It needed to be
            // placed either inside a new object (which was then placed in
            // the $scope object), or making it part of the controller
            // instance object.
            self.autocomplete = true;
          }],
          controllerAs: 'searchCtrl'
        }
      },
      data: {
        pageTitle: 'Gene Search'
      }
    })
  ;
})


// Directive for panel where user can search many genes
.directive('geneSearchPanel', [function() {
  return {
    controller: ['$scope', function($scope) {
      $scope.loadingSearchResults = false;

      $scope.queries = [];
      $scope.searchResults = {};

      $scope.switchToFew = function() {
        $scope.autocomplete = true;
      };
    }],
    restrict: 'E',
    scope: {
      organism: '=',
      autocomplete: '='
    },
    templateUrl: 'gene/searchMany/gene-search-panel.tpl.html'
  };
}])


// Directive for whole gene search form
.directive('geneSearchForm', [function() {
  return {
    controller: ['$scope', 'Gene', function($scope, Gene) {
      $scope.errors = null;

      $scope.searchGenes = function() {
        // Gene.search will query for all of the search terms in qparams
        // returning a list of objects containing each search term and the
        // gene results for that term in each objects. If the search
        // contained terms already found in our cache of searchResults,
        // those results are ignored while terms not already present will
        // be added to the cache.

        if (!$scope.geneQueries) { // if the query is empty
          return false;
        }

        var qparams = {'query': $scope.geneQueries};

        $scope.loadingSearchResults = true;

        if ($scope.organism) {
          // TODO: adage doesn't currently support multiple organisms.
          // Therefore, when retrieving gene objects from the API gene
          // search endpoint, this will return *all* gene objects it finds,
          // without filtering for organism. At the point when we add
          // genes for more than one species to the database, we will
          // need to set this $scope.organism to whatever organism is in
          // the ML model (or genes for many organisms will be returned).
          // qparams['organism'] = $scope.organism;
        }

        Gene.search(qparams,
          function(data) {
            for (var i = 0; i < data.length; i++) {
              var query = data[i].search;
              if (!$scope.searchResults[query]) {
                // If search term didn't already exist
                $scope.searchResults[query] = data[i]; // add it to the results
              }
            }
            $scope.errors = null;
            $scope.loadingSearchResults = false;
          },

          function(responseObject, responseHeaders) {
            $scope.errors = 'Gene search is temporarily down';
            $scope.loadingSearchResults = false;
          }
        );
      };
    }],
    scope: {
      searchResults: '=',
      queries: '='
    },
    restrict: 'E',
    templateUrl: 'gene/searchMany/gene-search-form.tpl.html'
  };
}])

// Directive for table containing search results
.directive('searchResultTable', [function() {
  return {
    controller: ['$scope', 'SelectedGenesFactory',
      function($scope, SelectedGenesFactory) {
        $scope.currentPage = 1;
        $scope.itemsPerPage = 10;
        $scope.totalResults = 0;
        $scope.maxSize = 10;
        $scope.resultsForPage = [];

        $scope.updatePageGenes = function() {
          var begin = ($scope.currentPage - 1) * $scope.itemsPerPage;
          var end = begin + $scope.itemsPerPage;
          return $scope.queries.slice(begin, end);
        };

        $scope.addAllNonAmbiguous = function() {
          // Function to automatically add all genes that
          // only have one search result.
          for (var i = 0; i < $scope.queries.length; i++) {
            var key = $scope.queries[i];
            var results = $scope.searchResults[key];

            if (results.found.length <= 1) {
              if (results.found[0]) {
                SelectedGenesFactory.addGene(results.found[0]);
                delete $scope.searchResults[key];
              }
            }
          }
        };

        $scope.removeNotFound = function() {
          // Function to get rid of all the queries that returned no results.
          for (var i = 0; i < $scope.queries.length; i++) {
            var key = $scope.queries[i];
            var results = $scope.searchResults[key];

            if (results.found.length === 0) {
              delete $scope.searchResults[key];
            }
          }
        };

        $scope.$watchCollection('searchResults', function() {
          $scope.queries = Object.keys($scope.searchResults);
          $scope.totalResults = $scope.queries.length;
          $scope.resultsForPage = $scope.updatePageGenes();
        });


        // Watch for page changes and update
        $scope.$watch('currentPage', function() {
          $scope.resultsForPage = $scope.updatePageGenes();
        });
      }
    ],
    scope: {
      searchResults: '=',
      queries: '='
    },
    restrict: 'E',
    templateUrl: 'gene/searchMany/search-result-table.tpl.html'
  };
}])

// Directive for search buttonset, has buttons for handling
// search results
.directive('searchButtonset', [function() {
  return {
    controller: ['$scope', 'SelectedGenesFactory', 'CommonGeneFuncts',
      function($scope, SelectedGenesFactory, CommonGeneFuncts) {
        $scope.buttonPage = 1;
        $scope.queryResults = $scope.searchResults[$scope.query];
        $scope.found = $scope.queryResults.found;

        var begin;
        var end;
        $scope.updateButtonPage = function(page) {
          // Number of gene results that appear in each
          // 'page' of the search button-set.
          var genesPerPage = 3;

          begin = (page - 1) * genesPerPage;
          end = begin + genesPerPage;
          $scope.buttonPageGenes = $scope.found.slice(begin, end);

          // Boolean, telling whether or not there are any
          // additional results page
          $scope.additionalButtonPages = (end < $scope.found.length);

          // Boolean, telling whether or not there are any
          // previous results page
          $scope.previousButtonPages = (begin > 0);
        };
        $scope.updateButtonPage($scope.buttonPage);

        // Clicking this button removes the query token
        // from the list of search results.
        $scope.removeGene = function() {
          delete $scope.searchResults[$scope.query];
        };

        $scope.previousGenePage = function() {
          $scope.buttonPage -= 1;
          $scope.updateButtonPage($scope.buttonPage);
        };

        $scope.nextGenePage = function() {
          $scope.buttonPage += 1;
          $scope.updateButtonPage($scope.buttonPage);
        };

        $scope.getGeneLabel = function(gene) {
          return CommonGeneFuncts.getGeneLabel(gene);
        };

        $scope.addToSelectedGenes = function(gene) {
          SelectedGenesFactory.addGene(gene);
          delete $scope.searchResults[$scope.query];
        };
      }
    ],
    scope: {
      query: '@',
      queries: '=',
      searchResults: '='
    },
    restrict: 'E',
    templateUrl: 'gene/searchMany/search-buttonset.tpl.html'
  };
}])

;
