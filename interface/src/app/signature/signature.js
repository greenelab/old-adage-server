/**
 * "adage.signature" module.
 */

angular.module('adage.signature', [
  'ui.router',
  'ui.bootstrap',
  'adage.participation',
  'adage.signature.resources',
  'adage.utils',
  'greenelab.stats'
])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('signature', {
    url: '/signature/{id:int}',
    views: {
      main: {
        templateUrl: 'signature/signature.tpl.html',
        controller: 'SignatureCtrl as ctrl'
      }
    },
    data: {pageTitle: 'Signature Information'}
  });
}])


.controller('SignatureCtrl', ['Signature', '$stateParams', 'MlModelTracker',
  '$log', 'errGen',
  function SignatureController(Signature, $stateParams, MlModelTracker, $log,
                               errGen) {
    var self = this;
    if (!$stateParams.id) {
      self.statusMessage = 'Please specify signature ID in the URL.';
      return;
    }
    self.id = $stateParams.id;
    self.statusMessage = 'Connecting to the server ...';

    Signature.get(
      {id: self.id},
      function success(response) {
        self.name = response.name;
        MlModelTracker.set(response.mlmodel);
        self.modelID = MlModelTracker.id;
        console.log('self.modelID: ' + self.modelID);
        self.mlmodel = MlModelTracker.title;
        self.organism = MlModelTracker.organism.scientific_name;
        self.statusMessage = '';
      },
      function error(errObj) {
        MlModelTracker.init();
        var errMessage = errGen('Failed to get signature from server', errObj);
        $log.error(errMessage);
        self.statusMessage = errMessage +
          '. Please check the signature ID and/or try again later.';
      }
    );
    self.genes = [];
  }
])

.directive('participatoryGenes', ['Participation', '$log', 'errGen',
  function(Participation, $log, errGen) {
    return {
      templateUrl: 'signature/participatory_genes.tpl.html',
      restrict: 'E',
      scope: {
        signatureId: '@',
        selectedParticipationType: '=',
        genes: '='
      },
      link: function($scope) {
        $scope.queryStatus = 'Connecting to the server ...';

        $scope.topMode = true;
        $scope.topNum = 3;
        $scope.numGenesShown = $scope.topNum;

        $scope.setMode = function() {
          $scope.topMode = !$scope.topMode;
          $scope.numGenesShown =
            $scope.topMode ? $scope.topNum : $scope.genes.length;
        };

        $scope.$watch('selectedParticipationType', function() {
          if ($scope.selectedParticipationType) {
            Participation.get(
              {'node': $scope.signatureId, 'limit': 0,
                'participation_type': $scope.selectedParticipationType.id},
              function success(response) {
                $scope.genes = [];
                var i = 0, n = response.objects.length;
                var sysName, stdName, desc;
                var numHypo = 0;
                for (; i < n; ++i) {
                  sysName = response.objects[i].gene.systematic_name;
                  stdName = response.objects[i].gene.standard_name;
                  desc = response.objects[i].gene.description;
                  entrezID = response.objects[i].gene.entrezid;
                  if (desc.toLowerCase() === 'hypothetical protein') {
                    ++numHypo;
                  }
                  $scope.genes.push(
                    {sysName: sysName, stdName: stdName, desc: desc,
                      entrezID: entrezID});
                }
                $scope.hypoPercentage = Math.round(numHypo / n * 100);
                $scope.queryStatus = '';
              },
              function error(response) {
                var errMessage = errGen('Failed to get participatory genes',
                                        response);
                $log.error(errMessage);
                self.statusMessage = errMessage + '. Please try again later.';
              }
            );
          }
        });
      }
    };
  }]
)

// A service that defines the specifications of embedded vega-lite widget.
// It is used by "highRangeExp" directive.
.service('EmbedSpecService', [function() {
  // sample2index: a dictionary that maps a sample's ID to the index
  // of this sample's activity value in "EmbedSpecService.spec.data.values".
  // It will make the toggling of "highlight" flag faster.
  sample2index = {};

  this.mode = 'vega-lite';
  this.actions = false;
  // Method that sets vega-lite specification:
  this.setSpec = function(activities) {
    var activityArr = [];
    var samples = Object.keys(activities);
    samples.forEach(function(sampleID, index) {
      activityArr.push({
        'val': activities[sampleID],
        'highlight': false
      });
      sample2index[sampleID] = index;
    });

    var vlSpec = {
      'data': {values: activityArr},
      'mark': 'tick',
      'encoding': {
        'x': {
          'field': 'val',
          'type': 'quantitative',
          'axis': {
            'grid': false,
            'title': '',
            'format': 'r'
          }
        },
        'color': {
          'field': 'highlight',
          'type': 'nominal',
          'scale': {'range': ['black', 'red']},
          'legend': false
        },
        'size': {
          'field': 'highlight',
          'type': 'nominal',
          'scale': {'range': [10, 30]},
          'legend': false
        }
      }
    };
    this.spec = vlSpec;
  };

  // Method that toggles "highlight" flags based on input sample IDs:
  this.toggleLines = function(samples) {
    for (var i = 0; i < samples.length; ++i) {
      var arrIndex = sample2index[samples[i]];
      var val = this.spec.data.values[arrIndex].highlight;
      this.spec.data.values[arrIndex].highlight = !val;
    }
  };
}])

