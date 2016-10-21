angular.module('adage.tribe_client.genesets', [
  'adage.tribe_client.resource'
])

// Geneset Search Factory
// Allows for retreiving for and interacting with search results for genesets.
.factory('GenesetSearch', function($rootScope, Genesets) {
  var genesets = [];
  var query = {};
  var totalResults = 0;

  return {
    getQuery: function() {
      return query;
    },
    getGenesets: function() {
      return genesets;
    },
    clear: function() {
      query = {};
      genesets = [];
      $rootScope.$broadcast('genesets.update');
    },
    totalResults: function() {
      return totalResults;
    },
    query: function(searchParams) {
      query = searchParams;
      Genesets.query(query, function(data) {
        totalResults = data.meta.total_count;
        genesets = data.objects;
        $rootScope.$broadcast('genesets.update');
      });
    }
  };
})

// Search box for users to enter their search text into
// and go search Tribe.
.directive('genesetSearchForm', function(GenesetSearch) {
  return {
    controller: ['$scope', function($scope) {
      $scope.searchGenesets = function(search) {
        search['organism__scientific_name'] = $scope.organism;
        GenesetSearch.query(search);
      };
    }],
    replace: true,
    restrict: "E",
    scope: {
      limit: '=limit',
      organism: '='
    },
    templateUrl: 'tribe_client/geneset-search-form.tpl.html'
  };
})

// Directive for table containing search results
.directive('geneSetTable', function(GenesetSearch) {
  return {
    controller: ['$scope', function($scope) {
      $scope.currentPage = 1;
      $scope.totalResults = 0;

      // Number of results (in this case genesets) to come back
      // in each page.
      $scope.limit = 10;
      $scope.genesets = GenesetSearch.getGenesets();

      var query = GenesetSearch.getQuery();
      query['limit'] = $scope.limit;
      query['show_tip'] = true;
      query['organism__scientific_name'] = $scope.organism;
      GenesetSearch.query(query);
    }],
    link: function(scope, element, attr) {
      scope.$on('genesets.update', function() {
        scope.genesets = GenesetSearch.getGenesets();
        scope.totalResults = GenesetSearch.totalResults();
      });
    },
    replace: true,
    restrict: "E",
    templateUrl: 'tribe_client/geneset-result-table.tpl.html'
  };
})

;
