/*
 * The volcano-plot module provides a directive and controller for embedding
 * volcano plots in other views. Requires properly prepared data to be specified
 * via plotData.
 */
angular.module('adage.volcano-plot', [
  'ngResource',
  'ngVega',
  'greenelab.stats',
  'adage.utils',
  'adage.volcano-plot-vgspec'
])

// TODO when refactoring for issue #76, this service belongs in the top-level
//      src/app/ module called `node` in its `services.js` file
.factory('NodeService', ['$resource', 'ApiBasePath',
  function($resource, ApiBasePath) {
    // private methods for NodeService
    var Participation = $resource(ApiBasePath + 'participation/');

    // public methods for NodeService
    return {
      getGenesForNodesPromise: function(nodes) {
        var promise = Participation.get(
          {'node__in': nodes.join(), 'limit': 0}
        ).$promise.then(
          function success(value) {
            // when the data come back, condense the reponse into a flat list
            // of gene IDs with no repeated entries
            var geneList = value.objects.reduce(function reduce(acc, val) {
              if (acc.indexOf(val.gene.pk) === -1) {
                acc.push(val.gene.pk);
              }
              return acc;
            }, []);
            return geneList;
          }
        );
        return promise;
      }
    };
  }
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
      this.viewParsed = function(view) {
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
    mlModel: '<',
    selectedNodes: '<',
    sampleGroups: '<'   // network view needs this context for annotation
  },
  templateUrl: 'volcano-plot/volcano-plot-selection.tpl.html',
  controller: ['$log', '$location', 'errGen', 'NodeService',
    function VolcanoPlotSelectionCtrl($log, $location, errGen, NodeService) {
      var $ctrl = this;
      this.showNetwork = function() {
        // genes, mlmodel, base_group, comp_group
        var nodeIds = this.selectedNodes.map(function nodesToIds(nodeObj) {
          return nodeObj.id;
        });
        NodeService.getGenesForNodesPromise(nodeIds).then(
          function success(genes) {
            $location.path('/gene_network/').search({
              'mlmodel': $ctrl.mlModel,
              'genes': genes.join(),
              'base_group': $ctrl.sampleGroups['base-group'].join(),
              'comp_group': $ctrl.sampleGroups['comp-group'].join()
            });
          },
          function error(httpResponse) {
            $log.error(
              errGen('Failed to retrieve genes for nodes', httpResponse)
            );
          }
        );
      };
    }
  ]
})

;
