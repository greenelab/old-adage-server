angular.module( 'adage.analyze.analysis', [
  'adage.analyze.sample',
  'ngVega',
  'ngResource'
])

.config(['$resourceProvider', function($resourceProvider) {
  // Don't strip trailing slashes from calculated URLs
  $resourceProvider.defaults.stripTrailingSlashes = false;
}])

.factory( 'Activity', ['$resource', function($resource) {
  var Activity = $resource(
    '/api/v0/activity/',
    { sample: '@sample' }
    // { 'get': { method: 'GET', isArray: false } }
  );
  return Activity;
}])

.factory( 'AnnotationType', ['$resource', function($resource) {
  var AnnotationType = $resource(
    '/api/v0/annotationtype/',
    { sample: '@sample' }
    // { 'get': { method: 'GET', isArray: false } }
  );
  return AnnotationType;
}])

.controller( 'AnalysisCtrl', ['$scope', '$log', '$location', 'Sample',
'Activity', 'AnnotationType',
function AnalysisCtrl($scope, $log, $location, Sample, Activity,
  AnnotationType) {
  var queryError = function(responseObject, responseHeaders) {
    $log.warn('Query errored with: ' + responseObject);
    // $scope.sample.status = "Query failed.";
  };

  $scope.sortableOptions = {
    containerPositioning: 'relative',
    placeholder: '<tr style="display: table-row;"></tr>'
  };
  
  // Vega objects
  $scope.heatmapSpec = {
    "width": 1200,
    "height": 200,

    "data": [
      { // data are loaded dynamically by ng-vega, but this declares a name
        "name": "sample_node_value"
      }
    ],

    "scales": [
      {
        "name": "nodes",
        "type": "ordinal",
        "domain": {"data": "sample_node_value", "field": "node"},
        "range": "width"
      }, {
        "name": "samples",
        "type": "ordinal",
        "domain": {"data": "sample_node_value", "field": "sample"},
        "range": "height"
      }, {
        "name": "s",
        "type": "linear",
        "domain": [0.0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1.0],
        "range": ["#081d58", "#253494", "#225ea8", "#1d91c0", "#41b6c4", "#7fcdbb", "#c7e9b4", "#edf8b1", "#ffffd9"],
        "comment": "color scale generated thanks to http://colorbrewer2.org/?type=sequential&scheme=YlGnBu&n=9"
      }
    ],

    "axes": [
      {"type": "x", "scale": "nodes"},
      {"type": "y", "scale": "samples"}
    ],

    "legends": [{"fill": "s", "values": [0.0, 0.5, 1.0]}],
  
    "marks": [
      {
        "type": "rect",
        "from": {"data": "sample_node_value"},
        "properties": {
          "enter": {
            "x": {"scale": "nodes", "field": "node"},
            "width": {"scale": "nodes", "band": true},
            "y": {"scale": "samples", "field": "sample"},
            "height": {"scale": "samples", "band": true},
            "fill": {"scale": "s", "field": "value"}
          }
        }
      }
    ]
  };

  $scope.testData = {
    sample_node_value: [
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V1', "value": 0.99999997},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V2', "value": 0.18073634},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V3', "value": 0.00000522},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V4', "value": 0.99998465},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V5', "value": 1.00000000},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V6', "value": 0.00000001},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V7', "value": 1.00000000},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V8', "value": 0.45692275},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V9', "value": 0.00000000},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V10', "value": 0.70264003},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V11', "value": 1.00000000},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V12', "value": 0.99996479},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V13', "value": 0.99999993},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V14', "value": 1.00000000},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V15', "value": 0.99873826},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V16', "value": 1.00000000},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V17', "value": 0.89054649},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V18', "value": 0.06927487},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V19', "value": 0.00002070},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V20', "value": 0.99998804},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V21', "value": 0.00000011},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V22', "value": 1.00000000},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V23', "value": 0.00000000},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V24', "value": 1.00000000},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V25', "value": 1.00000000},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V26', "value": 0.00000000},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V27', "value": 1.00000000},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V28', "value": 0.00000000},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V29', "value": 1.00000000},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V30', "value": 0.99998295},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V31', "value": 1.00000000},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V32', "value": 1.00000000},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V33', "value": 0.07029270},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V34', "value": 0.87795445},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V35', "value": 0.00088865},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V36', "value": 1.00000000},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V37', "value": 0.00000002},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V38', "value": 0.00000095},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V39', "value": 0.00000005},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V40', "value": 0.99999884},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V41', "value": 1.00000000},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V42', "value": 0.99873397},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V43', "value": 0.99999999},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V44', "value": 0.00000000},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V45', "value": 0.99981575},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V46', "value": 0.01467540},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V47', "value": 0.99999121},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V48', "value": 0.00000000},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V49', "value": 1.00000000},
      {"sample": 'anr1_Pae_G1a_2.CEL', "node": 'V50', "value": 1.00000000},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V1', "value": 0.99999996},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V2', "value": 0.07362962},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V3', "value": 0.00037521},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V4', "value": 0.99998425},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V5', "value": 1.00000000},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V6', "value": 0.00000001},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V7', "value": 1.00000000},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V8', "value": 0.15953241},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V9', "value": 0.00000000},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V10', "value": 0.20671598},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V11', "value": 1.00000000},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V12', "value": 0.99997335},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V13', "value": 0.99999953},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V14', "value": 1.00000000},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V15', "value": 0.96025801},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V16', "value": 1.00000000},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V17', "value": 0.21856601},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V18', "value": 0.00327075},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V19', "value": 0.00000042},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V20', "value": 0.99987496},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V21', "value": 0.00000329},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V22', "value": 1.00000000},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V23', "value": 0.00000000},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V24', "value": 1.00000000},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V25', "value": 1.00000000},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V26', "value": 0.00000000},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V27', "value": 1.00000000},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V28', "value": 0.00000000},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V29', "value": 1.00000000},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V30', "value": 0.99999779},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V31', "value": 1.00000000},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V32', "value": 1.00000000},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V33', "value": 0.00591595},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V34', "value": 0.86255912},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V35', "value": 0.00001110},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V36', "value": 1.00000000},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V37', "value": 0.00000001},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V38', "value": 0.00003924},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V39', "value": 0.00000000},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V40', "value": 0.99999776},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V41', "value": 1.00000000},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V42', "value": 0.87181235},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V43', "value": 0.99999996},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V44', "value": 0.00000000},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V45', "value": 0.99879492},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V46', "value": 0.00089310},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V47', "value": 0.99999578},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V48', "value": 0.00000000},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V49', "value": 1.00000000},
      {"sample": 'anr2_Pae_G1a.CEL', "node": 'V50', "value": 1.00000000},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V1', "value": 0.99999964},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V2', "value": 0.13845169},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V3', "value": 0.00000078},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V4', "value": 0.99995265},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V5', "value": 1.00000000},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V6', "value": 0.00000000},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V7', "value": 1.00000000},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V8', "value": 0.03556798},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V9', "value": 0.00000000},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V10', "value": 0.92335147},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V11', "value": 1.00000000},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V12', "value": 0.99996413},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V13', "value": 0.99999969},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V14', "value": 1.00000000},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V15', "value": 0.99769514},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V16', "value": 1.00000000},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V17', "value": 0.92319280},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V18', "value": 0.00835320},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V19', "value": 0.00002367},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V20', "value": 0.99996873},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V21', "value": 0.00000019},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V22', "value": 1.00000000},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V23', "value": 0.00000000},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V24', "value": 1.00000000},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V25', "value": 1.00000000},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V26', "value": 0.00000000},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V27', "value": 1.00000000},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V28', "value": 0.00000000},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V29', "value": 1.00000000},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V30', "value": 0.99992666},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V31', "value": 1.00000000},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V32', "value": 1.00000000},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V33', "value": 0.16523662},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V34', "value": 0.97637632},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V35', "value": 0.00011115},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V36', "value": 1.00000000},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V37', "value": 0.00000003},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V38', "value": 0.00000516},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V39', "value": 0.00000013},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V40', "value": 0.99999966},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V41', "value": 1.00000000},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V42', "value": 0.99248412},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V43', "value": 0.99999998},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V44', "value": 0.00000000},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V45', "value": 0.99996279},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V46', "value": 0.00816906},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V47', "value": 0.99998898},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V48', "value": 0.00000000},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V49', "value": 1.00000000},
      {"sample": 'anr3_Pae_G1a.CEL', "node": 'V50', "value": 1.00000000},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V1', "value": 0.99997708},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V2', "value": 0.30352881},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V3', "value": 0.00003884},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V4', "value": 0.84248308},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V5', "value": 1.00000000},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V6', "value": 0.00000006},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V7', "value": 0.74887876},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V8', "value": 0.99999854},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V9', "value": 0.00000000},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V10', "value": 0.00268044},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V11', "value": 1.00000000},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V12', "value": 0.00000003},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V13', "value": 0.99960092},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V14', "value": 1.00000000},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V15', "value": 0.55228166},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V16', "value": 1.00000000},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V17', "value": 0.04573449},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V18', "value": 0.00003059},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V19', "value": 0.00000004},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V20', "value": 0.00000005},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V21', "value": 0.00000000},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V22', "value": 1.00000000},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V23', "value": 0.00000000},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V24', "value": 0.99689299},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V25', "value": 1.00000000},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V26', "value": 0.00000000},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V27', "value": 1.00000000},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V28', "value": 0.00000000},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V29', "value": 0.99999973},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V30', "value": 0.93788959},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V31', "value": 1.00000000},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V32', "value": 0.99999995},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V33', "value": 0.99923867},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V34', "value": 0.07101708},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V35', "value": 0.00000008},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V36', "value": 0.99989023},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V37', "value": 0.27380609},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V38', "value": 0.00003510},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V39', "value": 0.00000000},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V40', "value": 1.00000000},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V41', "value": 1.00000000},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V42', "value": 0.99999562},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V43', "value": 0.99999772},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V44', "value": 0.00000000},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V45', "value": 0.00000011},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V46', "value": 0.00001254},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V47', "value": 0.00000507},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V48', "value": 0.00040409},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V49', "value": 1.00000000},
      {"sample": 'WT1_Pae_G1a.CEL', "node": 'V50', "value": 1.00000000},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V1', "value": 0.99995535},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V2', "value": 0.09433703},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V3', "value": 0.00045716},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V4', "value": 0.24425521},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V5', "value": 1.00000000},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V6', "value": 0.00000005},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V7', "value": 0.99832933},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V8', "value": 0.99997242},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V9', "value": 0.00000000},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V10', "value": 0.00716501},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V11', "value": 1.00000000},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V12', "value": 0.00000074},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V13', "value": 0.99997546},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V14', "value": 1.00000000},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V15', "value": 0.99569695},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V16', "value": 1.00000000},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V17', "value": 0.13455204},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V18', "value": 0.00000155},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V19', "value": 0.00000001},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V20', "value": 0.00008103},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V21', "value": 0.00000001},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V22', "value": 1.00000000},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V23', "value": 0.00000000},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V24', "value": 0.99822050},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V25', "value": 1.00000000},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V26', "value": 0.00000000},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V27', "value": 1.00000000},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V28', "value": 0.00000000},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V29', "value": 1.00000000},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V30', "value": 0.99588864},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V31', "value": 1.00000000},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V32', "value": 1.00000000},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V33', "value": 0.97869784},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V34', "value": 0.01534617},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V35', "value": 0.00001737},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V36', "value": 0.99999956},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V37', "value": 0.05979154},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V38', "value": 0.00000833},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V39', "value": 0.00000000},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V40', "value": 1.00000000},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V41', "value": 1.00000000},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V42', "value": 0.99999535},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V43', "value": 0.99992766},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V44', "value": 0.00000000},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V45', "value": 0.00035831},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V46', "value": 0.00002172},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V47', "value": 0.08239051},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V48', "value": 0.00000272},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V49', "value": 1.00000000},
      {"sample": 'WT2_Pae_G1a.CEL', "node": 'V50', "value": 1.00000000},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V1', "value": 0.99999948},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V2', "value": 0.05234184},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V3', "value": 0.00000021},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V4', "value": 0.27793834},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V5', "value": 1.00000000},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V6', "value": 0.00000000},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V7', "value": 0.99909143},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V8', "value": 0.99995816},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V9', "value": 0.00000000},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V10', "value": 0.99848434},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V11', "value": 1.00000000},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V12', "value": 0.00141075},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V13', "value": 0.99898245},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V14', "value": 1.00000000},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V15', "value": 0.91187628},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V16', "value": 1.00000000},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V17', "value": 0.06379793},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V18', "value": 0.00000013},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V19', "value": 0.00000012},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V20', "value": 0.05158995},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V21', "value": 0.00000000},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V22', "value": 1.00000000},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V23', "value": 0.00000000},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V24', "value": 0.99996858},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V25', "value": 1.00000000},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V26', "value": 0.00000000},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V27', "value": 1.00000000},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V28', "value": 0.00000000},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V29', "value": 1.00000000},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V30', "value": 0.99477070},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V31', "value": 1.00000000},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V32', "value": 1.00000000},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V33', "value": 0.94997619},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V34', "value": 0.93976581},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V35', "value": 0.00000242},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V36', "value": 0.99999996},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V37', "value": 0.96318830},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V38', "value": 0.00017337},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V39', "value": 0.00000000},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V40', "value": 1.00000000},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V41', "value": 1.00000000},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V42', "value": 0.99999994},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V43', "value": 0.97693053},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V44', "value": 0.00000000},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V45', "value": 0.03413913},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V46', "value": 0.00000143},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V47', "value": 0.68815138},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V48', "value": 0.00000004},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V49', "value": 1.00000000},
      {"sample": 'WT3_Pae_G1a.CEL', "node": 'V50', "value": 1.00000000}
    ]
  };

  AnnotationType.get({},
    function(responseObject, responseHeaders) {
      if (responseObject) {
        // $scope.sample.status = "";
        $scope.annotationTypes = responseObject;
      }
    },
    queryError
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
