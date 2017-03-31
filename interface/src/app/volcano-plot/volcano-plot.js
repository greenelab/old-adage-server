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
  controllerAs: 'vp',
  controller: ['VolcanoPlotSpec',
    function VolcanoPlotCtrl(VolcanoPlotSpec) {
      // define controller instance variables that link with vega
      this.spec = VolcanoPlotSpec;
      this.data = this.plotData;
      // FIXME: can't get selectedNodes out this way... need to use view api?
      // $scope.plotData.selectedNodes: $scope.selectedNodes
      this.viewListener = function(view) {
        console.log('viewListener fired');
        view.on('click', function(event, item) {
          selectedNodes = view.data('selectedNodes').values();
          // console.log(JSON.stringify(selectedNodes));
          selectedNodes = selectedNodes.reduce(
            function(acc, datum) {
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
          console.log(JSON.stringify(selectedNodes));
        });
      };
    }
  ]
})

.component('volcanoPlotSelection', {
  bindings: {
    selectedNodes: '<'
  },
  templateUrl: 'volcano-plot/volcano-plot-selection.tpl.html',
  controller: function volcanoPlotSelectionCtrl() {
    this.$onInit = function() {
      console.log('volcanoPlotSelectionCtrl init');
    };
  }
})

;
