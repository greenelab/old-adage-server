/**
 * "adage.node_search" module.
 */

angular.module('adage.node_search', [
  'ui.router',
  'ui.bootstrap',
  'ngResource',
  'adage.mlmodel.components',
  'adage.utils'
])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('node_search', {
    url: '/node/search',
    views: {
      main: {
        templateUrl: 'node/node_search.tpl.html',
        controller: 'NodeSearchCtrl'
        // See comments below on why "controllerAs" is not used.
      }
    },
    data: {pageTitle: 'Node Search'}
  });
}])

.factory('Node', ['$resource', 'ApiBasePath',
  function($resource, ApiBasePath) {
    return $resource(ApiBasePath + 'node');
  }
])

// "controllerAs" syntax is not used here because we are using "$scope" to
// watch the mlModel selected by user, and a combination of both seems weird.
.controller('NodeSearchCtrl', ['$scope', 'Node', '$log', 'errGen',
  function NodeController($scope, Node, $log, errGen) {
    $scope.statusMessage = 'Machine learning model not selected yet.';
    $scope.mlModel = null;
    $scope.nameFilter = '';

    $scope.$watch('mlModel', function() {
      if ($scope.mlModel === null) { // Skip the initialization watch
        return;
      }
      $scope.statusMessage = 'Connecting to the server ...';
      var modelID = $scope.mlModel.id;
      Node.get(
        {mlmodel: modelID, limit: 0},
        function success(response) {
          $scope.nodes = response.objects;
          $scope.nodes.sort(function(n1, n2) { // Sort nodes by name
            return (n1.name < n2.name) ? -1 : (n1.name === n2.name) ? 0 : 1;
          });
          $scope.statusMessage = '';
        },
        function error(err) {
          var message = errGen('Failed to get nodes: ', err);
          $log.error(message);
          $scope.statusMessage = message + '. Please try again later.';
        }
      );
    });
  }
]);
