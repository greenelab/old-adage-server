/**
 * "download" module, which will download sample annotations of given
 * annotation typenames.
 */

angular.module('adage.download', [
  'ui.router',
  'placeholders',
  'ui.bootstrap',
  'as.sortable'
])

.config(function config($stateProvider) {
  $stateProvider.state('download', {
    url: '/download',
    views: {
      "main": {
        controller: 'DownloadCtrl',
        templateUrl: 'download/download.tpl.html'
      }
    },
    data: {pageTitle: 'Download'}
  });
})

// "AnnotationTypes" is a service that retrieves a list of available
// annotation columns, from which the user can select for download.
.factory('AnnotationTypes', ['$resource', function($resource) {
  return $resource(
    '/api/v0/annotationtype/',
    { q: '', limit: 0 },
    { 'query': { method: 'GET', isArray: false } }
  );
}])

.controller('DownloadCtrl', ['$scope', '$window', 'AnnotationTypes',
  function DownloadController($scope, $window, AnnotationTypes) {
    $scope.annotations = {
      query_message: "Connecting to the server ...",
      included_types: [],
      excluded_types: []
    };

    AnnotationTypes.query(
      {q: ''},
      function(responseObject, responseHeaders) {
        for (var i = 0; i < responseObject.objects.length; ++i) {
          $scope.annotations.included_types.push(
            responseObject.objects[i].typename);
        }
        $scope.annotations.query_message = "";
      },
      function(responseObject, responseHeaders) {
        $log.error('Query errored with: ' + responseObject);
        $scope.annotations.query_message = "Connection to server failed";
      }
    );

    // Remove a type from inclusion list.
    $scope.del_type = function(index) {
      current_item = $scope.annotations.included_types[index];
      $scope.annotations.included_types.splice(index, 1);
      $scope.annotations.excluded_types.push(current_item);
    };

    // Add a type back to inclusion list.
    $scope.add_type = function(index) {
      current_item = $scope.annotations.excluded_types[index];
      $scope.annotations.excluded_types.splice(index, 1);
      $scope.annotations.included_types.push(current_item);
    };

    // Handler of "Download" button click event.
    $scope.start_download = function() {
      var uri = "/api/v0/sample/get_annotations/?annotation_types=";
      uri += $scope.annotations.included_types.join();
      $window.location.href = uri;  // Call compiled downloading API.
    };

  }
]);
