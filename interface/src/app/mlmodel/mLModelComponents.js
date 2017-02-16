angular.module('adage.mlmodel.components', [
  'adage.mlmodel.resource'
])

.component('mLModelSelector', {
  templateUrl: 'mlmodel/selector.tpl.html',
  bindings: {
    selectedMLModel: '='
  },
  controller: ['MLModel', '$log', function(MLModel, $log) {
    var self = this;

    // apiReturnLimit is what the 'limit' parameter will be set to in the
    // MLModel resource's GET request. By setting it to 0, we are actually
    // telling the Tastypie API that we want it to return ALL objects from
    // this endpoint (i.e. that we do not want a maximum limit to how many
    // objects it returns).
    var apiReturnLimit = 0;

    MLModel.get({limit: apiReturnLimit},
      function success(response) {
        self.availableMLModels = response.objects;
      },
      function error(err) {
        $log.error('Failed to get MLModels from REST API: ' + err.statusText);
        self.errorMessage = 'Failed to get Machine Learning Models from server';
      }
    );
  }]
})

;
