angular.module( 'adage.analyze.analysis', [
  'adage.analyze.sampleBin',
  'adage.analyze.sample',
  'ngVega',
  'ngResource'
])

.config(['$resourceProvider', function($resourceProvider) {
  // Don't strip trailing slashes from calculated URLs
  $resourceProvider.defaults.stripTrailingSlashes = false;
}])

.factory( 'AnnotationType', ['$resource', function($resource) {
  var AnnotationType = $resource(
    '/api/v0/annotationtype/'
  );
  return AnnotationType;
}])

.controller( 'AnalysisCtrl', ['$scope', '$log', '$location', 'Sample',
'Activity', 'AnnotationType', 'SampleBin',
function AnalysisCtrl($scope, $log, $location, Sample, Activity, AnnotationType, SampleBin) {

  // give our templates a way to access the SampleBin service
  $scope.sb = SampleBin;

  // these options are important for making ngSortable work with tables
  $scope.sortableOptions = {
    containerPositioning: 'relative',
    placeholder: '<tr style="display: table-row;"></tr>'
    // TODO: when reordering implemented in heatmap, need to trigger here
    // orderChanged: function(event) {
    // }
  };

  // Vega objects
  $scope.heatmapSpec = {
    // TODO compute these constants: w=numNodes*4, h=numSamples*12
    "width": 2400,
    "height": 200,
    "padding": {"left": 50, "right": 10, "top": 10, "bottom": 20},
    "viewport": [868, 250],

    "data": [
      {
        // this dataset "streamed" in via ngVega from heatmapData
        "name": "activity",
        "transform": [
          // we want to show "activity level" so ignore sign on values
          {"type": "formula", "field": "normval", "expr": "abs(datum.value)"}
        ]
      }, {
        // this dataset "streamed" in via ngVega from heatmapData
        "name": "sample_objects"
      }, {
        // compute minimum normalized value for each node (across samples)
        "name": "node_summary",
        "source": "activity",
        "transform": [
          {
            "type": "aggregate",
            "groupby": ["node"],
            "summarize": [{"field": "normval", "ops": ["min"]}]
          }
        ]
      }, {
        // now subtract the minimum sample value from each node
        "name": "activity_normalized",
        "source": "activity",
        "transform": [
          {
            "type": "lookup",
            "on": "node_summary",
            "onKey": "node",
            "keys": ["node"],
            "as": ["node_summary"]
          }, {
            "type": "formula",
            "field": "normval",
            "expr": "datum.normval - datum.node_summary.min_normval"
          }, {
            "type": "lookup",
            "on": "sample_objects",
            "onKey": "id",
            "keys": ["sample"],
            "as": ["sample_object"]
          }
        ]
      }
    ],

    "scales": [
      {
        "name": "nodes",
        "type": "ordinal",
        "domain": {"data": "activity_normalized", "field": "node"},
        "range": "width"
      }, {
        "name": "samples",
        "type": "ordinal",
        "domain": {"data": "activity_normalized", "field": "sample"},
        "range": "height"
      }, {
        "name": "minvals",
        "type": "linear",
        "domain": {"data": "node_summary", "field": "min_normval"},
        "range": "height"
      }, {
        "name": "s",
        "type": "linear",
        "domain": {"data": "activity_normalized", "field": "normval"},
        "range": ["#081d58", "#ffffd9"]
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

    "axes": [
      // this generated x-axis is useless, so we make one in marks below
      // {"type": "x", "scale": "nodes", "title": "Node ID"},
      {
        "type": "y", "scale": "samples", "title": "sample"
        // FIXME vega doesn't like either of these attempts at labels
        // "properties": {
        //   "labels": {
        //     // "text": {"field": "sample_object.ml_data_source"}
        //     "text": {"template": "test {{datum.data.sample_object.ml_data_source}}"}
        //   }
        // }
      }
    ],

    // FIXME the legend is broken due to malformed SVG output
    // "legends": [{"fill": "s", "values": [0.0, 0.5, 1.0]}],

    "marks": [
      {
        "type": "text",
        "properties": {
          "enter": {
            // TODO compute these constants also (see above)
            "x": {"value": 1200},
            "y": {"value": 220},
            "fontWeight": {"value": "bold"},
            "fill": {"value": "black"},
            "text": {"value": "node"}
          }
        }
      }, {
        "type": "rect",
        "from": {"data": "activity_normalized"},
        "properties": {
          "enter": {
            "x": {"scale": "nodes", "field": "node"},
            "width": {"scale": "nodes", "band": true},
            "y": {"scale": "samples", "field": "sample"},
            "height": {"scale": "samples", "band": true},
            "fill": {"scale": "s", "field": "normval"}
          }
        }
      }
    ]
  };

  // TODO these exampleCols are temporarily hard-coded until a column chooser
  // feature can be added
  $scope.analysis = {
    exampleCols: [
      {'typename': 'genotype'},
      {'typename': 'medium'},
      {'typename': 'strain'}
    ]
  };

  // populate sample details
  for (var i=0; i < SampleBin.samples.length; i++) {
    SampleBin.getSampleDetails(SampleBin.samples[i]);
  }

  SampleBin.getActivityForSampleList($scope.analysis,
    // success callback
    function(responseObject, responseHeaders) {
      if (responseObject) {
        $scope.analysis.queryStatus = "";
        // FIXME retrieved data belong in a cache inside sampleBin service
        SampleBin.heatmapData.activity = responseObject.objects;
        // TODO need to find & report (list) samples that return no results
      }
    },
    // failure callback
    function(responseObject, responseHeaders) {
      $log.error('Query errored with: ' + responseObject);
      // TODO need a unit test to prove this works
      $scope.analysis.queryStatus = "Query for activity failed.";
    }
  );
}])

.directive('analysisDetail', function() {
  return {
    restrict: 'E',
    // scope: {},
    templateUrl: 'analyze/analysis/analysisDetail.tpl.html',
    controller: 'AnalysisCtrl'
  };
})
;
