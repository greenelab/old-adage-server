/*
 * The analyze module handles the view that loads when a user clicks on
 * "Analyze" in the nav bar.
 */
angular.module('adage.analyze', [
  'adage.analyze.search',
  'adage.analyze.detail',
  'adage.analyze.analysis', // includes sample-bin
  'ui.router',
  'placeholders',
  'ui.bootstrap',
  'as.sortable',
  'ngAnimate',
  'ngSanitize'
])

.config(function config($stateProvider) {
  $stateProvider.state('analyze', {
    url: '/analyze?mlmodel',
    views: {
      'main': {
        controller: 'AnalyzeCtrl',
        templateUrl: 'analyze/analyze.tpl.html'
      }
    },
    data: {pageTitle: 'Analyze'}
  });
})

.controller('AnalyzeCtrl', ['$scope', '$stateParams', '$log', '$location',
  '$anchorScroll', 'Sample',
  function AnalyzeCtrl($scope, $stateParams, $log, $location, $anchorScroll,
                       Sample) {
    $scope.isValidModel = false;
    // Do nothing if mlmodel in URL is falsey. The error will be taken
    // care of by "<ml-model-validator>" component.
    if (!$stateParams.mlmodel) {
      return;
    }

    $scope.modelInUrl = $stateParams.mlmodel;

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
        $location.hash(id);
      }
    };
  }
])
;
