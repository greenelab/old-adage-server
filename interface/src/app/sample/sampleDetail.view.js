/*
 * Simple view embedding a sample-detail.
 */
angular.module('adage.sampleDetail.view', [
  'ui.router',
  'adage.sampleDetail',
  // 'adage.sampleBin.addItem',   // TODO: make these buttons work for Samples
  // 'adage.sampleBin.addItemAnalyze',
  'adage.utils'
])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('sample', {
    url: '/sample?id',
    views: {
      main: {
        templateUrl: 'sample/sampleDetail.view.tpl.html',
        controller: 'SampleDetailViewCtrl as ctrl'
      }
    },
    data: {pageTitle: 'Sample Detail'}
  });
}])

.controller('SampleDetailViewCtrl', ['$stateParams', 'ApiBasePath',
  function SampleDetailViewCtrl($stateParams, ApiBasePath) {
    var ctrl = this;
    ctrl.id = $stateParams.id;
    ctrl.sampleItem = {
      pk: ctrl.id,
      item_type: 'sample',
      description: '',
      related_items: []
    };
    ctrl.loaded = function(sample) {
      ctrl.sampleItem.description = sample.description;
    };
  }
])
;
