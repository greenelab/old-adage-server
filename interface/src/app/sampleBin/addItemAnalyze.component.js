angular.module('adage.sampleBin.addItemAnalyze', [
  'adage.analyze.sampleBin',  // TODO fix after sampleBin is fully refactored
  'adage.utils'
])

.component('addItemAnalyzeButton', {
  templateUrl: 'sampleBin/addItemAnalyze.component.tpl.html',
  bindings: {
    item: '<'
  },
  controller: ['SampleBin', 'MlModelTracker', '$log', '$state',
    function(SampleBin, MlModelTracker, $log, $state) {
      var ctrl = this;
      ctrl.sb = SampleBin;

      ctrl.addItemAnalyze = function() {
        SampleBin.addItem(ctrl.item);
        $state.go('analysis-detail', {'mlmodel': MlModelTracker.id});
      };

      ctrl.itemTooltip = function() {
        if (!ctrl.item) {
          return 'ititializing...';
        }

        // Determine what text to show as a tooltip for this item.
        if (SampleBin.hasItem(ctrl.item)) {
          return 'View analysis (already added)';
        }
        if (ctrl.item.item_type === 'sample') {
          return 'Add this sample and analyze';
        }
        if (ctrl.item.item_type === 'experiment') {
          return 'Add these samples and analyze';
        }
        $log.warn('itemTooltip: unknown item_type', ctrl.item);
        return 'Unknown item type';
      };
    }
  ]
})

;
