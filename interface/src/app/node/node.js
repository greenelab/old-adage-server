/**
 * "adage.node" module.
 */

angular.module('adage.node', [
  'ui.router',
  'ui.bootstrap'
])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('node', {
    url: '/node/{id:int}',
    views: {
      main: {
        templateUrl: 'node/node.tpl.html',
        controller: 'NodeCtrl as ctrl'
      }
    },
    data: {pageTitle: 'Node Information'}
  });
}])

.factory('NodeInfo', ['$resource', function($resource) {
  return $resource('/api/v0/node/:id');
}])

.factory('ParticipationService', ['$resource', function($resource) {
  return $resource('/api/v0/participation/');
}])

.controller('NodeCtrl', ['NodeInfo', '$stateParams', '$log',
  function NodeController(NodeInfo, $stateParams, $log) {
    var self = this;
    if (!$stateParams.id) {
      self.statusMessage = 'Please specify node ID in the URL.';
      return;
    }
    self.id = $stateParams.id;
    self.statusMessage = 'Connecting to the server ...';
    NodeInfo.get(
      {id: self.id},
      function success(response) {
        self.name = response.name;
        self.mlmodel = response.mlmodel.title;
        self.statusMessage = '';
      },
      function error(err) {
        $log.error('Failed to get node information: ' + err.statusText);
        self.statusMessage = 'Failed to get node information from server';
      }
    );
  }
])

.directive('highWeightGenes', ['ParticipationService', '$log',
  function(ParticipationService, $log) {
    return {
      templateUrl: 'node/heavy_genes.tpl.html',
      restrict: 'E',
      scope: {
        nodeId: '@'
      },
      link: function($scope) {
        $scope.queryStatus = 'Connecting to the server ...';
        ParticipationService.get(
          {node: $scope.nodeId, limit: 0},
          function success(response) {
            $scope.genes = [];
            var i = 0, n = response.objects.length;
            var sysName, stdName, desc;
            var numHypo = 0;
            for (; i < n; ++i) {
              sysName = response.objects[i].gene.systematic_name;
              stdName = response.objects[i].gene.standard_name;
              desc = response.objects[i].gene.description;
              if (desc.toLowerCase() === 'hypothetical protein') {
                ++numHypo;
              }
              $scope.genes.push(
                {sysName: sysName, stdName: stdName, desc: desc});
            }
            $scope.hypoPercentage = Math.round(numHypo / n * 100);
            $scope.queryStatus = '';
          },
          function error(err) {
            $log.error('Failed to get high weight genes: ' + err.statusText);
            $scope.queryStatus = 'Failed to get high weight genes from server';
          }
        );
      }
    };
  }]
)

