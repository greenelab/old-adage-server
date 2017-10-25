/*
 * Simple view embedding an experiment-detail.
 */
angular.module('adage.experimentDetail.view', [
  'ui.router',
  'adage.experimentDetail.component',
  'adage.sampleBin.addItem',
  'adage.sampleBin.addItemAnalyze',
  'adage.utils'
])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('experiment', {
    url: '/experiment?id',
    views: {
      main: {
        templateUrl: 'experiment/experimentDetail.view.tpl.html',
        controller: 'ExperimentDetailViewCtrl as ctrl'
      }
    },
    data: {pageTitle: 'Experiment Detail'}
  });
}])

.controller('ExperimentDetailViewCtrl', ['$stateParams', 'ApiBasePath',
  function ExperimentDetailViewCtrl($stateParams, ApiBasePath) {
    var ctrl = this;
    ctrl.id = $stateParams.id;
    ctrl.experimentItem = {
      pk: ctrl.id,
      itemType: 'experiment',
      description: '',
      relatedItems: []
    };
    ctrl.loaded = function(experiment) {
      ctrl.experimentItem.description = experiment.description;

      // we want an array of sample ids for relatedItems, but the sample_set
      // property we get from experiment has URIs, so we need to convert them
      var rxSampleUri = new RegExp(ApiBasePath + 'sample/(\\d+)/');
      ctrl.experimentItem.relatedItems = experiment.sample_set.map(
        function(val) {
          return val.match(rxSampleUri)[1]; // want first match in rxSampleUri
        }
      );
    };
  }
])
;
