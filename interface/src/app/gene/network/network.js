/**
 * "adage.gene.network" module.
 */

angular.module('adage.gene.network', [
  'ui.router',
  'ui.bootstrap',
  'ngResource',
  'rzModule',
  'adage.utils'
])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('gene_network', {
    url: '/gene_network/?genes&mlmodel',
    views: {
      main: {
        templateUrl: 'gene/network/network.tpl.html',
        controller: 'GeneNetworkCtrl as ctrl'
      }
    },
    // When "gene_network" state exits, remove "gene-tip" and "edge-tip"
    // elements from the DOM. (Without this function, the tips window will
    // be visible in other states too.)
    onExit: function() {
      var removeTips = function(className) {
        var elements = document.getElementsByClassName(className);
        var i, n;
        if (elements) { // This should be always true.
          n = elements.length;
          for (i = 0; i < n; ++i) {
            elements[i].parentNode.removeChild(elements[i]);
          }
        }
      };
      removeTips('gene-tip');
      removeTips('edge-tip');
    },
    data: {pageTitle: 'Gene Network'}
  });
}])

.factory('EdgeService', ['$resource', 'ApiBasePath',
function($resource, ApiBasePath) {
  // Possible parameters for this endpoint when making a query are:
  // {
  //   genes: Database IDs of genes associated with the edge,
  //   mlmodel: Database ID of MLModel associated with the edge,
  //   limit: Maximum number of results to return
  //  }
  return $resource(ApiBasePath + 'edge');
}])

.factory('NodeService', ['$resource', 'ApiBasePath',
function($resource, ApiBasePath) {
  return $resource(ApiBasePath + 'node');
}])

