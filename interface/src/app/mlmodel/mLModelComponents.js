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

    MLModel.get(
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
