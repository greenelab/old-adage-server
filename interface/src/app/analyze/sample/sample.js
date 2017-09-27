angular.module('adage.analyze.sample', [
  'statusBar',
  'adage.sample.services',  // TODO: use adage.sample.service when refactored
  'adage.experiment.service'
])

.controller('SampleCtrl', ['$scope', '$log', '$location', 'Sample',
  'Experiment',
  function SampleCtrl($scope, $log, $location, Sample, Experiment) {
    $scope.makeHref = Experiment.makeHref;

    var queryError = function(responseObject, responseHeaders) {
      $log.warn('Query errored with: ' + responseObject);
      $scope.sample.status = 'Query failed.';
    };

    $scope.show = function(id) {
      $scope.sample = {
        status: 'retrieving...'
      };
      Sample.get({id: id},
        function(responseObject, responseHeaders) {
          if (responseObject) {
            $scope.sample.status = '';
            $scope.sample.results = responseObject;
          }
        },
        queryError
      );
      Sample.getExperiments({id: id},
        function(responseObject, responseHeaders) {
          if (responseObject) {
            $scope.sample.status = '';
            $scope.sample.relatedExperiments = responseObject;
          }
        },
        queryError
      );
    };
  }
])

.directive('sampleDetail', function() {
  return {
    restrict: 'E',
    scope: {
      id: '='
    },
    templateUrl: 'analyze/sample/sampleDetail.tpl.html',
    controller: 'SampleCtrl',
    link: function(scope) {
      scope.$watch('id', function(val) {
        scope.show(val);
      });
    }
  };
})
;
