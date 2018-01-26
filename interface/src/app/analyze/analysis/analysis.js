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
  'adage.sample.service',
  'adage.heatmap.component',
  'adage.heatmap.service'
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
  'SampleBin', 'Sample', 'Heatmap',
function AnalysisCtrl($scope, $log, $q, $state, $stateParams,
  SampleBin, Sample, Heatmap) {
  $scope.isValidModel = false;
  // Do nothing if mlmodel in URL is falsey. The error will be taken
  // care of by "<ml-model-validator>" component.
  if (!$stateParams.mlmodel) {
    return;
  }

  $scope.modelInUrl = $stateParams.mlmodel;
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
    ],
    sampleDetails: {}
  };

  // give our templates a way to access the SampleBin service
  $scope.sb = SampleBin;

  $scope.showVolcanoPlot = function() {
    $state.go('volcano', {'mlmodel': $scope.modelInUrl});
  };

  // these options are important for making ngSortable work with tables
  $scope.sortableOptions = {
    containerPositioning: 'relative',
    placeholder: '<tr style="display: table-row;"></tr>'
  };

  // populate sample details
  $scope.analysis.status = 'Retrieving sample details';
  // TODO #278 implement this loop as a method in Sample -- hmm, maybe can't?
  var pArrSamples = [];
  Heatmap.vegaData.samples.forEach(function(sampleID) {
    var pSample = Sample
      .getSampleDetails(sampleID)
      .then(function() {
        // pull data from Sample's cache to display on the page
        $scope.analysis.sampleDetails[sampleID] = Sample.getCached(sampleID);
      });
    pArrSamples.push(pSample);
  });
  $q.all(pArrSamples).then(function() {
    $scope.analysis.status = '';
  }).catch(function(errObject) {
    $log.error('Sample detail retrieval errored with: ' + errObject);
  });
}])

;
