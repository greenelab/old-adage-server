angular.module('adage.heatmap.component', [
  'adage.heatmap.service',
  'adage.heatmap-vgspec',
  'statusBar'
])

.component('heatmap', {
  templateUrl: 'heatmap/heatmap.component.tpl.html',
  bindings: {
    mlmodel: '<',
    samples: '<',
    onLoad: '&'
  },
  controller: ['$log', 'Heatmap', 'HeatmapSpec',
    function($log, Heatmap, HeatmapSpec) {
      var ctrl = this;

      // objects needed for Vega
      ctrl.heatmapSpec = HeatmapSpec;
      ctrl.heatmap = Heatmap;

      ctrl.$onInit = function() {
        ctrl.status = '';
        ctrl.samplesMissingActivity = [];
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
        ctrl.status = 'reloading...';
        Heatmap.init(mlmodel, samples);
        // TODO #278 need to make this call asynchronous
        Heatmap.loadData();
        ctrl.status = '';
      };
      ctrl.clearSamplesMissingActivity = function() {
        ctrl.samplesMissingActivity = [];
      };
      ctrl.removeSample = function(id) {
        var pos = ctrl.samplesMissingActivity.indexOf(+id);
        ctrl.samplesMissingActivity.splice(pos, 1);
        return;
      };

      // TODO #280 separate to new heatmap view
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
