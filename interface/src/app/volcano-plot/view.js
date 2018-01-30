/*
 * Simple view embedding a volcano-plot. Requires samples to be grouped in the
 * adage.analyze.sampleBin in order to function properly -- if no samples are
 * chosen or placed into groups, an error will be displayed.
 */
angular.module('adage.volcano-plot.view', [
  'ui.router',
  'adage.analyze.sampleBin',
  'adage.volcano-plot',
  'statusBar'
])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('volcano', {
    url: '/volcano?mlmodel',
    views: {
      main: {
        templateUrl: 'volcano-plot/view.tpl.html',
        controller: 'VolcanoPlotViewCtrl as ctrl'
      }
    },
    data: {pageTitle: 'Volcano Plot'}
  });
}])

.controller('VolcanoPlotViewCtrl', ['SampleBin', '$stateParams',
  // TODO make use of $stateParams (pulling from SampleBin for initial tests,
  //      but the right way to do this is to refactor so view.js pulls params
  //      for sample-base-group and sample-comp-group and does what's necessary
  //      to make a plot from those lists)
  function VolcanoPlotViewCtrl(SampleBin, $stateParams) {
    var ctrl = this;
    ctrl.isValidModel = false;
    // Do nothing if mlmodel in URL is falsey. The error will be taken
    // care of by "<ml-model-validator>" component.
    if (!$stateParams.mlmodel) {
      return;
    }

    this.mlModel = $stateParams.mlmodel;
    this.status = 'Retrieving plot data';
    var volcanoStatus;
    try {
      volcanoStatus = SampleBin.getVolcanoPlotData();
    } catch (e) {
      if (e instanceof RangeError) {
        var details = '';
        if (e.message) {
          details = ' (' + e.message + ')';
        }
        this.status = (
          'Error: make sure you have assigned at least one sample ' +
          'to each group' + details
        );
      } else if (e instanceof Error) {
        this.status = 'Error: ' + e.message;
      }
      return;
    }
    volcanoStatus.then(function() {
      ctrl.status = '';
    }).catch(function() {
      ctrl.status =
        'Data error: please ensure that all samples have activity data';
    });
    this.sampleGroups = SampleBin.getSamplesByGroup();
    this.data = SampleBin.volcanoData;
    this.selection = [];
    this.updateSelection = function(selectedSignatures) {
      ctrl.selection = selectedSignatures;
    };
  }
])
;
