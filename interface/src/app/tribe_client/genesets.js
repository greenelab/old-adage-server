angular.module('adage.tribe_client.genesets', [
  'adage.tribe_client.resource'
])

.directive('genesetSearchForm', [function() {
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
.directive('genesetSearchBar', ['Genesets', function(Genesets) {
  return {
    controller: ['$scope', function($scope) {
      $scope.search = {};
      $scope.search['organism__scientific_name'] = $scope.organism;
      $scope.search['limit'] = $scope.limit;

      $scope.searchGenesets = function() {
        Genesets.query($scope.search, function(data) {
          $scope.genesetResultCount = data.meta.total_count;
          $scope.genesets = data.objects;
        });
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
.directive('genesetResultTable', [function() {
  return {
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
