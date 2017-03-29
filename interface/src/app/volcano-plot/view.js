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
  //      for sample-group-a and sample-group-b and does what's necessary to
  //      make a plot from those lists)
  function VolcanoPlotViewCtrl(SampleBin, $stateParams) {
    SampleBin.getVolcanoPlotData();
    this.data = SampleBin.volcanoData;
    // FIXME need to dig into vega internal data format to make selection work
    this.selection = [];
  }
])
;
