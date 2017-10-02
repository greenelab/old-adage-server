angular.module('adage.experimentDetail.component', [
  'adage.experiment.service',
  'adage.sample.service',
  'statusBar'
])

.component('experimentDetail', {
  templateUrl: 'experiment/experimentDetail.component.tpl.html',
  bindings: {
    id: '<',
    onLoad: '&'
  },
  controller: [
    'Experiment', 'Sample', '$log',
    function(Experiment, Sample, $log) {
      var ctrl = this;

      ctrl.$onInit = function() {
        ctrl.experiment = {
          status: '',
          relatedSamples: []
        };
      };
      ctrl.$onChanges = function(changesObj) {
        ctrl.show(changesObj.id.currentValue);
      };
      ctrl.makeHref = Experiment.makeHref;

      var queryError = function(responseObject) {
        $log.warn(
          'adage.experimentDetail.component: query errored with:',
          responseObject
        );
        ctrl.experiment.status = 'Query failed.';
      };

      ctrl.show = function(id) {
        if (!id) {
          $log.warn(
            'adage.experimentDetail.component: show() called with id',
            id
          );
          return;
        }
        ctrl.$onInit();   // re-initialize properties
        ctrl.experiment.status = 'retrieving...';
        var getSampleDetails = function(uri) {
          Sample.getUri(uri).then(
            function(responseObject) {
              if (responseObject) {
                ctrl.experiment.status = '';
                ctrl.experiment.relatedSamples.push(responseObject.data);
              }
            },
            queryError
          );
        };
        Experiment.get(
          {accession: id},
          function(responseObject) {
            if (responseObject) {
              ctrl.experiment.results = responseObject;
              ctrl.experiment.status = 'Retrieving sample details...';
              responseObject.sample_set.forEach(function(sample) {
                getSampleDetails(sample);
              });
              if (ctrl.onLoad !== undefined) {
                ctrl.onLoad({experiment: responseObject});
              }
            }
          },
          queryError
        );
      };
    }
  ]
})

;
