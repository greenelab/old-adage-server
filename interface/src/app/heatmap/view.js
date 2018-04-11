/*
 * Simple view embedding a heatmap. Accepts mlmodel and samplelist parameters
 * in the url via the ui.router $stateProvider api
 */
angular.module('adage.heatmap.view', [
  'ui.router',
  'statusBar'
])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('heatmap', {
    url: '/heatmap?mlmodel&samplelist',
    views: {
      main: {
        templateUrl: 'heatmap/view.tpl.html',
        controller: 'HeatmapViewCtrl as ctrl'
      }
    },
    data: {pageTitle: 'Heatmap'}
  });
}])

.controller('HeatmapViewCtrl', ['$stateParams',
  function HeatmapViewCtrl($stateParams) {
    var ctrl = this;
    ctrl.isValidModel = false;
    // Do nothing if mlmodel in URL is falsey. The error will be taken
    // care of by "<ml-model-validator>" component.
    if (!$stateParams.mlmodel) {
      return;
    }

    this.mlModel = $stateParams.mlmodel;
    this.sampleList = $stateParams.samplelist.split(',');
  }
])
;
