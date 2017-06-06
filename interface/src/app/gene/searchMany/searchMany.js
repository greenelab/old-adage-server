angular.module('adage.gene.searchMany', [
  'ui.router',
  'adage.gene.resource',
  'adage.gene.utils',
  'adage.gene.selected',
  'adage.utils',
  'adage.mlmodel.components'
])

.config(function($stateProvider) {
  $stateProvider
    .state('gene_search', {
      url: '/gene_search?mlmodel',
      views: {
        'main': {
          templateUrl: 'gene/gene-network.tpl.html',
          controller: ['$stateParams', 'GlobalModelInfo', 'UserFactory',
          function($stateParams, GlobalModelInfo, UserFactory) {
            var self = this;
            self.isValidModel = false;
            // Do nothing if mlmodel in URL is falsey. The error will be taken
            // care of by "<ml-model-validator>" component.
            if (!$stateParams.mlmodel) {
              return;
            }

            self.modelInUrl = $stateParams.mlmodel;
            self.selectedMlModel = GlobalModelInfo;
            self.userObj = null;
            UserFactory.getPromise().then(function() {
              self.userObj = UserFactory.getUser();
            });

            // 'self.autocomplete' holds a boolean value, of whether or
            // not the user wants to use autocomplete search to look up a
            // few genes. If not, then the autocomplete search panel will
            // disappear, and the panel to search many genes will appear.
            //
            // *Note: This boolean value wasn't getting properly changed
            // in the child directives when it was passed as a primitive.
            // It needed to be either set as a property inside a new object
            // (which was then placed in the $scope object), or made part of
            // the controller instance object when using 'controllerAs' syntax.
            // We chose to follow this last approach as it is considered
            // a best practice. For more information on this, see:
            // https://github.com/angular/angular.js/wiki/Understanding-Scopes
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
      organism: '@',
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
        // Gene.search will query for all of the search terms in qparams,
        // returning a list of objects containing each search term and the
        // gene results for that term in each object. If the search
        // contained terms already found in our cache of searchResults,
        // those results are ignored while terms not already present will
        // be added to the cache.

        if (!$scope.geneQueries) { // if the query is empty
          return false;
        }

        var qparams = {'query': $scope.geneQueries};

        $scope.loadingSearchResults = true;

        if ($scope.organism) {
          qparams['organism'] = $scope.organism;
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
      queries: '=',
      organism: '@'
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