.directive('highRangeExp', ['Activity', 'SignatureExperiment',
  'EmbedSpecService', 'errGen', '$log',
  function(Activity, SignatureExperiment, EmbedSpecService, errGen, $log) {
    return {
      templateUrl: 'signature/high_range_exp.tpl.html',
      restrict: 'E',
      scope: {
        modelId: '@',
        signatureId: '@',
        inputTopNum: '@topExp'
      },
      link: function($scope) {
        $scope.queryStatus = 'Connecting to the server ...';
        $scope.activities = {};
        $scope.experiments = [];
        $scope.topMode = true;
        // If "top-exp" tag is not found, or its value is not a finite positive
        // integer, write a log message and set the value to 20.
        // Because the value of "top-exp" is passed into the directive by the
        // read-only '@', we use another variable "$scope.topNum" to denote the
        // validated number of top experiments.
        if (typeof $scope.inputTopNum === 'undefined') {
          $log.info('top-exp tag not found, reset it to 20.');
          $scope.topNum = 20;
        } else if (!isFinite($scope.inputTopNum) ||
                   parseInt($scope.inputTopNum) <= 0) {
          $log.warn('Invalid value of top-exp: ' + $scope.inputTopNum +
                    ', reset it to 20.');
          $scope.topNum = 20;
        } else {
          $scope.topNum = $scope.inputTopNum;
        }
        // Current number of experiments on web UI:
        $scope.numExpShown = $scope.topNum;

        // Get activities that are related to the current signature:
        var activityPromise = Activity.get(
          {node: $scope.signatureId, limit: 0}
        ).$promise;

        // Function that will be called to handle experiment data
        var handleExperimentResponse = function(response) {
          // enhanceExpData: a function that enhances the given experiment.
          // The enhancements include:
          // (1) Convert entries in sample_set from sample URI to sample ID,
          //     and delete samples that are not related to current signature;
          // (2) Add a new "range" property, which is the range of activity
          //     values, which will be used to order experiments on web UI.
          var enhanceExpData = function(exp) {
            var signatureRelatedSamples = [];
            exp.sample_set.forEach(function(element) { // Enhancement (1)
              var tokens = element.split('/');
              // The format of exp.sample_set[i] is "/api/v<n>/sample/1234/",
              // so after the split, "tokens" will always include 6 entries:
              // ["", "api", "v<n>", "sample", "1234", ""]
              var sampleID = tokens[tokens.length - 2];
              if (sampleID in $scope.activities) {
                signatureRelatedSamples.push(sampleID);
              }
            });
            exp['sample_set'] = signatureRelatedSamples;
            // Enhancement (2): Add activity range
            var minActivity = null;
            var maxActivity = null;
            var sampleID, currValue;
            for (var i = 0, n = exp.sample_set.length; i < n; ++i) {
              sampleID = exp.sample_set[i];
              currValue = $scope.activities[sampleID];
              if (minActivity === null || minActivity > currValue) {
                minActivity = currValue;
              }
              if (maxActivity === null || maxActivity < currValue) {
                maxActivity = currValue;
              }
            }
            exp.range = maxActivity - minActivity;
          };

          // Enhance experiment objects and put them into $scope.experiments.
          response.objects.forEach(function(element) {
            enhanceExpData(element);
            $scope.experiments.push(element);
          });
          // Sort experiments by range in descending order:
          $scope.experiments.sort(function(e1, e2) {
            return e2.range - e1.range;
          });
          // Add vega-lite widget for each experiment:
          EmbedSpecService.setSpec($scope.activities);
          $scope.experiments.forEach(function(exp, index) {
            EmbedSpecService.toggleLines(exp.sample_set);
            vg.embed('#exp-' + index, EmbedSpecService);
            EmbedSpecService.toggleLines(exp.sample_set);
          });
          // Indicate that the view is ready!
          $scope.queryStatus = '';
        };

        // Handle activities that are releted to the current signature.
        activityPromise.then(
          function success(response) {
            var sampleID;
            for (var i = 0; i < response.objects.length; ++i) {
              sampleID = response.objects[i].sample;
              $scope.activities[sampleID] = response.objects[i].value;
            }
            return SignatureExperiment.get({node: $scope.signatureId, limit: 0})
              .$promise;
          },
          function error(response) {
            var errMessage = errGen('Failed to get activities', response);
            $log.error(errMessage);
            $scope.queryStatus = errMessage + '. Please try again later.';
          }
        )
        // Handle experiments that are related to the current signature.
        .then(
          handleExperimentResponse,
          function error(response) {
            var errMessage = errGen('Failed to get experiments', response);
            $log.error(errMessage);
            $scope.queryStatus = errMessage + '. Please try again later.';
          }
        );

        // Event handler when user clicks "Show All" or "Show Top N" button.
        $scope.setMode = function() {
          $scope.topMode = !$scope.topMode;
          $scope.numExpShown =
            $scope.topMode ? $scope.topNum : $scope.experiments.length;
        };
      } // end of link function
    };
  }
])

