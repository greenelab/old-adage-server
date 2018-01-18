angular.module('adage.heatmap.service', [
  'adage.analyze.sampleBin',  // TODO #278 make clean separation here
  'adage.utils'
])

.factory('Heatmap', ['SampleBin',
  function(SampleBin) {
    var Heatmap = {
      getActivityForSampleList: function(mlModelId, samples) {
        // retrieve activity data for heatmap to display
        if (!mlModelId) {
          $log.warn('getActivityForSampleList called before setting mlmodel');
          return;
        }
        // FIXME restore query progress messages (see rebuildHeatmapActivity)
        //  note: progress can be reported by returning a $promise to the caller
        // respObj.queryStatus = 'Retrieving sample activity...';
        SampleBin.rebuildHeatmapActivity(mlModelId, samples);
      }
    };
    return Heatmap;
  }
])

;
