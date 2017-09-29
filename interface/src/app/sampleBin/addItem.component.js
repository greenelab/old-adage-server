angular.module('adage.sampleBin.addItem', [
  'adage.analyze.sampleBin'  // TODO fix after sampleBin is fully refactored
])

.component('addItemButton', {
  templateUrl: 'sampleBin/addItem.component.tpl.html',
  bindings: {
    item: '<'
  },
  controller: ['SampleBin', '$log',
    function(SampleBin, $log) {
      var ctrl = this;
      ctrl.sb = SampleBin;

      ctrl.itemTooltip = function() {
        if (!ctrl.item) {
          return 'initializing...';
        }

        // Determine what text to show as a tooltip for this item.
        if (SampleBin.hasItem(ctrl.item)) {
          return 'Already added to analysis';
        }
        if (ctrl.item.item_type === 'sample') {
          return 'Add this sample to analysis';
        }
        if (ctrl.item.item_type === 'experiment') {
          return 'Add these samples to analysis';
        }
        $log.warn('itemTooltip: unknown item_type', ctrl.item);
        return 'Unknown search item type';
      };
    }
  ]
})

;
