/**
 * "adage.gene.network" module.
 */

angular.module('adage.gene.network', [
  'ui.router',
  'ui.bootstrap',
  'ngResource',
  'rzModule',
  'adage.utils',
  'adage.signature.resources',
  'adage.gene.resource'
])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('gene_network', {
    url: '/gene_network/?genes&mlmodel&base_group&comp_group',
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

.factory('Edge', ['$resource', 'ApiBasePath',
  function($resource, ApiBasePath) {
    return $resource(ApiBasePath + 'edge');
  }
])

.factory('ExpressionValue', ['$resource', 'ApiBasePath',
  function($resource, ApiBasePath) {
    return $resource(
      ApiBasePath + 'expressionvalue/',
      {},
      {post: {
        method: 'POST',
        // Setting Content-Type is required. Django will not process the
        // POST data the way Angular's defaults send it.
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }}
    );
  }
])

.controller('GeneNetworkCtrl',
  ['$stateParams', 'Edge', 'Signature', 'Gene', 'ExpressionValue', '$log',
    'errGen', '$httpParamSerializerJQLike',
    function GeneNetworkController(
      $stateParams, Edge, Signature, Gene, ExpressionValue, $log, errGen,
      $httpParamSerializerJQLike
    ) {
      var self = this;
      self.isValidModel = false;
      // Do nothing if mlmodel in URL is falsey. The error will be taken
      // care of by "<ml-model-validator>" component.
      if (!$stateParams.mlmodel) {
        return;
      }

      self.modelInUrl = $stateParams.mlmodel;

      // Do nothing if no genes are specified in URL.
      if (!$stateParams.genes || !$stateParams.genes.split(',').length) {
        self.statusMessage = 'No genes are specified.';
        return;
      }

      var baseSamples = $stateParams.base_group;
      var compSamples = $stateParams.comp_group;
      var geneColored = true;
      if (!baseSamples || !compSamples) {
        geneColored = false;
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
          .edgeLegendStart(minCorrelation)
          .edgeLegendEnd(maxCorrelation)
          .edgeLegendText('Edge Correlation');

      var geneTip, edgeTip;

      self.renderNetwork = function() {
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
            self.renderNetwork();
          }
        }
      };

      // Function that returns unique numerical gene IDs included in the URL.
      var getGenesInURL = function(genesParam) {
        var arr = [];
        genesParam.split(',').forEach(function(token) {
          var id = parseInt(token);
          if (!isNaN(id) && arr.indexOf(id) === -1) {
            arr.push(id);
          }
        });
        return arr;
      };

      var genesInURL = getGenesInURL($stateParams.genes);
      var genes = [];
      var edges = [];

      // Function that finds index of an input gene ID in "genes".
      var findGeneIndex = function(gid) {
        for (var i = 0; i < genes.length; ++i) {
          if (genes[i].id === gid) {
            return i;
          }
        }
        return -1;
      };

      // Function that returns the list of genes that will be queried.
      var getQueriedGenes = function(edgeList) {
        // The genes that will be queried on the server should be determined
        // by both genesInURL and edgeList, because even if a gene in the URL
        // doesn't have any edge in the database, it still should be displayed
        // in the network.
        var geneList = genesInURL.slice(0); // Copy all gene IDs from the URL.
        // Collect unique gene IDs in edgeList.
        edgeList.forEach(function(val) {
          if (geneList.indexOf(val.gene1) === -1) {
            geneList.push(val.gene1);
          }
          if (geneList.indexOf(val.gene2) === -1) {
            geneList.push(val.gene2);
          }
        });
        return geneList;
      };

      // Function that sets genes in the network.
      var setGenes = function(responseObject) {
        genes = responseObject.objects;
        genes.forEach(function(g) {
          g.label = g.standard_name ? g.standard_name : g.systematic_name;
          if (genesInURL.indexOf(g.id) !== -1) {
            g.query = true;
          }
        });
      };

      // Function that sets edges in the netowrk.
      var setEdges = function(edgeList) {
        // Build a hash with gene objects indexed by pk.
        var geneObjectHash = {};
        genes.forEach(function(geneObj) {
          geneObjectHash[geneObj.pk] = geneObj;
        });
        // Now we can process all edges
        for (var i = 0, n = edgeList.length; i < n; ++i) {
          var currEdge = edgeList[i];
          currEdge.gene1 = geneObjectHash[currEdge.gene1]; // gene1
          var idx = findGeneIndex(currEdge.gene1.id);
          currEdge['source'] = idx;
          currEdge.gene2 = geneObjectHash[currEdge.gene2]; // gene2
          idx = findGeneIndex(currEdge.gene2.id);
          currEdge['target'] = idx;
          edges.push(currEdge); // Add current edge
        }
        // IMPORTANT implementation detail: d3.network library will reset
        // edge.source and edge.target to the gene object later, so the values
        // of "source" and "target" properties of the edge won't be integers
        // any more.
      };

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
          Signature.get(
            {'heavy_genes': heavyGenes, 'limit': 0},
            function success(response) {
              var i = 0, n = response.objects.length;
              var anchorTag;
              htmlText += '<br>' + n +
                (n > 1 ? ' signatures are ' : ' signature is ');
              htmlText += 'related to both genes' + (n > 0 ? ':' : '.');
              for (; i < n; ++i) {
                anchorTag = '<a href="#/signature/' + response.objects[i].id +
                  '">';
                htmlText += '<br>* ' + anchorTag + response.objects[i].name;
                htmlText += '</a>';
              }
              edgeTip.html(htmlText);
              edgeTip.show(data, target);
            },
            function error(response) {
              var message = errGen(
                'Failed to get signature info for gene edge', response);
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

        // Draw network svg with edge and gene legend bars.
        network.showEdgeLegend();
        if (geneColored) {
          // Function to set the color of gene circles in d3 network:
          var setGeneColor = d3.scale.linear()
              .domain([-1.0, 0, 1.0]).range(['blue', 'white', 'red']);
          network.geneColor(setGeneColor).showGeneLegend();
        }
        self.renderNetwork();

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

      Edge.get(
        {genes: $stateParams.genes, mlmodel: $stateParams.mlmodel, limit: 0},
        function success(responseObject) {
          var edgeList = responseObject.objects;
          // Collect a list of distinct genes for query.
          var geneList = getQueriedGenes(edgeList);
          // Now retrieve the Gene objects using the geneList.
          Gene.get({'pk__in': geneList.join(), 'limit': 0},
            function success(responseObject) {
              setGenes(responseObject);
              if (genes.length === 0) {
                self.statusMessage =
                  'Gene(s) not found, please check the gene ID.';
                return;
              }
              setEdges(edgeList);
              // If genes in the network do not need to be colored, draw
              // the network and we are done.
              if (!geneColored) {
                self.statusMessage = '';
                drawNetwork();
                return;
              }
              // If gene circles should be colored, calculate each gene's
              // expression value difference between comp_group and base_group.
              var baseSampleIDs = baseSamples.split(',');
              baseSampleIDs = baseSampleIDs.map(function(x) {
                return parseInt(x);
              });
              var compSampleIDs = compSamples.split(',');
              compSampleIDs = compSampleIDs.map(function(x) {
                return parseInt(x);
              });

              var sampleID = baseSampleIDs.concat(compSampleIDs);
              var geneID = genes.map(function(g) {
                return g.id;
              });

              ExpressionValue.post(
                {},
                // Angular does not serialize POST data the way we would expect
                // so we have to do it manually here. For more details, see
                // https://github.com/angular/angular.js/issues/6039#issuecomment-113502695
                $httpParamSerializerJQLike({
                  'sample__in': sampleID.join(),
                  'order_by': 'gene',
                  'gene__in': geneID.join()
                }),
                function success(responseObject) {
                  // Function that calculates input gene's expression value
                  // based on the input array of base and comparison sums.
                  var calcGeneExpr = function(geneID, exprTracker) {
                    // Do nothing if the length of exprTracker is not 4, or one
                    // of the two groups doesn't have any expression values.
                    if (geneID === null || exprTracker.length !== 4 ||
                        !exprTracker[1] || !exprTracker[3]) {
                      return;
                    }
                    // Do nothing if input geneID is not found in genes.
                    var geneIndex = findGeneIndex(geneID);
                    if (geneIndex === -1) {
                      return;
                    }
                    var baseAvg = exprTracker[0] / exprTracker[1];
                    var compAvg = exprTracker[2] / exprTracker[3];
                    genes[geneIndex].exprVal = compAvg - baseAvg;
                  };

                  var i = 0, n = responseObject.objects.length;
                  var geneID = n > 0 ? responseObject.objects[0].gene : null;
                  // exprTracker[0]: sum of expression values in base_group;
                  // exprTracker[1]: # of expression values in base_group;
                  // exprTracker[2]: sum of expression values in comp_group;
                  // exprTracker[3]: # of expression values in comp_group;
                  var exprTracker = [0, 0, 0, 0];
                  for (; i < n; ++i) {
                    var currObj = responseObject.objects[i];
                    if (currObj.gene !== geneID) {  // reset exprTracker
                      calcGeneExpr(geneID, exprTracker);
                      geneID = currObj.gene;
                      exprTracker = [0, 0, 0, 0];
                    }
                    // Current record belongs to base_group
                    if (baseSampleIDs.indexOf(currObj.sample) !== -1) {
                      exprTracker[0] += currObj.value;
                      ++exprTracker[1];
                    } else { // Current record belongs to comp_group
                      exprTracker[2] += currObj.value;
                      ++exprTracker[3];
                    }
                  }
                  calcGeneExpr(geneID, exprTracker); // The last gene!
                  self.statusMessage = '';
                  drawNetwork();
                },
                function error(response) {
                  var message = errGen('Failed to get gene expression value',
                                       response);
                  $log.error(message);
                  self.statusMessage = message + '. Please try again later.';
                }
              );
            },
            function error(response) {
              var message = errGen('Failed to get genes', response);
              $log.error(message);
              self.statusMessage = message + '. Please try again later.';
            }
          );
        },
        function error(response) {
          var message = errGen('Failed to get edges', response);
          $log.error(message);
          self.statusMessage = message + '. Please try again later.';
        }
      );
    }
  ]
);
