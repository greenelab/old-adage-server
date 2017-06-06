angular.module('adage.mlmodel.components', [
  'adage.utils',
  'adage.mlmodel.resource'
])

.component('mlModelSelector', {
  templateUrl: 'mlmodel/selector.tpl.html',
  bindings: {
    selectedMlModel: '=',
    onChange: '&'
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

.component('mlModelView', {
  templateUrl: 'mlmodel/view.tpl.html',
  controller: ['GlobalModelInfo', function(GlobalModelInfo) {
    this.modelInfo = GlobalModelInfo;
  }]
})

.component('mlModelValidator', {
  templateUrl: 'mlmodel/validator.tpl.html',
  bindings: {
    modelId: '=',
    isValidModel: '='
  },
  controller: ['MlModel', 'GlobalModelInfo', '$log', 'errGen',
    function(MlModel, GlobalModelInfo, $log, errGen) {
      var self = this;
      // Ensure that input modelId is truthy.
      if (!self.modelId) {
        self.errMessage = 'Machine learning model not set yet.';
        return;
      }
      // Do nothing if GlobalModelInfo has same ID as the input model ID.
      if (self.modelId === GlobalModelInfo.id) {
        self.isValidModel = true;
        return;
      }

      MlModel.get(
        {id: self.modelId},
        function success(response) {
          GlobalModelInfo.set(response);
          self.isValidModel = true;
        },
        function error(err) {
          GlobalModelInfo.reset();
          self.errMessage = errGen('Failed to get machine learning model', err);
          $log.error(self.errorMessage);
        }
      );
    }]
})
;
