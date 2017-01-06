/**
 * "adage.download" module, which will download sample annotations based on
 * selected annotation types.
 */

angular.module('adage.download', [
  'ui.router',
  'ui.bootstrap',
  'ngResource',
  'as.sortable'
])

.config(['$stateProvider', function config($stateProvider) {
  $stateProvider.state('download', {
    url: '/download',
    views: {
      main: {
        templateUrl: 'download/download.tpl.html',
        controller: 'DownloadCtrl as ctrl'
      }
    },
    data: {pageTitle: 'Download'}
  });
}])

.factory('AnnotationTypes', ['$resource', function($resource) {
  return $resource('/api/v0/annotationtype');
}])

.controller('DownloadCtrl', ['$window', '$log', 'AnnotationTypes',
  function DownloadController($window, $log, AnnotationTypes) {
    var self = this;
    self.queryStatus = 'Connecting to the server ...';
    self.fixedTypes = ['experiment', 'sample_name', 'ml_data_source'];
    self.includedTypes = [];
    self.excludedTypes = [];

    // Remove a type from inclusion list.
    self.delType = function(index) {
      var currItem = self.includedTypes[index];
      self.includedTypes.splice(index, 1);
      self.excludedTypes.push(currItem);
    };

    // Add a type back to inclusion list.
    self.addType = function(index) {
      var currItem = self.excludedTypes[index];
      self.excludedTypes.splice(index, 1);
      self.includedTypes.push(currItem);
    };

    // Handler of "Download" button click event.
    self.startDownload = function() {
      var uri = '/api/v0/sample/get_annotations/?annotation_types=';
      uri += self.includedTypes.join();
      $window.location.href = uri;
    };

    // Retrieve selectable annotation types from the server.
    AnnotationTypes.get({limit: 0},
      function success(response) {
        response.objects.forEach(function(element) {
          self.includedTypes.push(element.typename);
        });
        self.queryStatus = '';
      },
      function error(errResponse) {
        var errMessage = errResponse.statusCode + ' ' + errResponse.statusText;
        $log.error('Failed to get annotation types: ' + errMessage);
        self.queryStatus = 'Connection to server failed: ' + errMessage;
      }
    );
  }
]);
