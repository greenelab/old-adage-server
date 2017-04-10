/*
 * Simple view embedding a volcano-plot. Requires samples to be grouped in the
 * adage.analyze.sampleBin in order to function properly -- if no samples are
 * chosen or placed into groups, an error will be displayed.
 */
angular.module('adage.volcano-plot.view', [
  'ui.router',
  'adage.analyze.sampleBin',
  'adage.volcano-plot'
])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('volcano', {
    url: '/volcano',
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
    SampleBin.getVolcanoPlotData();
    this.sampleGroups = SampleBin.getSamplesByGroup();
    this.data = SampleBin.volcanoData;
    this.selection = [];
    this.updateSelection = function(selectedNodes) {
      ctrl.selection = selectedNodes;
    };
  }
])
;
