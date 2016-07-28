angular.module( 'adage.analyze', [
  'adage.analyze.search',
  'adage.analyze.detail',
  'adage.analyze.analysis',
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

.controller( 'AnalyzeCtrl', ['$scope', '$uibModal', '$log', '$location',
  '$anchorScroll', 'Sample',
  function AnalyzeCtrl($scope, $uibModal, $log, $location, $anchorScroll,
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
            search_item.pk==$scope.detail.search_item.pk) {
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

    //////////////////////////
    // Analysis-related (heatmap) stuff here
    $scope.analysis = {
      sample_list: [],
      sample_objects: {},

      add_sample: function(sample_id) {
        if (this.sample_list.indexOf(+sample_id) != -1) {
          // quietly ignore the double-add
          $log.warn('analysis.add_sample: ' + sample_id + 
              ' already in the sample list; ignoring.');
        } else {
          this.sample_list.push(+sample_id);
        }
      },

      add_experiment: function(sample_id_list) {
        for (var i = 0; i < sample_id_list.length; i++) {
          this.add_sample(sample_id_list[i]);
        }
      },

      add_item: function(search_item) {
        $log.info('add_item: ' + search_item.item_type);
        if (search_item.item_type == 'sample') {
          $scope.analysis.add_sample(search_item.pk);
        } else if (search_item.item_type == 'experiment') {
          $scope.analysis.add_experiment(search_item.related_items);
        }
      },

      has_item: function(search_item) {
        if (search_item.item_type == 'sample') {
          if (this.sample_list.indexOf(+search_item.pk) != -1) {
            return true;
          } else {
            return false;
          }
        } else if (search_item.item_type == 'experiment') {
          // what we want to know, in the case of an experiment, is 'are
          // all of the samples from this experiment already added?'
          for (var i = 0; i < search_item.related_items.length; i++) {
            if (this.sample_list.indexOf(+search_item.related_items[i]) == -1) {
              return false;
            }
          }
          return true;
        }
      },

      show: function() {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'analyze/analysisModal.tpl.html',
          controller: 'AnalysisModalCtrl',
          size: 'lg',
          resolve: {
            analysis: function() {
              return $scope.analysis;
            }
          }
        });
      },

      getSampleDetails: function(pk) {
        Sample.get({id: pk},
          function(responseObject, responseHeaders) {
            if (responseObject) {
              $scope.analysis.sample_objects[pk] = responseObject;
            }
          },
          function(responseObject, responseHeaders) {
            $log.warn('Query for sample ' + pk + 
                ' errored with: ' + responseObject);
          }
        );
      }
    };

}])

.controller('AnalysisModalCtrl', function($scope, $uibModalInstance, analysis) {
  $scope.analysis = analysis;
  $scope.close = function() {
    $uibModalInstance.dismiss('close');
  };

  // populate sample details
  for (var i=0; i < $scope.analysis.sample_list.length; i++) {
    analysis.getSampleDetails($scope.analysis.sample_list[i]);
  }
})
;
