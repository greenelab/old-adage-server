/*
 * The analysis module handles the detail view that comes up when a user clicks
 * on the sampleBin in the nav bar. It shows a sortable list of samples and
 * contains the heatmap, which is the primary feature of the analysis view.
*/
angular.module('adage.analyze.analysis', [
  'ui.router',
  'ngVega',
  'ngResource',
  'statusBar',
  'adage.analyze.sampleBin',
  'adage.mlmodel.components'
])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('analysis-detail', {
    url: '/analysis-detail?mlmodel',
    views: {
      main: {
        controller: 'AnalysisCtrl',
        templateUrl: 'analyze/analysis/analysisDetail.tpl.html'
      }
    },
    data: {pageTitle: 'Analysis Detail'}
  });
}])

.controller('AnalysisCtrl', ['$scope', '$log', '$q', '$state', '$stateParams',
  'SampleBin',
function AnalysisCtrl($scope, $log, $q, $state, $stateParams, SampleBin) {
  $scope.isValidModel = false;
  // Do nothing if mlmodel in URL is falsey. The error will be taken
  // care of by "<ml-model-validator>" component.
  if (!$stateParams.mlmodel) {
    return;
  }

  $scope.modelInUrl = $stateParams.mlmodel;
  SampleBin.getActivityForSampleList($scope.modelInUrl);
  $scope.analysis = {
    status: '',
    // TODO these exampleCols are temporarily hard-coded until a column chooser
    // feature can be added
    exampleCols: [
      {'typename': 'strain'},
      {'typename': 'genotype'},
      {'typename': 'medium'},
      {'typename': 'temperature'},
      {'typename': 'treatment'}
    ]
  };

  // give our templates a way to access the SampleBin service
  $scope.sb = SampleBin;

  // wrap some SampleBin features to implement status updates
  $scope.clusterSignatures = function() {
    $scope.analysis.status = 'clustering signatures (this will take a minute)';
    SampleBin.clusterSignatures().then(function() {
      $scope.analysis.status = '';
    });
  };

  $scope.showVolcanoPlot = function() {
    $state.go('volcano', {'mlmodel': $scope.modelInUrl});
  };

  // these options are important for making ngSortable work with tables
  $scope.sortableOptions = {
    containerPositioning: 'relative',
    placeholder: '<tr style="display: table-row;"></tr>'
  };

  // Vega objects
  $scope.heatmapSpec = {
    // TODO dynamic layout: compute constants w=numSignatures*4, h=numSamples*12
    'width': 2400,
    'height': 200,
    'padding': {'left': 50, 'right': 10, 'top': 10, 'bottom': 20},
    'viewport': [868, 250],

    'data': [
      {
        // this dataset "streamed" in via ngVega from heatmapData
        'name': 'activity',
        'transform': [
          // we want to show "activity level" so ignore sign on values
          {'type': 'formula', 'field': 'normval', 'expr': 'abs(datum.value)'}
        ]
      }, {
        // these datasets "streamed" in via ngVega from heatmapData
        'name': 'samples'
      }, {
        'name': 'signatureOrder'
      }, {
        'name': 'sample_objects'
      }, {
        // compute minimum normalized value for each signature (across samples)
        'name': 'signature_summary',
        'source': 'activity',
        'transform': [
          {
            'type': 'aggregate',
            'groupby': ['node'],
            'summarize': [{'field': 'normval', 'ops': ['min']}]
          }
        ]
      }, {
        // now subtract the minimum sample value from each signature and
        // lookup the order for drawing samples and signatures
        'name': 'activity_normalized',
        'source': 'activity',
        'transform': [
          {
            'type': 'lookup',
            'on': 'signature_summary',
            'onKey': 'node',
            'keys': ['node'],
            'as': ['signature_summary']
          }, {
            'type': 'formula',
            'field': 'normval',
            'expr': 'datum.normval - datum.signature_summary.min_normval'
          }, {
            'type': 'lookup',
            'on': 'samples',
            'onKey': 'data',
            'keys': ['sample'],
            'as': ['sample_order']
          }, {
            'type': 'lookup',
            'on': 'signatureOrder',
            'onKey': 'data',
            'keys': ['node'],
            'as': ['signature_order']
          }
        ]
      }
    ],

    'scales': [
      {
        'name': 'signatures',
        'type': 'ordinal',
        'domain': {
          'data': 'activity_normalized',
          'field': 'signature_order._id',
          'sort': true
        },
        'range': 'width'
      }, {
        'name': 'samples',
        'type': 'ordinal',
        'domain': {
          'data': 'activity_normalized',
          'field': 'sample_order._id',
          'sort': true
        },
        'range': 'height'
      }, {
        'name': 'minvals',
        'type': 'linear',
        'domain': {'data': 'signature_summary', 'field': 'min_normval'},
        'range': 'height'
      }, {
        'name': 's',
        'type': 'linear',
        'domain': {'data': 'activity_normalized', 'field': 'normval'},
        'range': ['#081d58', '#ffffd9']
        // FIXME looking for a way to restore this better color map
        // "domain": [0.0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1.0],
        // "range": ["#081d58", "#253494", "#225ea8", "#1d91c0", "#41b6c4",
        //   "#7fcdbb", "#c7e9b4", "#edf8b1", "#ffffd9"],
        // color scale generated thanks to ColorBrewer
        // http://colorbrewer2.org/?type=sequential&scheme=YlGnBu&n=9
        // This JavaScript code rewrites the spec, but that's cheating:
        // var range = $scope.heatmapSpec.scales[2].range;
        // var dd = dset.max / (range.length - 1);
        // $scope.heatmapSpec.scales[2].domain = range.map(function(val, ind) {
        //   return (0.0 + ind * dd); });
        // $log.info("min: " + dset.min + " max: " + dset.max);
        // $log.info("minElem: " + JSON.stringify(dset.minElem) +
        //   " maxElem: " + JSON.stringify(dset.maxElem));
      }
    ],

    // These default axes are not helpful, so we make our own in marks below.
    // x-axis: there are so many signatures, the labels overlap each other
    // y-axis: can only seem to label using data from the 'samples' scale,
    //         which now uses internal _id -- not useful information for users
    // 'axes': [
    //   {"type": "x", "scale": "signatures", "title": "Signature ID"},
    //   {'type': 'y', 'scale': 'samples', 'title': 'sample'}
    // ],

    // FIXME the legend is broken due to malformed SVG output
    // "legends": [{"fill": "s", "values": [0.0, 0.5, 1.0]}],

    'marks': [
      {
        'type': 'text',
        'properties': {
          'enter': {
            // TODO dynamic layout: compute these constants also (see above)
            'text': {'value': 'node'},
            'x': {'value': 1200},
            'y': {'value': 220},
            'fontWeight': {'value': 'bold'},
            'fill': {'value': 'black'}
          }
        }
      }, {
        'type': 'rect',
        'from': {'data': 'activity_normalized'},
        'properties': {
          'enter': {
            'x': {'scale': 'signatures', 'field': 'signature_order._id'},
            'width': {'scale': 'signatures', 'band': true},
            'y': {'scale': 'samples', 'field': 'sample_order._id'},
            'height': {'scale': 'samples', 'band': true},
            'fill': {'scale': 's', 'field': 'normval'}
          }
        }
      }, {
        'type': 'text',
        'from': {'data': 'samples'},
        // TODO dynamic layout: adjust these "magic numbers" automatically
        'properties': {
          'update': {
            'text': {'field': 'data'},
            'x': {'value': -5},
            'y': {
              'scale': 'samples',
              'field': '_id',
              'offset': 18
            },
            'align': {'value': 'right'},
            'fontWeight': {'value': 'bold'},
            'fill': {'value': 'black'}
          }
        }
      }
    ]
  };

  // populate sample details
  // FIXME implement this loop as a method on SampleBin? (prob. with caching)
  $scope.analysis.status = 'Retrieving sample details';
  var pArrSamples = [];
  for (var i = 0; i < SampleBin.heatmapData.samples.length; i++) {
    pArrSamples.push(
      SampleBin.getSampleDetails(SampleBin.heatmapData.samples[i])
    );
  }
  $q.all(pArrSamples).then(function() {
    $scope.analysis.status = '';
  }).catch(function(errObject) {
    $log.error('Sample detail retrieval errored with: ' + errObject);
  });

  SampleBin.getActivityForSampleList();
}])

;
