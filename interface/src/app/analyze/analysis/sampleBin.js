/*
 * The sampleBin module provides a service for collecting the samples selected
 * for analysis by the user (this would be a shopping cart in an e-commerce
 * web site). It also provides utilities for retrieving additional sample
 * information and activity levels required for drawing the heatmap.
 */
angular.module('adage.analyze.sampleBin', [
  'adage.analyze.sample',
  'ngResource'
])

.factory('Activity', ['$resource', function($resource) {
  return $resource('/api/v0/activity/');
}])

.factory('SampleBin', ['$log', 'Sample', 'Activity',
function($log, Sample, Activity) {
  var SampleBin = {
    samples: [],
    heatmapData: {},
    sampleData: {},

    add_sample: function(id) {
      if (SampleBin.samples.indexOf(+id) !== -1) {
        // quietly ignore the double-add
        $log.warn('SampleBin.add_sample: ' + id +
            ' already in the sample list; ignoring.');
      } else {
        SampleBin.samples.push(+id);
        // TODO need to report query progress and errors somehow
        // TODO this should use caching and promises to fetch sample data
        // 1. check cache for existing Sample data. Hit = return
        // 2. if cache miss: 
        // 2a. getSampleDetails & append a promise to SampleBin.promises
        // 2b. getActivityForSample & append a promise to SampleBin.promises
        // ... now can use Promise.all(SampleBin.promises).then() to trigger
        // a redraw of the heatmap when ready
      }
    },

    remove_sample: function(id) {
      var pos = SampleBin.samples.indexOf(+id);
      SampleBin.samples.splice(pos, 1);
      // TODO now need to mutate SampleBin.heatmapData.activity rather than re-retrieve data
      Activity.get({sample__in: SampleBin.samples.join()},
        // success callback
        function(responseObject, responseHeaders) {
          if (responseObject) {
            SampleBin.heatmapData.activity = responseObject.objects;
            // TODO need to find & report (list) samples that return no results
          }
        },
        // failure callback
        function(responseObject, responseHeaders) {
          $log.error('Query errored with: ' + responseObject);
        }
      );
    },

    add_experiment: function(sample_id_list) {
      for (var i = 0; i < sample_id_list.length; i++) {
        SampleBin.add_sample(sample_id_list[i]);
      }
    },

    add_item: function(search_item) {
      if (search_item.item_type === 'sample') {
        SampleBin.add_sample(search_item.pk);
      } else if (search_item.item_type === 'experiment') {
        SampleBin.add_experiment(search_item.related_items);
      }
    },

    has_item: function(search_item) {
      if (search_item.item_type === 'sample') {
        if (SampleBin.samples.indexOf(+search_item.pk) !== -1) {
          return true;
        } else {
          return false;
        }
      } else if (search_item.item_type === 'experiment') {
        // what we want to know, in the case of an experiment, is 'are
        // all of the samples from this experiment already added?'
        for (var i = 0; i < search_item.related_items.length; i++) {
          if (SampleBin.samples.indexOf(+search_item.related_items[i]) === -1) {
            return false;
          }
        }
        return true;
      }
    },

    getSampleData: function(id) {
      return SampleBin.sampleData[id];
    },
    setSampleData: function(id, obj) {
      SampleBin.sampleData[id] = obj;
    },

    getSampleObjects: function() {
      return SampleBin.samples.map(function(val, i, arr) {
        return SampleBin.getSampleData(val) || {id: val};
      });
    },

    getSampleDetails: function(pk) {
      // TODO need to report query progress and errors somehow
      Sample.get({id: pk},
        // success callback
        function(responseObject, responseHeaders) {
          if (responseObject) {
            SampleBin.setSampleData(pk, responseObject);
            // TODO need a trigger to update heatmapData?
          } else {
            $log.warn('Query for sample ' + pk + ' returned nothing.');
            // TODO user error reporting
          }
        },
        // error callback
        function(responseObject, responseHeaders) {
          // TODO user error reporting
          $log.error($scope.analysis.queryStatus);
        }
      );
    },

    getActivityForSampleList: function(respObj, successFn, failFn) {
      // retrieve activity data for heatmap to display
      respObj.queryStatus = 'Retrieving sample activity...';
      Activity.get({sample__in: this.samples.join()}, successFn, failFn);
    }
  };

  return SampleBin;
}])

.controller('SampleBinCtrl', ['$scope', '$log', '$uibModal', 'Sample',
'SampleBin',
function SampleBinCtrl($scope, $log, $uibModal, Sample, SampleBin) {
  // give our templates a way to access the SampleBin service
  $scope.sb = SampleBin;

  $scope.show = function() {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'analyze/analysis/analysisModal.tpl.html',
      controller: 'AnalysisModalCtrl',
      size: 'lg',
      resolve: {
        analysis: function() {
          return $scope.analysis;
        }
      }
    });
  };
}])

.directive('sampleBin', function() {
  return {
    restrict: 'E',
    // scope: {},
    templateUrl: 'analyze/analysis/sampleBin.tpl.html',
    controller: 'SampleBinCtrl'
  };
})

.controller('AnalysisModalCtrl', ['$scope', '$uibModalInstance', 'analysis',
function($scope, $uibModalInstance, analysis) {
  $scope.analysis = analysis;
  $scope.close = function() {
    $uibModalInstance.dismiss('close');
  };
}])
;
