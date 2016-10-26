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
      // Number of results (in this case genesets) to come back
      // in each response page.
      $scope.limit = 10;
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
      $scope.search = {};
      $scope.search['organism__scientific_name'] = $scope.organism;
      $scope.search['limit'] = $scope.limit;

      $scope.searchGenesets = function() {
        GenesetSearch.query($scope.search);
        $scope.genesets = GenesetSearch.getGenesets();
        $scope.genesetResultCount = GenesetSearch.getResultCount();
        console.log($scope.genesets);
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
.directive('genesetResultTable', ['GenesetSearch', function(GenesetSearch) {
  return {
    controller: ['$scope', function($scope) {
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
