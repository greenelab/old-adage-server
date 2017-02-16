angular.module('adage.mlmodel.components', [
  'adage.mlmodel.resource'
])

.component('mlModelSelector', {
  templateUrl: 'mlmodel/selector.tpl.html',
  bindings: {
    selectedMlModel: '='
  },
  controller: ['MlModel', '$log', function(MlModel, $log) {
    var self = this;

    // apiReturnLimit is what the 'limit' parameter will be set to in the
    // MlModel resource's GET request. By setting it to 0, we are actually
    // telling the Tastypie API that we want it to return ALL objects from
    // this endpoint (i.e. that we do not want a maximum limit to how many
    // objects it returns).
    var apiReturnLimit = 0;

    MlModel.get({limit: apiReturnLimit},
      function success(response) {
        self.availableMlModels = response.objects;
      },
      function error(err) {
        $log.error('Failed to get MLModels from REST API: ' + err.statusText);
        self.errorMessage = 'Failed to get Machine Learning Models from server';
      }
    );
  }]
})

;
