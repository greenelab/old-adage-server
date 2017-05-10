/**
 * "adage.signature_search" module.
 */

angular.module('adage.signatureSearch', [
  'ui.router',
  'ui.bootstrap',
  'adage.signature.resources',
  'adage.mlmodel.components'
])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('signature_search', {
    url: '/signature/search',
    views: {
      main: {
        templateUrl: 'signature/signature_search.tpl.html',
        controller: 'SignatureSearchCtrl'
        // See comments below on why "controllerAs" is not used.
      }
    },
    data: {pageTitle: 'Signature Search'}
  });
}])

// "controllerAs" syntax is not used here because we are using "$scope" to
// watch the mlModel selected by user, and a combination of both seems weird.
.controller('SignatureSearchCtrl', ['$scope', 'Signature', '$log', 'errGen',
  function SignatureController($scope, Signature, $log, errGen) {
    $scope.statusMessage = 'Machine learning model not selected yet.';
    $scope.mlModel = null;
    $scope.nameFilter = '';

    $scope.$watch('mlModel', function() {
      if ($scope.mlModel === null) { // Skip the initialization watch
        return;
      }
      $scope.statusMessage = 'Connecting to the server ...';
      var modelID = $scope.mlModel.id;
      Signature.get(
        {mlmodel: modelID, limit: 0},
        function success(response) {
          $scope.signatures = response.objects;
          $scope.signatures.sort(function(n1, n2) { // Sort signatures by name
            if (n1.name < n2.name) {
              return -1;
            } else if (n1.name === n2.name) {
              return 0;
            }
            return 1;
          });
          $scope.statusMessage = '';
        },
        function error(err) {
          var message = errGen('Failed to get signatures: ', err);
          $log.error(message);
          $scope.statusMessage = message + '. Please try again later.';
        }
      );
    });
  }
]);
