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
  'adage.formatMissing.filter',
  'adage.analyze.sampleBin',
  'adage.mlmodel.components',
  'adage.heatmap.service',
  'adage.heatmap-vgspec'
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
  'SampleBin', 'Heatmap', 'HeatmapSpec',
function AnalysisCtrl(
    $scope, $log, $q, $state, $stateParams, SampleBin, Heatmap, HeatmapSpec) {
  $scope.isValidModel = false;
  // Do nothing if mlmodel in URL is falsey. The error will be taken
  // care of by "<ml-model-validator>" component.
  if (!$stateParams.mlmodel) {
    return;
  }

  $scope.modelInUrl = $stateParams.mlmodel;
  // TODO #278 move to Heatmap service
  Heatmap.getActivityForSampleList(
    $scope.modelInUrl, SampleBin.heatmapData.samples
  );
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

  // TODO #280 separate to new heatmap view
  // give our template a way to access the Heatmap service (during refactor)
  $scope.heatmap = Heatmap;

  // TODO #280 separate to new heatmap view
  // wrap some SampleBin features to implement status updates
  $scope.clusterSignatures = function() {
    $scope.analysis.status = 'clustering signatures (this will take a minute)';
    // TODO #278 move to Heatmap service
    SampleBin.clusterSignatures().then(function() {
      $scope.analysis.status = '';
    });
  };

  // TODO #280 separate to new heatmap view
  $scope.showVolcanoPlot = function() {
    $state.go('volcano', {'mlmodel': $scope.modelInUrl});
  };

  // these options are important for making ngSortable work with tables
  $scope.sortableOptions = {
    containerPositioning: 'relative',
    placeholder: '<tr style="display: table-row;"></tr>'
  };

  // TODO #280 separate to new heatmap view
  // Vega objects
  $scope.heatmapSpec = HeatmapSpec;

  // populate sample details
  $scope.analysis.status = 'Retrieving sample details';
  // TODO #278 implement this loop as a method in Sample
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
}])

;
