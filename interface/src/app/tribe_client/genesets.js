angular.module('adage.tribe_client.genesets', [
  'adage.tribe_client.resource'
])

// Geneset Search Factory
// Allows for retreiving for and interacting with search results for genesets.
.factory('GenesetSearch', ['Genesets', function(Genesets) {
  var genesets = [];
  var query = {};
  var resultCount = null;

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
    },
    getResultCount: function() {
      return resultCount;
    },
    query: function(searchParams) {
      query = searchParams;
      Genesets.query(query, function(data) {
        resultCount = data.meta.total_count;
        genesets = data.objects;
      });
    }
  };
}])

.directive('genesetSearchForm', ['GenesetSearch', function(GenesetSearch) {
  return {
    controller: ['$scope', function($scope) {
      $scope.genesets = GenesetSearch.getGenesets();
    }],
    replace: true,
    restrict: 'E',
    scope: {
      limit: '=',
      organism: '='
    },
    templateUrl: 'tribe_client/geneset-search-form.tpl.html'
  };
}])


// Search box for users to enter their search text into
// and go search Tribe genesets.
.directive('genesetSearchBar', ['GenesetSearch', function(GenesetSearch) {
  return {
    controller: ['$scope', function($scope) {
      $scope.searchGenesets = function(search) {
        search['organism__scientific_name'] = $scope.organism;
        search['limit'] = $scope.limit;
        GenesetSearch.query(search);
        $scope.genesets = GenesetSearch.getGenesets();
      };
    }],
    replace: true,
    restrict: 'E',
    scope: {
      limit: '=',
      organism: '=',
      genesets: '='
    },
    templateUrl: 'tribe_client/geneset-search-bar.tpl.html'
  };
}])

// Directive for table containing search results
.directive('geneSetTable', ['GenesetSearch', function(GenesetSearch) {
  return {
    controller: ['$scope', function($scope) {
      // Number of results (in this case genesets) to come back
      // in each response page.
      $scope.limit = 10;

      $scope.genesetResultCount = GenesetSearch.getResultCount();

      var query = GenesetSearch.getQuery();
      query['limit'] = $scope.limit;
      query['organism__scientific_name'] = $scope.organism;

      GenesetSearch.query(query);
      $scope.genesets = GenesetSearch.getGenesets();
    }],
    replace: true,
    restrict: 'E',
    scope: {
      limit: '=',
      organism: '=',
      genesets: '='
    },
    templateUrl: 'tribe_client/geneset-result-table.tpl.html'
  };
}])

;
