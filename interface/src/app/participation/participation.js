angular.module('adage.participation', [
  'adage.participation.resources',
  'adage.utils'
])

.component('participationTypeSelector', {
  templateUrl: 'participation/participation-type-selector.tpl.html',
  bindings: {
    selectedParticipationType: '='
  },
  controller: ['ParticipationType', 'errGen', '$log',
    function(ParticipationType, errGen, $log) {
      var self = this;

      // apiReturnLimit is what the 'limit' parameter will be set to in the
      // ParticipationType resource's GET request. By setting it to 0, we
      // are actually telling the Tastypie API that we want it to return ALL
      // objects from this endpoint (i.e. that we do not want a maximum
      // limit to how many objects it returns).
      var apiReturnLimit = 0;

      ParticipationType.get({limit: apiReturnLimit},
        function success(response) {
          self.availableParticipationTypes = response.objects;
          self.selectedParticipationType = response.objects[0];
        },
        function error(response) {
          var errMessage = errGen('Failed to get ParticipationTypes',
                                  response);
          $log.error(errMessage);
          self.errorMessage = errMessage + '. Please try again later.';
        }
      );
    }
  ]
})

;
