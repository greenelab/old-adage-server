angular.module('statusBar', [])

.directive('statusBar', function() {
  return {
    restrict: 'E',
    scope: {
      msgText: '='
    },
    templateUrl: 'statusBar/statusBar.tpl.html'
  };
})
;
