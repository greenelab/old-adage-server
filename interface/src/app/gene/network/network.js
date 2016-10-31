/**
 * "adage.gene.network" module.
 */

angular.module('adage.gene.network', [
  'ui.router',
  'placeholders',
  'ui.bootstrap',
  'ui.slider'
])

.config(function config($stateProvider) {
  $stateProvider.state('gene_network', {
    url: '/gene_network/?genes&mlmodel',
    views: {
      main: {
        templateUrl: 'gene/network/network.tpl.html',
        controller: 'GeneNetworkCtrl as ctrl'
      }
    },
    data: {pageTitle: 'Gene Network'}
  });
})

.factory('EdgeService', ['$resource', function($resource) {
  return $resource('/api/v0/edge/');
}])

.factory('NodeService', ['$resource', function($resource) {
  return $resource('/api/v0/node/');
}])

.controller('GeneNetworkCtrl',
   ['$stateParams', 'EdgeService', 'NodeService', '$log',
    function GeneNetworkController($stateParams, EdgeService, NodeService,
                                   $log) {
      var rawMinWeight = -1.0;
      var rawMaxWeight = 1.0;
      var scaledMaxWeight = rawMaxWeight - rawMinWeight;
      var setEdgeColor = d3.scale.linear()
          .domain([0, scaledMaxWeight / 2.0, scaledMaxWeight])
          .range(['green', 'orange', 'red']);

      var network = d3.network()  // Initialize the network.
          .minEdge(0)
          .maxEdge(rawMaxWeight - rawMinWeight)
          .edgeColor(setEdgeColor)
          .geneText(function(d) {
            return d.label;
          })
          .legendStart(rawMinWeight)
          .legendEnd(rawMaxWeight)
          .legendText('Correlation');

      var self = this;
      // The following properties of "self" will be available to HTML.
      self.minCorrelation = -1.0;
      self.maxNodeNum = Number.MAX_SAFE_INTEGER;
      self.statusMessage = 'Connecting to the server ...';
      self.sliderOptions = {  // Slider configuration.
        range: 'max',
        stop: function(event, ui) {
          network.filter(self.minCorrelation - rawMinWeight,
                         self.maxNodeNum).draw();
        }
      };

      // Do nothing if no genes are specified in URL.
      if (!$stateParams.genes || !$stateParams.genes.split(',').length) {
        self.statusMessage = 'No genes are specified.';
        return;
      }

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
        var geneTip = d3.tip()
            .attr('class', 'gene-tip')
            .offset([-20, 0]);
        var edgeTip = d3.tip()
            .attr('class', 'edge-tip')
            .offset([-20, 0]);

        /**
         * Compile gene information tips.
         * @param {selected_gene_data} data;
         * @return {string} The string in HTML format.
         */
        function getGeneInfo(data) {
          var result = '<div id="title">' + data.label + '</div>';
          result += '<br />Entrez ID: ' + data.entrezid;
          if (data.systematic_name) {
            result += '<br />Systematic name: ' + data.systematic_name;
          }
          if (data.standard_name) {
            result += '<br />Standard name: ' + data.standard_name;
          }
          if (data.description) {
            result += '<br />Description: ' + data.description;
          }
          if (data.aliases) {
            result += '<br />aliases: ' + data.aliases;
          }
          return result;
        }

        /**
         * Callback function to show edge tips when mouse is over an edge.
         * @param {edge_data} data;
         * @return {void}.
         */
        function showEdgeTip(data) {
          var rawWeight = data.weight + rawMinWeight;
          var str = 'Edge weight: ' + rawWeight.toFixed(3);
          var heavyGenes = [data.gene1.id, data.gene2.id].join(',');
          var target = d3.event.target;
          NodeService.get(
            {'heavy_genes': heavyGenes, 'limit': 0},
            function success(response) {
              var n = response.objects.length;
              str += '<br />' + n + (n > 1 ? ' nodes are ' : ' node is ');
              str += 'related to both genes' + (n > 0 ? ':' : '.');
              for (var i = 0; i < n; ++i) {
                str += '<br />* ' + response.objects[i].name + '</li>';
              }

              edgeTip.html(str);
              edgeTip.show(data, target);
            },
            function error(err) {
              $log.error('Failed to get node info for gene edge: ' + err);
              str += 'Can\'t get node information, please try again later.';
              edgeTip.html(str);
              edgeTip.show(data, target);
            }
          );
        }

        /**
         * Callback function to hide edge tips.
         * @param {edge_data} data;
         * @return {void}.
         * ---------------------------------------------------------------------
         * Since the edge tip is shown asynchronously, when edgeTip.hide() is
         * called immediately to hide the tip box, the box won't be hidden if
         * it is shown AFTER mouseout action. To solve this problem,
         * edgeTip.hide() is called asynchronously after 100 millisecond.
         * This is more like a workaround. Not sure whether there is a better
         * solution.
         * ---------------------------------------------------------------------
         */
        function hideEdgeTip(data) {
          setTimeout(function() {
            edgeTip.hide();
          }, 100);
        }

        network.genes(genes).edges(edges);
        d3.select('#chart').append('svg')  // Initialize SVG
          .attr('width', svgSize)
          .attr('height', svgSize)
          .call(network)
          .call(geneTip)
          .call(edgeTip);

        geneTip.html(getGeneInfo);
        network.onGene('mouseover.custom', geneTip.show);
        network.onGene('mouseout.custom', geneTip.hide);
        network.onEdge('mouseover.custom', showEdgeTip);
        network.onEdge('mouseout.custom', hideEdgeTip);

        // Draw network svg with legend and filter.
        network.showLegend()
          .filter(self.minCorrelation - rawMinWeight, self.maxNodeNum)
          .draw();
      }

      EdgeService.get(
        {genes: $stateParams.genes, mlmodel: $stateParams.mlmodel, limit: 0},
        function success(responseObject) {
          for (var i = 0, n = responseObject.objects.length; i < n; ++i) {
            var currEdge = responseObject.objects[i];
            currEdge.weight = currEdge.weight - rawMinWeight;
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
        function error(errObject) {
          $log.error('Failed to get edges: ' + errObject);
          self.statusMessage = 'Connection to server failed';
        }
      );
    }
]);
