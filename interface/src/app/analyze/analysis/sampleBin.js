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

.factory('SampleBin', ['$log', '$cacheFactory', '$q', 'Sample', 'Activity',
function($log, $cacheFactory, $q, Sample, Activity) {
  var SampleBin = {
    heatmapData: {
      samples: []
    },
    sampleData: {},
    sampleCache: $cacheFactory('sample'),
    activityCache: $cacheFactory('activity'),

    addSample: function(id) {
      if (this.heatmapData.samples.indexOf(+id) !== -1) {
        // quietly ignore the double-add
        $log.warn('SampleBin.addSample: ' + id +
            ' already in the sample list; ignoring.');
      } else {
        this.heatmapData.samples.push(+id);
        // TODO when cache generalized: start pre-fetching sample data here
      }
    },

    removeSample: function(id) {
      var pos = this.heatmapData.samples.indexOf(+id);
      this.heatmapData.samples.splice(pos, 1);
      this.rebuildHeatmapActivity(this.heatmapData.samples);
    },

    addExperiment: function(sampleIdList) {
      for (var i = 0; i < sampleIdList.length; i++) {
        this.addSample(sampleIdList[i]);
      }
    },

    addItem: function(searchItem) {
      if (searchItem.item_type === 'sample') {
        this.addSample(searchItem.pk);
      } else if (searchItem.item_type === 'experiment') {
        this.addExperiment(searchItem.related_items);
      }
    },

    hasItem: function(searchItem) {
      if (searchItem.item_type === 'sample') {
        if (this.heatmapData.samples.indexOf(+searchItem.pk) !== -1) {
          return true;
        } else {
          return false;
        }
      } else if (searchItem.item_type === 'experiment') {
        // what we want to know, in the case of an experiment, is 'are
        // all of the samples from this experiment already added?'
        for (var i = 0; i < searchItem.related_items.length; i++) {
          if (this.heatmapData.samples.indexOf(
              +searchItem.related_items[i]) === -1) {
            return false;
          }
        }
        return true;
      }
    },

    getSampleData: function(id) {
      return this.sampleData[id];
    },
    setSampleData: function(id, obj) {
      this.sampleData[id] = obj;
    },

    getSampleObjects: function() {
      return this.heatmapData.samples.map(function(val, i, arr) {
        return this.getSampleData(val) || {id: val};
      }, this);
    },

    getSampleDetails: function(pk) {
      // TODO need to report query progress and errors somehow
      var cbSampleBin = this; // closure link to SampleBin for callbacks
      Sample.get({id: pk},
        function success(responseObject, responseHeaders) {
          if (responseObject) {
            cbSampleBin.setSampleData(pk, responseObject);
            // TODO need a trigger to update heatmapData?
          } else {
            $log.warn('Query for sample ' + pk + ' returned nothing.');
            // TODO user error reporting
          }
        },
        function error(responseObject, responseHeaders) {
          // TODO user error reporting
          $log.error($scope.analysis.queryStatus);
        }
      );
    },

    rebuildHeatmapActivity: function(samples) {
      // FIXME need a "reloading..." spinner or something while this happens
      var cbSampleBin = this; // closure link to SampleBin for callbacks
      var loadCache = function(responseObject) {
        if (responseObject) {
          var sampleID = responseObject.objects[0].sample;
          cbSampleBin.activityCache.put(sampleID, responseObject.objects);
          $log.info('populating cache with ' + sampleID);
          // TODO need to find & report (list) samples that
          // return no results
        } else {
          // FIXME what happens if responseObject is empty? (possible?)
          $log.error('responseObject is empty: what now?');
        }
      };
      var updateHeatmapActivity = function(activityPromisesFulfilled) {
        // when all promises are fulfilled, we can update heatmapData
        var newActivity = [];

        for (var i = 0; i < samples.length; i++) {
          var sampleActivity = cbSampleBin.activityCache.get(samples[i]);
          newActivity = newActivity.concat(sampleActivity);
        }
        cbSampleBin.heatmapData.activity = newActivity;
      };
      var logError = function(errObject) {
        $log.error('Query errored with: ' + errObject);
      };

      // preflight the cache and request anything missing
      var activityPromises = [];
      for (var i = 0; i < samples.length; i++) {
        var sampleActivity = this.activityCache.get(samples[i]);
        if (!sampleActivity) {
          $log.info('cache miss for ' + samples[i]);
          // cache miss, so populate the entry
          var p = Activity.get({'sample': samples[i]}).$promise;
          activityPromises.push(p);
          p.then(loadCache).catch(logError);
        }
      }
      // when the cache is ready, update the heatmap activity data
      $q.all(activityPromises).then(updateHeatmapActivity).catch(logError);
    },

    getActivityForSampleList: function(respObj) {
      // retrieve activity data for heatmap to display
      // FIXME restore query progress messages (see rebuildHeatmapActivity)
      // respObj.queryStatus = 'Retrieving sample activity...';
      this.rebuildHeatmapActivity(this.heatmapData.samples);
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
    $uibModal.open({
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
