angular.module('adage.heatmap.component', [
  'adage.heatmap.service',
  'adage.heatmap-vgspec',
  'adage.sample.service',
  'statusBar'
])

.component('heatmap', {
  templateUrl: 'heatmap/heatmap.component.tpl.html',
  bindings: {
    mlmodel: '<',
    samples: '<',
    onLoad: '&'
  },
  controller: ['$log', 'Heatmap', 'HeatmapSpec', 'Sample',
    function($log, Heatmap, HeatmapSpec, Sample) {
      var ctrl = this;

      // objects needed for Vega
      ctrl.heatmapSpec = HeatmapSpec;
      ctrl.heatmap = Heatmap;

      // sample details to show for any samplesMissingActivity
      ctrl.sampleDetails = Sample.cache;

      ctrl.$onInit = function() {
        ctrl.status = 'retrieving data...';
        Heatmap.samplesMissingActivity = [];
      };
      ctrl.$onChanges = function(changesObj) {
        ctrl.show(
          changesObj.mlmodel.currentValue,
          changesObj.samples.currentValue
        );
      };
      ctrl.show = function(mlmodel, samples) {
        if (!mlmodel || !samples) {
          $log.warn(
            'adage.heatmap.component: show() called with mlmodel', mlmodel,
            'and samples', samples
          );
          return;
        }
        ctrl.$onInit();   // re-initialize properties
        Heatmap.init(mlmodel, samples);
        Heatmap.loadData().then(function() {
          ctrl.status = '';
        }).catch(function(errObject) {
          $log.error('Heatmap data load failed', errObject);
          ctrl.status = 'An error occurred while loading heatmap data.';
        });
      };
      ctrl.clearSamplesMissingActivity = function() {
        Heatmap.samplesMissingActivity = [];
      };
      ctrl.removeSample = function(id) {
        var pos = Heatmap.samplesMissingActivity.indexOf(+id);
        Heatmap.samplesMissingActivity.splice(pos, 1);
        return;
      };

      // wrap some SampleBin features to implement status updates
      ctrl.clusterSamples = function() {
        ctrl.status = 'clustering samples';
        Heatmap.clusterSamples().then(function() {
          ctrl.status = '';
        });
      };
      ctrl.clusterSignatures = function() {
        ctrl.status = 'clustering signatures (this will take a minute)';
        Heatmap.clusterSignatures().then(function() {
          ctrl.status = '';
        });
      };
    }
  ]
})

;
