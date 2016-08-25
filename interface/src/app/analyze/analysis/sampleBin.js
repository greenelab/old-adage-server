angular.module( 'adage.analyze.sampleBin', [
  'adage.analyze.sample',
  'ngResource'
])

.factory( 'Activity', ['$resource', function($resource) {
  var Activity = $resource(
    '/api/v0/activity/'
  );
  return Activity;
}])

.factory( 'SampleBin', ['$log', 'Activity',
function($log, Activity) {
  var SampleBin = {
    samples: [],
    heatmapData: {}
  };
  
  SampleBin.getActivityForSampleList = function(respObj, successFn, failFn) {
    // retrieve activity data for heatmap to display
    $log.info("getting activity for samples: " + this.samples.join());
    respObj.queryStatus = "Retrieving sample activity...";
    Activity.get({sample__in: this.samples.join()}, successFn, failFn);
  };
  
  return SampleBin;
}])

.controller('SampleBinCtrl', ['$scope', '$log', '$uibModal', 'Sample',
'SampleBin',
function SampleBinCtrl($scope, $log, $uibModal, Sample, SampleBin) {

  // give our templates a way to access the SampleBin service
  $scope.sb = SampleBin;

  //////////////////////////
  // Analysis-related (heatmap) stuff here
  $scope.analysis = {
    // samples: [],
    sample_objects: {},

    add_sample: function(sample_id) {
      if (SampleBin.samples.indexOf(+sample_id) != -1) {
        // quietly ignore the double-add
        $log.warn('analysis.add_sample: ' + sample_id + 
            ' already in the sample list; ignoring.');
      } else {
        SampleBin.samples.push(+sample_id);
      }
    },
  
    remove_sample: function(sample_id) {
      var pos = SampleBin.samples.indexOf(sample_id);
      SampleBin.samples.splice(pos, 1);
      // this.getActivityForSampleList(this.samples);
      // FIXME: scope hierarchy kerfuffle here...
      SampleBin.getActivityForSampleList($scope.analysis,
        // success callback
        function(responseObject, responseHeaders) {
          if (responseObject) {
            $log.info('activity recs: ' + responseObject.meta.total_count);
            $scope.analysis.queryStatus = "";
            // $scope.analysis.vegaData.activity = responseObject.objects;
            // SampleBin.heatmapData = $scope.analysis.vegaData;
            SampleBin.heatmapData.activity = responseObject.objects;
            // TODO need to find & report (list) samples that return no results
          }
        },
        // failure callback
        function(responseObject, responseHeaders) {
          $log.error('Query errored with: ' + responseObject);
          // TODO need a unit test to prove this works
          $scope.analysis.queryStatus = "Query for activity failed.";
        }
      );
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
        if (SampleBin.samples.indexOf(+search_item.pk) != -1) {
          return true;
        } else {
          return false;
        }
      } else if (search_item.item_type == 'experiment') {
        // what we want to know, in the case of an experiment, is 'are
        // all of the samples from this experiment already added?'
        for (var i = 0; i < search_item.related_items.length; i++) {
          if (SampleBin.samples.indexOf(+search_item.related_items[i]) == -1) {
            return false;
          }
        }
        return true;
      }
    },

    show: function() {
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
    },

    getSampleDetails: function(pk) {
      Sample.get({id: pk},
        // success callback
        function(responseObject, responseHeaders) {
          if (responseObject) {
            $scope.analysis.sample_objects[pk] = responseObject;
            $scope.analysis.waitingForSampleDetails--;
          
            if ($scope.analysis.waitingForSampleDetails < 1) {
              // we've loaded the last of the sample_objects, so
              // convert anaysis.sample_objects to a list for vegaData
              $scope.analysis.vegaData = $scope.analysis.vegaData || {};
              // $log.info('about to set sample_objects');
              $scope.analysis.vegaData.sample_objects = Object.keys(
                $scope.analysis.sample_objects
              ).map(function(key) {
                return $scope.analysis.sample_objects[key];
              });
              // $log.info('okay, I set sample_objects');
              $scope.analysis.queryStatus = "";
            }
          } else {
            $log.warn('Query for sample ' + pk + ' returned nothing.');
            // TODO user error reporting
          }
        },
        // error callback
        function(responseObject, responseHeaders) {
          // TODO user error reporting (test)
          $scope.analysis.queryStatus = 'Query for sample ' + pk + 
              ' errored with: ' + responseObject;
          $log.error($scope.analysis.queryStatus);
        }
      );
    }
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

.controller('AnalysisModalCtrl', function($scope, $uibModalInstance, analysis) {
  $scope.analysis = analysis;
  $scope.close = function() {
    $uibModalInstance.dismiss('close');
  };
})
;
