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
//      src/app/ module called `signature` in its `services.js` file
.factory('SignatureService', ['$resource', 'ApiBasePath',
  function($resource, ApiBasePath) {
    // private methods for SignatureService
    var Participation = $resource(ApiBasePath + 'participation/');

    // public methods for SignatureService
    return {
      getGenesForSignaturesPromise: function(signatures) {
        var promise = Participation.get(
          {'signature__in': signatures.join(), 'limit': 0}
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
      //   {id: <signatureid-1>,
      //    name: "<signature-name-1>",
      //    diff: <difference-in-mean-activity>,
      //    logsig: <-log10(p-value-of-difference)>
      //   },
      //   {id: <signatureid-2>,
      //    name: "<signature-name-2>",
      //    ...
      //   },
      //   {...repeat for each signature...}
      // ]
    onClick: '&'
      // onClick (optional): supply a callback function to receive
      // notification when clicks are received within the plot. This is a
      // good way to check if the user has selected any signatures, so the
      // onClick function is called with a selectedSignatures parameter
      // containing an array of signature objects listing which signatures in
      // the plot have been selected. This list uses the same format as
      // plotData.
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
            var selectedSignatures = view.data('selectedSignatures').values()
              .reduce(function reduceSelectedSignatures(acc, datum) {
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
            vp.onClick({selectedSignatures: selectedSignatures});
          });
        });
      };
    }
  ]
})

.component('volcanoPlotSelection', {
  bindings: {
    mlModel: '<',
    selectedSignatures: '<',
    sampleGroups: '<'   // network view needs this context for annotation
  },
  templateUrl: 'volcano-plot/volcano-plot-selection.tpl.html',
  controller: ['$log', '$location', 'errGen', 'SignatureService',
    function VolcanoPlotSelectionCtrl($log, $location, errGen,
                                      SignatureService) {
      var cbVolcanoPlotSelection = this;
      this.showNetwork = function() {
        // genes, mlmodel, base_group, comp_group
        var signatureIds = this.selectedSignatures.map(
          function signaturesToIds(signatureObj) {
            return signatureObj.id;
          }
        );
        SignatureService.getGenesForSignaturesPromise(signatureIds).then(
          function success(genes) {
            $location.path('/gene_network/').search({
              'mlmodel': cbVolcanoPlotSelection.mlModel,
              'genes': genes.join(),
              'base_group':
                cbVolcanoPlotSelection.sampleGroups['base-group'].join(),
              'comp_group':
                cbVolcanoPlotSelection.sampleGroups['comp-group'].join()
            });
          },
          function error(httpResponse) {
            $log.error(
              errGen('Failed to retrieve genes for signatures', httpResponse)
            );
          }
        );
      };
    }
  ]
})

;