.directive('enrichedGenesets', ['MathFuncts', 'PickledGenesetsService', '$log',
  function(MathFuncts, PickledGenesetsService, $log) {
    return {
      templateUrl: 'signature/enriched_genesets.tpl.html',
      restrict: 'E',
      scope: {
        organism: '@',
        selectedParticipationType: '=',
        genes: '=' // an array of high-weight genes in the Signature page.
      },
      link: function($scope) {
        $scope.queryStatus = 'Connecting to the server ...';

        $scope.topMode = true;
        $scope.topNum = 3;
        $scope.numGenesetsShown = $scope.topNum;

        $scope.setMode = function() {
          $scope.topMode = !$scope.topMode;
          $scope.numGenesetsShown =
            $scope.topMode ? $scope.topNum : $scope.enrichedGenesets.length;
        };

        $scope.pValueCutoff = 0.05;
        var pValueSigDigits = 3;

        // This is an object, where each key is the geneset ID, and each value
        // is an array of the genes that this geneset contains.
        var genesetGenes = {};

        // We want to fill out this array with the genesets that score a
        // p-value of less than the cutoff in the hypergeometric test.
        // Each geneset in this array will be an object containing just the
        // desired information.
        var relevantGenesetArray = [];

        // This is the main function that calculates the geneset enrichments.
        // It calculates the enrichment for each geneset that has genes
        // also present in the signature's high weight genes, and pushes that
        // geneset into the releventGenesetArray.
        var calculateEnrichments = function(geneGenesets, allGenesetInfo,
                                            totalGeneNum, cutoff) {
          var N = totalGeneNum;

          // This will be the number of genes from the high weight gene list
          // that are also present in any of the genesets that were returned
          var m = 0;

          // Fill out the genesetGenes object
          for (var i = 0; i < $scope.genes.length; i++) {
            var genesetList = null;
            var geneEntrezID = $scope.genes[i].entrezID;

            if (geneGenesets.hasOwnProperty(geneEntrezID)) {
              genesetList = geneGenesets[geneEntrezID];

              if (genesetList && genesetList.length > 0) {
                m += 1;
              }

              for (var j = 0; j < genesetList.length; j++) {
                var genesetID = genesetList[j];
                if (!genesetGenes[genesetID]) {
                  genesetGenes[genesetID] = [];
                }
                genesetGenes[genesetID].push($scope.genes[i]);
              }
            } else {
              $log.warn('Entrez ID: ' + geneEntrezID + ' not found in ' +
                        'genesets.');
            }
          }

          var pValueArray = [];

          var enrichedGenesetIDs = Object.keys(genesetGenes);

          for (i = 0; i < enrichedGenesetIDs.length; i++) {
            var k = genesetGenes[enrichedGenesetIDs[i]].length;
            var n = allGenesetInfo[enrichedGenesetIDs[i]].size;

            var pValue = 1 - MathFuncts.hyperGeometricTest(k, m, n, N);
            pValueArray.push(pValue);
          }

          var correctedPValues = MathFuncts.multTest.fdr(pValueArray);

          for (i = 0; i < enrichedGenesetIDs.length; i++) {
            var correctedPValue = correctedPValues[i].toPrecision(
              pValueSigDigits);

            if (correctedPValue < $scope.pValueCutoff) {
              var gsID = enrichedGenesetIDs[i];
              var genesetInfoObj = allGenesetInfo[gsID];

              relevantGenesetArray.push({
                'name': genesetInfoObj.name, 'dbase': genesetInfoObj.dbase,
                'url': genesetInfoObj.url, 'pValue': correctedPValue,
                'genes': genesetGenes[gsID].map(function(gene) {
                  return gene.stdName;
                }).join(' ')
              });
            }
          }

          relevantGenesetArray.sort(function(a, b) {
            return a.pValue - b.pValue;
          });

          return relevantGenesetArray;
        };

        $scope.$watch('genes', function() {
          if ($scope.genes.length > 0) {
            PickledGenesetsService.get(
              {organism: $scope.organism},
              function success(response) {
                var gsInfoArray = response.procs;
                var genesetsPerGene = response.genes;
                var totGeneNum = response.bgtotal;

                $scope.enrichedGenesets = calculateEnrichments(
                  genesetsPerGene, gsInfoArray,
                  totGeneNum, $scope.pValueCutoff
                );
              },
              function error(err) {
                $log.error('Failed to get unpickled genesets: ' +
                           err.statusText);
                $scope.queryStatus = 'Failed to get genesets from server';
              }
            );
          } else {
            $scope.enrichedGenesets = [];
          }
        });
      }
    };
  }
])
;
