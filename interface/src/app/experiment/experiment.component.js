angular.module('adage.experiment', [
  'adage.experiment.service',
  'adage.analyze.sample',   // TODO fix after Sample is also refactored
  'statusBar'
])

.component('experimentDetail', {
  templateUrl: 'experiment/experiment.component.tpl.html',
  bindings: {
    id: '<'
  },
  controller: [
    'Experiment', 'Sample', '$log',
    function(Experiment, Sample, $log) {
      var ctrl = this;

      ctrl.$onChanges = function(changesObj) {
        ctrl.show(changesObj.id.currentValue);
      };
      ctrl.makeHref = Experiment.makeHref;
      ctrl.experiment = {
        status: '',
        relatedSamples: []
      };

      var queryError = function(responseObject, responseHeaders) {
        $log.warn('Query errored with: ' + responseObject);
        ctrl.experiment.status = 'Query failed.';
      };

      ctrl.show = function(id) {
        if (!id) {
          $log.warn('experiment.show called with id', id);
          return;
        }
        ctrl.experiment = {
          status: 'retrieving...',
          relatedSamples: []
        };
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
          function(responseObject, responseHeaders) {
            if (responseObject) {
              ctrl.experiment.results = responseObject;
              ctrl.experiment.status = 'Retrieving sample details...';
              for (var i = 0; i < responseObject.sample_set.length; i++) {
                getSampleDetails(responseObject.sample_set[i]);
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