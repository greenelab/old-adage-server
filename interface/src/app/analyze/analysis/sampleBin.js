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
      samples: [],
      nodeOrder: null
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
        this.heatmapData.nodeOrder = null;  // reset to default order
      }
    },

    removeSample: function(id) {
      var pos = this.heatmapData.samples.indexOf(+id);
      this.heatmapData.samples.splice(pos, 1);
      this.heatmapData.nodeOrder = null;  // reset to default order
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
      var sampleObj = this.sampleData[id];
      sampleObj.activity = this.activityCache.get(id).map(
        // distill .activity to an array of just "value"s
        function(val, i, arr) {
          return val.value;
        }
      );
      return sampleObj;
    },
    setSampleData: function(id, obj) {
      this.sampleData[id] = obj;
      // TODO need to pre-fetch activity into cache here?
      //      (if so, also need to track promises)
    },

    getSampleObjects: function() {
      // reformat data from heatmapData.activity to a form that can be used
      // by hcluster.js: need a separate array of objects for each sample
      return this.heatmapData.samples.map(function(val, i, arr) {
        return this.getSampleData(val) || {id: val};
      }, this);
    },
    getNodeObjects: function() {
      // The heatmapData.activity array organizes activity data in a
      // representation convenient to render using vega.js: each element of the
      // array corresponds to one mark on the heatmap. For clustering by
      // hcluster.js, on the other hand, we need to reorganize the data so that
      // all activity for each *node* is collected in an array. The result is
      // essentially the same as that from `getSampleObjects` above, but
      // transposed. We achieve this without too many intermediate steps via
      // two nested Array.prototype.map() operations:

      // (1) first, we obtain a list of nodes by retrieving node activity
      //     for the first sample in our heatmap
      var firstSampleNodes = this.activityCache.get(
        this.heatmapData.samples[0]
      );
      // (2a) next, we build a new array (`retval`) comprised of `nodeObject`s
      //      by walking through the `firstSampleNodes` and constructing a
      //      `nodeObject` for each. [outer .map()]
      var retval = firstSampleNodes.map(function(val, i, arr) {
        var nodeObject = {
          'id': val.node,
          'activity': this.heatmapData.samples.map(
            // (2b) the array of activity for each node is built by plucking the
            //      activity `.value` for each sample within this node from the
            //      `activityCache` [inner .map()]
            function(sampId, i, arr) {
              // FIXME: counting on array order to match node order here
              return this.activityCache.get(sampId)[val.node - 1].value;
            },
            this
          )
        };
        return nodeObject;
      }, this);

      // (3) the two nested .map()s are all we need to do to organize the
      //     data for the convenience of hcluster.js, so we're done
      return retval;
    },

    getSampleDetails: function(pk) {
      // TODO caller can now implement user error reporting via $promise
      var cbSampleBin = this; // closure link to SampleBin for callbacks
      var pSample = Sample.get({id: pk},
        function success(responseObject, responseHeaders) {
          if (responseObject) {
            cbSampleBin.setSampleData(pk, responseObject);
          } else {
            $log.warn('Query for sample ' + pk + ' returned nothing.');
            // TODO user error reporting
          }
        },
        function error(responseObject, responseHeaders) {
          $log.error($scope.analysis.queryStatus);
        }
      ).$promise;
      return pSample;
    },

    _getIDs: function(val, i, arr) {
      return val.id;
    },
    clusterSamples: function() {
      // TODO implement non-blocking response here as done for clusterNodes()
      var sampleClust = hcluster()
        .distance('euclidean')
        .linkage('avg')
        .posKey('activity')
        .data(this.getSampleObjects());
      this.heatmapData.samples = sampleClust.orderedNodes().map(this._getIDs);
    },
    clusterNodes: function() {
      // declare some closure variables our callbacks will need
      var cbSampleBin = this,
        defer = $q.defer();

      setTimeout(function() {
        // We'd like the clustering code to run asynchronously so our caller
        // can display a status update and then remove it when finished.
        // setTimeout(fn, 0) is a trick for triggering this behavior
        defer.resolve(true);  // triggers the cascade of .then() calls below
      }, 0);

      return defer.promise.then(function() {
        // do the actual clustering (in the .data call here)
        var nodeClust = hcluster()
          .distance('euclidean')
          .linkage('avg')
          .posKey('activity')
          .data(cbSampleBin.getNodeObjects());
        // update the heatmap
        cbSampleBin.heatmapData.nodeOrder =
          nodeClust.orderedNodes().map(cbSampleBin._getIDs);
      });
    },

    rebuildHeatmapActivity: function(samples) {
      // FIXME need a "reloading..." spinner or something while this happens
      //  note: progress can be reported by returning a $promise to the caller
      var cbSampleBin = this; // closure link to SampleBin for callbacks
      var loadCache = function(responseObject) {
        if (responseObject) {
          var sampleID = responseObject.objects[0].sample;
          cbSampleBin.activityCache.put(sampleID, responseObject.objects);
          $log.info('populating cache with ' + sampleID);
          // TODO need to find & report samples that return no results
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
          // re-initialize nodeOrder, if needed
          if (i === 0 && !cbSampleBin.heatmapData.nodeOrder) {
            cbSampleBin.heatmapData.nodeOrder = sampleActivity.map(
              function(val, i, arr) {
                return val.node;
              }
            );
          }
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
      //  note: progress can be reported by returning a $promise to the caller
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
