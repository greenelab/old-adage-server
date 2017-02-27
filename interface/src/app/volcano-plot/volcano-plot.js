/*
 * The volcano-plot module provides a directive and controller for embedding
 * volcano plots in other views. Requires samples to be grouped in the
 * adage.analyze.sampleBin in order to function properly -- if no samples are
 * chosen or placed into groups, an error will be displayed.
 */
angular.module('adage.volcano-plot', [
  'ngVega',
  'greenelab.stats',
  'adage.analyze.sampleBin',
  'adage.volcano-plot-vgspec'
])

.controller('VolcanoPlotCtrl', ['$scope', 'VolcanoPlotSpec', 'SampleBin',
  function VolcanoPlotCtrl($scope, VolcanoPlotSpec, SampleBin) {
    // define a controller instance variable that links with vega
    this.data = {
      source: $scope.plotData,
      selectedNodes: $scope.selectedNodes
    };
    this.spec = VolcanoPlotSpec;

    // give our templates a way to access the SampleBin service
    this.sb = SampleBin;
  }
])

.directive('volcanoPlot', function() {
  return {
    restrict: 'E',
    scope: {
      plotData: '=',
        // plotData is a json list with the following format:
        // [
        //   {
        //     'node': "<node-name-1>",
        //     'diff': "<difference-in-mean-activity>",
        //     'logsig': "<-log10(p-value-of-difference)>",
        //   },
        //   {...repeat for each node...}
        // ]
      selectedNodes: '='
        // selectedNodes is a json list with the following format:
        // [
        //   {
        //     'node': "<node-name-1>"
        //   },
        //   {
        //     'node': "<node-name-2>"
        //   },
        //   {...repeat for each node...}
        // ]
    },
    templateUrl: 'volcano-plot/volcano-plot.tpl.html',
    controller: 'VolcanoPlotCtrl as vp'
  };
})

;
