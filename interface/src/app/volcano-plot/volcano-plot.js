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

.component('volcanoPlot', {
  bindings: {
    plotData: '<',
      // plotData is a json array with the following format:
      // [
      //   {id: <nodeid-1>,
      //    name: "<node-name-1>",
      //    diff: <difference-in-mean-activity>,
      //    logsig: <-log10(p-value-of-difference)>
      //   },
      //   {id: <nodeid-2>,
      //    name: "<node-name-2>",
      //    ...
      //   },
      //   {...repeat for each node...}
      // ]
    onClick: '&'
      // onClick (optional): supply a callback function to receive
      // notification when clicks are received within the plot. This is a
      // good way to check if the user has selected any nodes, so the
      // onClick function is called with a selectedNodes parameter
      // containing an array of node objects listing which nodes in the plot
      // have been selected. This list uses the same format as plotData.
  },
  templateUrl: 'volcano-plot/volcano-plot.tpl.html',
  controllerAs: 'vp',
  controller: ['$scope', 'VolcanoPlotSpec',
    function VolcanoPlotCtrl($scope, VolcanoPlotSpec) {
      var vp = this;
      // define controller instance variables that link with vega
      this.spec = VolcanoPlotSpec;
      this.data = this.plotData;
      this.viewParsed = function viewParsed(view) {
        // register a callback with vega to receive click events
        view.on('click', function viewClick(event, item) {
          $scope.$apply(function() {
            var selectedNodes = view.data('selectedNodes').values().reduce(
              function reduceSelectedNodes(acc, datum) {
                // vega maintains some private state information in this array
                // so we need to strip it out before passing a copy back
                if (datum['id']) {
                  var datumCopy = angular.copy(datum);
                  delete datumCopy['_id'];
                  delete datumCopy['_prev'];
                  acc.push(datumCopy);
                }
                return acc;
              },
              []
            );
            vp.onClick({selectedNodes: selectedNodes});
          });
        });
      };
    }
  ]
})

.component('volcanoPlotSelection', {
  bindings: {
    selectedNodes: '<'
  },
  templateUrl: 'volcano-plot/volcano-plot-selection.tpl.html'
})

;
