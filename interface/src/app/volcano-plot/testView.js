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
        templateUrl: 'volcano-plot/testView.tpl.html',
        controller: 'VolcanoPlotViewCtrl as ctrl'
      }
    },
    data: {pageTitle: 'Volcano Plot'}
  });
}])

.controller('VolcanoPlotViewCtrl', ['SampleBin', '$stateParams',
  // TODO make use of $stateParams (hard coded for initial tests)
  function VolcanoPlotViewCtrl(SampleBin, $stateParams) {
    // give our templates a way to access the SampleBin service
    this.sb = SampleBin;

    this.data = SampleBin.getVolcanoPlotData();
    // FIXME need to dig into vega internal data format to make selection work
    this.selection = [];
  }
])
;
