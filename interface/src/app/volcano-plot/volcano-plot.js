/*
 * The volcano-plot module provides a directive and controller for embedding
 * volcano plots in other views. Requires properly prepared data to be specified
 * via plotData.
 */
angular.module('adage.volcano-plot', [
  'ngVega',
  'greenelab.stats',
  'adage.volcano-plot-vgspec'
])

.controller('VolcanoPlotCtrl', ['$scope', 'VolcanoPlotSpec',
  function VolcanoPlotCtrl($scope, VolcanoPlotSpec) {
    // define controller instance variables that link with vega
    this.spec = VolcanoPlotSpec;
    this.data = $scope.plotData;
    // FIXME: can't get selectedNodes out this way... need to use view api?
    // $scope.plotData.selectedNodes: $scope.selectedNodes
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
