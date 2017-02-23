angular.module('adage.tribe_client.genesets', [
  'adage.tribe_client.resource'
])

.directive('genesetSearchForm', [function() {
  return {
    controller: ['$scope', 'CommonGeneFuncts',
      function($scope, CommonGeneFuncts) {
        // Number of results (in this case genesets) to come back
        // in each response page.
        $scope.limit = 10;
        $scope.sendToNetwork = function() {
          CommonGeneFuncts.sendToNetwork($scope, $state);
        };
      }
    ],
    replace: true,
    restrict: 'E',
    scope: {
      organism: '@'
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

      $scope.searchGenesets = function() {
        var qparams = {};
        qparams['query'] = $scope.search.query;
        qparams['organism__scientific_name'] = $scope.organism;
        qparams['limit'] = $scope.limit;

        Genesets.query(qparams, function(data) {
          $scope.genesets = data.objects;
        });
      };
    }],
    replace: true,
    restrict: 'E',
    scope: {
      limit: '@',
      organism: '@',
      genesets: '='
    },
    templateUrl: 'tribe_client/geneset-search-bar.tpl.html'
  };
}])

// Directive for table containing search results
.directive('genesetResultTable', [function() {
  return {
    restrict: 'E',
    scope: {
      limit: '@',
      organism: '@',
      genesets: '=',
      selectedGeneset: '='
    },
    templateUrl: 'tribe_client/geneset-result-table.tpl.html',
    link: function($scope) {
      $scope.selectedGeneset = {};
      // TODO: Implement pagination for geneset search results in
      // case the number of results ($scope.genesetResultCount above)
      // is greater than this 'limit' parameter (the maximum number of
      // geneset results that the Tribe API should return at once).
    }
  };
}])

;
