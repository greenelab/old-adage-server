angular.module('adage.analyze.detail', [
  'adage.sampleDetail.component',
  'adage.experimentDetail.component'
])

.controller('SearchDetailCtrl', ['$scope', '$location', '$timeout', '$state',
  function SearchDetailCtrl($scope, $location, $timeout, $state) {
    $scope.detail = {
      // The detail object contains all of the information needed for
      // displaying the detail page for search_item and includes convenience
      // methods for managing that information.
      showing: false,
      search_item: null,
      status: 'retrieving...',
      related_items: [],

      show: function(search_item) {
        $scope.detail.search_item = search_item;
        if (search_item.item_type === 'experiment') {
          $scope.detail.showing = false;
          $state.go('experiment', {'id': search_item.pk});
        } else {
          // only other valid item_type is sample
          $scope.detail.showing = false;
          $state.go('sample', {'id': search_item.pk});
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
            $scope.analyze.scroll_to_id($location.hash());
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