.controller('GeneNetworkCtrl',
   ['$stateParams', 'EdgeService', 'NodeService', '$log', 'errGen',
    function GeneNetworkController($stateParams, EdgeService, NodeService,
                                   $log, errGen) {
      var self = this;
      // Do nothing if no genes are specified in URL.
      if (!$stateParams.genes || !$stateParams.genes.split(',').length) {
        self.statusMessage = 'No genes are specified.';
        return;
      }

      // The following properties of "self" will be available to HTML.
      self.includePositive = true;
      self.includeNegative = true;
      self.statusMessage = 'Connecting to the server ...';

      var minCorrelation = -1.0, maxCorrelation = 1.0;
      var midPoint = (minCorrelation + maxCorrelation) / 2.0;
      var setEdgeColor = d3.scale.linear()
          .domain([minCorrelation, midPoint, maxCorrelation])
          .range(['green', 'orange', 'red']);

      var network = d3.network()  // Initialize the network.
          .minEdge(minCorrelation)
          .maxEdge(maxCorrelation)
          .edgeColor(setEdgeColor)
          .geneText(function(d) {
            return d.label;
          })
          .legendStart(minCorrelation)
          .legendEnd(maxCorrelation)
          .legendText('Correlation');

      var geneTip, edgeTip;

      self.updateSvg = function() {
        geneTip.hide();
        edgeTip.hide();
        var correlationSign;
        if (self.includeNegative && self.includePositive) {
          correlationSign = 0;
        } else if (self.includeNegative) {
          correlationSign = -1;
        } else {
          correlationSign = 1;
        }
        network.filterEdgeWeight(self.slider.min, self.slider.max,
                                 correlationSign);
        network.draw();
      };

      self.slider = {  // range slider configuration
        min: maxCorrelation / 2.0, // initial position of slider on the left
        max: maxCorrelation,       // initial position of slider on the right
        options: {
          floor: 0,                // minimum of the slider bar
          ceil: maxCorrelation,    // maximum of the slider bar
          step: 0.01,
          precision: 2,
          showTicks: 0.5,
          showTicksValues: true,
          noSwitching: true,
          onEnd: function(id, low, high) {
            self.updateSvg();
          }
        }
      };

      var urlGenes = $stateParams.genes.split(',');
      var genes = [];
      var edges = [];

      /**
       * Find index of input gene ID in genes array.
       * @arg {int} gid Input gene's ID.
       * @return {int} The index of gid, -1 if not found.
       */
      function findGeneIndex(gid) {
        for (var i = 0; i < genes.length; ++i) {
          if (genes[i].id === gid) {
            return i;
          }
        }
        return -1;
      }

      /**
       * Update input edge and gene data.
       * @param {edge} edgeIn;
       * @param {gene} geneIn;
       * @return {void}.
       */
      function updateData(edgeIn, geneIn) {
        if (geneIn !== edgeIn.gene1 && geneIn !== edgeIn.gene2) {
          return;
        } // Do nothing if edgeIn and geneIn are not related.

        var propertyName = (geneIn === edgeIn.gene1 ? 'source' : 'target');
        var idx = findGeneIndex(geneIn.id);
        if (idx === -1) {
          if (urlGenes.indexOf(geneIn.id.toString()) !== -1) {
            geneIn.query = true;
          }
          geneIn.label = (geneIn.standard_name ? geneIn.standard_name
                          : geneIn.systematic_name);
          genes.push(geneIn);
          idx = genes.length - 1;
        }
        edgeIn[propertyName] = idx;
        // IMPORTANT implementation detail: d3.network library will reset
        // edge.source and edge.target to the gene object later, so the values
        // of "source" and "target" properties of the edge won't be integers
        // any more.
      }

      /**
       * Draw gene-gene network.
       * @param {void} null;
       * @return {void}.
       */
      function drawNetwork() {
        // Calculate svg size.
        var minSvgSize = 600;  // Minimum size of svg.
        var maxSvgSize = 1280; // Maximum size of svg.
        var svgSize = genes.length * 10;
        if (svgSize < minSvgSize) {
          svgSize = minSvgSize;
        } else if (svgSize > maxSvgSize) {
          svgSize = maxSvgSize;
        }

        // Initialize tips on gene and edge.
        geneTip = d3.tip()
            .attr('class', 'gene-tip')
            .offset([-20, 0]);
        edgeTip = d3.tip()
            .attr('class', 'edge-tip')
            .offset([-20, 0]);

        /**
         * Compile gene information tips.
         * @param {selected_gene_data} data;
         * @return {string} The string in HTML format.
         */
        function getGeneInfo(data) {
          var result = '<div id="title">' + data.label + '</div>';
          result += '<br>Entrez ID: ' + data.entrezid;
          if (data.systematic_name) {
            result += '<br>Systematic name: ' + data.systematic_name;
          }
          if (data.standard_name) {
            result += '<br>Standard name: ' + data.standard_name;
          }
          if (data.description) {
            result += '<br>Description: ' + data.description;
          }
          if (data.aliases) {
            result += '<br>aliases: ' + data.aliases;
          }
          return result;
        }

        /**
         * Callback function to show gene tips when a gene is clicked.
         * @param {gene_data} data;
         * @return {void}.
         */
        function showGeneTip(data) {
          edgeTip.hide(); // Hide edge-tip window (if any) first.
          geneTip.show(data);
        }

        /**
         * Callback function to show edge tips when an edge is clicked.
         * @param {edge_data} data;
         * @return {void}.
         */
        function showEdgeTip(data) {
          geneTip.hide(); // Hide gene-tip window (if any) first.
          var weightPrecision = 3;
          var htmlText = 'Edge weight: ';
          htmlText += data.weight.toFixed(weightPrecision);
          var heavyGenes = [data.gene1.id, data.gene2.id].join(',');
          var target = d3.event.target;
          NodeService.get(
            {'heavy_genes': heavyGenes, 'limit': 0},
            function success(response) {
              var i = 0, n = response.objects.length;
              var anchorTag;
              htmlText += '<br>' + n + (n > 1 ? ' nodes are ' : ' node is ');
              htmlText += 'related to both genes' + (n > 0 ? ':' : '.');
              for (; i < n; ++i) {
                anchorTag = '<a href="#/node/' + response.objects[i].id + '">';
                htmlText += '<br>* ' + anchorTag + response.objects[i].name;
                htmlText += '</a>';
              }
              edgeTip.html(htmlText);
              edgeTip.show(data, target);
            },
            function error(response) {
              var message = errGen('Failed to get node info for gene edge: ',
                                   response);
              $log.error(message);
              htmlText += '<br>' + message + '. Please try again later.';
              edgeTip.html(htmlText);
              edgeTip.show(data, target);
            }
          );
        }

        network.genes(genes).edges(edges);
        d3.select('#chart').append('svg')  // Initialize SVG
          .attr('width', svgSize)
          .attr('height', svgSize)
          .call(network)
          .call(geneTip)
          .call(edgeTip);

        geneTip.html(getGeneInfo);
        network.onGene('click.custom', showGeneTip);
        network.onEdge('click.custom', showEdgeTip);

        // Draw network svg with legend.
        network.showLegend();
        self.updateSvg();

        // Add event handlers to gene-tip and edge-tip so that they will be
        // hidden when clicked:
        var addClickHandler = function(className, handler) {
          var elements = document.getElementsByClassName(className);
          var i, n;
          if (elements) {
            n = elements.length;
            for (i = 0; i < n; ++i) {
              elements[i].onclick = handler;
            }
          }
        };
        addClickHandler('gene-tip', geneTip.hide);
        addClickHandler('edge-tip', edgeTip.hide);
      } // End of drawNetwork()

      EdgeService.get(
        {genes: $stateParams.genes, mlmodel: $stateParams.mlmodel, limit: 0},
        function success(responseObject) {
          for (var i = 0, n = responseObject.objects.length; i < n; ++i) {
            var currEdge = responseObject.objects[i];
            updateData(currEdge, currEdge.gene1);
            updateData(currEdge, currEdge.gene2);
            edges.push(currEdge);
          }
          if (genes.length === 0) {
            self.statusMessage = 'Gene(s) not found, please check the gene ID.';
            return;
          }
          self.statusMessage = '';
          drawNetwork();
        },
        function error(response) {
          var message = errGen('Failed to get edges: ', response);
          $log.error(message);
          self.statusMessage = message + '. Please try again later';
        }
      );
    }
]);
