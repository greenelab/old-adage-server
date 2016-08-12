/**
 * "download" module, which will download sample annotations of given annotation
 * typenames.
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
    data: { pageTitle: 'Download' }
  });
})

// New service: "AnnotationTypes"
.factory('AnnotationTypes', ['$resource', function($resource) {
  return $resource(
    '/api/v0/annotationtype/',
    { q: '', limit: 0 },
    { 'query': { method: 'GET', isArray: false } }
  );
}])

// Controller
.controller('DownloadCtrl', ['$scope', '$window', 'AnnotationTypes',
  function DownloadController( $scope, $window, AnnotationTypes ) {
    $scope.annotations = {
      included_types: [],
      excluded_types: []
    };

    AnnotationTypes.query(
      { q: ''},
      function(responseObject, responseHeaders) {
        for (var index in responseObject.objects) {
          $scope.annotations.included_types = responseObject.objects;
        }
      },
      function(responseObject, responseHeaders) {
        $log.info('Query errored with: ' + responseObject);
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

    // "Download" button.
    $scope.start_download = function() {
      var num_types = $scope.annotations.included_types.length;
      var uri = "/api/v0/sample/get_annotations/?annotation_types=";
      for (var idx = 0; idx < num_types; ++idx) {
        uri += $scope.annotations.included_types[idx].typename + ",";
      }
      // If uri has a trailing "," character, remove it.
      if (uri.endsWith(",")) {
        uri = uri.substr(0, uri.length - 1);
      }
      $window.location.href = uri;  // Call compiled downloading API.
    };

  }
]);
