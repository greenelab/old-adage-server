angular.module( 'adage.analyze', [
  'adage.analyze.search',
  'adage.analyze.detail',
  'adage.analyze.analysis', // for sample-bin
  // 'adage.analyze.sampleBin',
  'ui.router',
  'placeholders',
  'ui.bootstrap',
  'as.sortable',
  'ngAnimate',
  'ngSanitize'
])

.config(function config($stateProvider) {
  $stateProvider.state( 'analyze', {
    url: '/analyze',
    views: {
      "main": {
        controller: 'AnalyzeCtrl',
        templateUrl: 'analyze/analyze.tpl.html'
      }
    },
    data: { pageTitle: 'Analyze' }
  });
})

.run(['$anchorScroll', function($anchorScroll) {
  $anchorScroll.yOffset = 80;
}])

.controller( 'AnalyzeCtrl', ['$scope', '$log', '$location',
  '$anchorScroll', 'Sample',
  function AnalyzeCtrl($scope, $log, $location, $anchorScroll,
    Sample) {

    //////////////////////////
    // Analyze-related (overall layout) stuff here
    $scope.analyze = {
      item_style: function(search_item) {
        // Determine which CSS classes should apply to this search_item.
        // We want Experiments and Samples to look different. Also, if we are
        // looking at detail on this search_item, it should be highlighted.
        var classList = search_item.item_type;
        if ($scope.detail.showing &&
            search_item.pk === $scope.detail.search_item.pk) {
          classList += ' active';
        }
        return classList;
      },

      scroll_to_id: function(id) {
        $log.info("scroll_to_id called with: " + id);
        $location.hash(id);
        $anchorScroll();
      }
    };
}])
;
