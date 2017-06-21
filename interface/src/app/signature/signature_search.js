/**
 * "adage.signature_search" module.
 */

angular.module('adage.signatureSearch', [
  'ui.router',
  'ui.bootstrap',
  'adage.mlmodel.components',
  'adage.signature.resources',
  'adage.utils'
])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('signature_search', {
    url: '/signature/search?mlmodel',
    views: {
      main: {
        templateUrl: 'signature/signature_search.tpl.html',
        controller: 'SignatureSearchCtrl as ctrl'
      }
    },
    data: {pageTitle: 'Signature Search'}
  });
}])

.controller('SignatureSearchCtrl', ['$stateParams', 'Signature', '$log',
  'errGen',
  function SignatureController($stateParams, Signature, $log, errGen) {
    var self = this;
    self.isValidModel = false;
    // Do nothing if the model ID in URL is falsey. The error will be taken
    // care of by "<ml-model-validator>" component.
    if (!$stateParams.mlmodel) {
      return;
    }

    self.modelInUrl = $stateParams.mlmodel;
    self.statusMessage = 'Connecting to the server ...';
    self.nameFilter = '';

    Signature.get(
      {mlmodel: self.modelInUrl, limit: 0},
      function success(response) {
        self.signatures = response.objects;
        self.signatures.sort(function(n1, n2) { // Sort signatures by name
          if (n1.name < n2.name) {
            return -1;
          } else if (n1.name === n2.name) {
            return 0;
          }
          return 1;
        });
        self.statusMessage = '';
      },
      function error(err) {
        var message = errGen('Failed to get signatures: ', err);
        $log.error(message);
        self.statusMessage = message + '. Please try again later.';
      }
    );
  }
]);
