angular.module('adage.sampleDetail', [
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

      ctrl.$onChanges = function(changesObj) {
        ctrl.show(changesObj.id.currentValue);
      };
      ctrl.sample = {
        status: '',
        results: {},
        relatedExperiments: []
      };

      var queryError = function(responseObject) {
        $log.warn(
          'adage.sampleDetail: query errored with: ' + responseObject
        );
        ctrl.sample.status = 'Query failed.';
      };

      ctrl.show = function(id) {
        if (!id) {
          $log.warn('adage.sampleDetail: show() called with id', id);
          return;
        }
        ctrl.sample = {
          status: 'retrieving...',
          results: {},
          relatedExperiments: []
        };
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