.directive('highRangeExp', ['$http', '$log', function($http, $log) {
  return {
    templateUrl: 'node/high_range_exp.tpl.html',
    restrict: 'E',
    scope: {
      nodeId: '@',
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
      $scope.numExpShown = $scope.topNum; // Current # of experiments on web UI.

      // Get activities that are related to the current node:
      var httpConfig = {params: {node: $scope.nodeId, limit: 0}};
      $http.get('/api/v0/activity/', httpConfig)
        .then(function success(response) {
          var sampleID;
          for (var i = 0; i < response.data.objects.length; ++i) {
            sampleID = response.data.objects[i].sample;
            $scope.activities[sampleID] = response.data.objects[i].value;
          }
          return $http.get('/api/v0/experiment/', httpConfig);
        }, function error(err) {
          $log.error('Failed to get activities: ' + err.statusText);
          $scope.queryStatus = 'Failed to get related activities from server';
        })
        // Get experiments that are related to the current node:
        .then(function success(response) {
          // enhanceExpData: a function that enhances the given experiment.
          // The enhancements include:
          // (1) Add a new key "isExpanded", whose default is false;
          // (2) Convert entries in sample_set from sample URI to sample ID,
          //     and delete samples that are not related to current node;
          // (3) Add a new "range" key, which is the range of activity values.
          //     (This key will be used to order experiments on web UI.)
          var enhanceExpData = function(exp) {
            exp.isExpanded = false;  // Enhancement (1)
            var nodeRelatedSamples = [];
            exp.sample_set.forEach(function(element) { // Enhancement (2)
              var parts = element.split('/');
              // The format of exp.sample_set[i] is "/api/v0/sample/1234/",
              // so after the split, "parts" will always include 6 entries:
              // ["", "api", "v0", "sample", "1234", ""]
              var sampleID = parts[parts.length - 2];
              if (sampleID in $scope.activities) {
                nodeRelatedSamples.push(sampleID);
              }
            });
            exp['sample_set'] = nodeRelatedSamples;
            // Enhancement (3): Add activity range
            var minActivity = null;
            var maxActivity = null;
            var sampleID, currValue;
            for (var i = 0, n = exp.sample_set.length; i < n; ++i) {
              sampleID = exp.sample_set[i];
              currValue = $scope.activities[sampleID];
              if (!minActivity || minActivity > currValue) {
                minActivity = currValue;
              }
              if (!maxActivity || maxActivity < currValue) {
                maxActivity = currValue;
              }
            }
            exp.range = maxActivity - minActivity;
          }; // end of enhanceExpData() definition.

          // setEmbedSpec: a function that sets the specification for vega-lite.
          // The second parameter "sample2index" maps a sample's ID to the index
          // of this sample in activityArr to make the toggling of "highlight"
          // flag faster.
          var setEmbedSpec = function(embedSpec, sample2index) {
            var activityArr = [];
            var samples = Object.keys($scope.activities);
            for (var i = 0; i < samples.length; ++i) {
              activityArr.push({
                'val': $scope.activities[samples[i]],
                'highlight': false
              });
              sample2index[samples[i]] = i;
            }
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
            embedSpec.spec = vlSpec;
          }; // end of setEmbedSpec() definition.

          // Enhance experiment objects and put them into $scope.experiments.
          response.data.objects.forEach(function(element) {
            enhanceExpData(element);
            $scope.experiments.push(element);
          });
          // Sort experiments by range in descending order:
          $scope.experiments.sort(function(e1, e2) {
            return e2.range - e1.range;
          });

          // Add vega-lite widget for each experiment:
          var embedSpec = {'mode': 'vega-lite', 'actions': false};
          var sample2index = {};
          // Function that toggles "highlight" flag of an experiment's samples:
          var toggleSampleHighlights = function(expIndex) {
            var currExp = $scope.experiments[expIndex];
            var j, sid, arrIndex, val;
            for (j = 0; j < currExp.sample_set.length; ++j) {
              sid = $scope.experiments[i].sample_set[j];
              arrIndex = sample2index[sid];
              val = embedSpec.spec.data.values[arrIndex].highlight;
              embedSpec.spec.data.values[arrIndex].highlight = !val;
            }
          };
          setEmbedSpec(embedSpec, sample2index); // Initialize embedSpec.
          // For each experiment, toggle the highlight flags (to true) for
          // all of its samples, embed the vega-lite widget, and toggle these
          // highlight flags again (to false). This procedure ensures that
          // only activitity values in current experiment will be highlighted
          // in the widget.
          for (var i = 0, n = $scope.experiments.length; i < n; ++i) {
            toggleSampleHighlights(i);
            vg.embed('#exp-' + i, embedSpec, function(error, result) { });
            toggleSampleHighlights(i);
          }
          // Clear $scope.queryStatus to indicate that the view is ready!
          $scope.queryStatus = '';
        }, function error(err) {
          $log.error('Failed to get activities: ' + err.statusText);
          $scope.queryStatus = 'Failed to get related experiments from server';
        }); // end of $http.get().then().then() chaining.

      // Event handler when user clicks "+" or "-" icon in front of
      // an experiment.
      $scope.toggleExpansion = function(exp) {
        exp.isExpanded = !exp.isExpanded;
        // Get samples data if they are not available yet.
        if (exp.isExpanded && !exp.samples) {
          exp.sampleStatus = 'Connecting to the server ...';
          var sampleURI = '/api/v0/sample/';
          var httpConfig = {params: {experiment: exp.accession}};
          $http.get(sampleURI, httpConfig)
            .then(function success(response) {
              exp.samples = [];
              // Add "activity" property to each sample that is related to the
              // current node. (It will be used to order samples on web UI.)
              response.data.objects.forEach(function(element) {
                if (element.id in $scope.activities) {
                  element.activity = $scope.activities[element.id];
                  exp.samples.push(element);
                }
              });
              exp.sampleStatus = '';
            }, function error(err) {
              $log.error('Failed to get sample data: ' + err.statusText);
              exp.sampleStatus = 'Failed to get sample data from ' + sampleURI;
            }
          );
        }
      };

      // Event handler when user clicks "Show All" button.
      $scope.showAll = function() {
        $scope.topMode = false;
        $scope.numExpShown = $scope.experiments.length;
      };

      // Event handler when user clicks "Show Top 20" button.
      $scope.showTop = function() {
        $scope.topMode = true;
        $scope.numExpShown = $scope.topNum;
      };
    }
  };
}]);
