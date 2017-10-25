angular.module('adage.analyze.detail', [
  'adage.sampleDetail.component',
  'adage.experimentDetail.component'
])

.controller('SearchDetailCtrl', ['$scope', '$location', '$timeout', '$state',
  function SearchDetailCtrl($scope, $location, $timeout, $state) {
    $scope.detail = {
      // The detail object contains all of the information needed for
      // displaying the detail page for searchItem and includes convenience
      // methods for managing that information.
      showing: false,
      searchItem: null,
      status: 'retrieving...',
      relatedItems: [],

      show: function(searchItem) {
        $scope.detail.searchItem = searchItem;
        if (searchItem.itemType === 'experiment') {
          $scope.detail.showing = false;
          $state.go('experiment', {'id': searchItem.pk});
        } else {
          // only other valid itemType is sample
          $scope.detail.showing = false;
          $state.go('sample', {'id': searchItem.pk});
        }
      },

      clear: function() {
        $scope.detail.showing = false;
        $scope.detail.status = null;
        // also check for hash in location field and scroll, if present,
        // since clearing the detail will reflow the search results and
        // potentially move the scroll point
        if ($location.hash()) {
          $timeout(function() {
            $scope.analyze.scrollToId($location.hash());
          }, 500);
        }
      }
    };
  }])

.directive('searchDetail', function() {
  return {
    restrict: 'E',
    templateUrl: 'analyze/search/searchDetail.tpl.html',
    controller: 'SearchDetailCtrl'
  };
})
;
