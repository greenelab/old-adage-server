angular.module('adage.analyze.detail', [
  'adage.analyze.sample',
  'adage.analyze.experiment'
])

.controller('SearchDetailCtrl', ['$scope', '$log', '$location',
  '$timeout', 'Sample', 'Experiment',
  function SearchDetailCtrl($scope, $log, $location,
    $timeout, Sample, Experiment) {
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
        $scope.detail.showing = true;
        $timeout(function() {
          // if we inititate the scroll too early, the search results list
          // hasn't finished compressing width and it doesn't work right,
          // so this timeout waits until the transition has finished
          // before scrolling
          $scope.analyze.scroll_to_id(search_item.pk);
        }, 500);
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
