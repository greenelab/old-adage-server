angular.module('adage.sampleDetail.component', [
  'adage.sample.service',
  'adage.experiment.service',
  'statusBar'
])

.component('sampleDetail', {
  templateUrl: 'sample/sampleDetail.component.tpl.html',
  bindings: {
    id: '<',
    onLoad: '&'
  },
  controller: [
    'Sample', 'Experiment', '$log',
    function(Sample, Experiment, $log) {
      var ctrl = this;
      ctrl.makeHref = Experiment.makeHref;

      ctrl.$onInit = function() {
        ctrl.sample = {
          status: '',
          results: {},
          relatedExperiments: []
        };
      };
      ctrl.$onChanges = function(changesObj) {
        ctrl.show(changesObj.id.currentValue);
      };

      var queryError = function(responseObject) {
        $log.warn(
          'adage.sampleDetail.component: query errored with:',
          responseObject
        );
        ctrl.sample.status = 'Query failed.';
      };

      ctrl.show = function(id) {
        if (!id) {
          $log.warn('adage.sampleDetail.component: show() called with id', id);
          return;
        }
        ctrl.$onInit();   // re-initialize properties
        ctrl.sample.status = 'retrieving...';
        Sample.get({id: id},
          function(responseObject) {
            if (responseObject) {
              ctrl.sample.status = '';
              ctrl.sample.results = responseObject;
            }
          },
          queryError
        );
        Sample.getExperiments({id: id},
          function(responseObject) {
            if (responseObject) {
              ctrl.sample.status = '';
              ctrl.sample.relatedExperiments = responseObject;
            }
            if (ctrl.onLoad !== undefined) {
              ctrl.onLoad({sample: responseObject});
            }
          },
          queryError
        );
      };
    }
  ]
})

;
