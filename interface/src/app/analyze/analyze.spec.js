describe('AnalyzeCtrl', function() {
  describe('isCurrentUrl', function() {
    var AnalyzeCtrl, $location, $scope, mockStateParams;

    beforeEach(module('adage.analyze'));

    beforeEach(inject(function($controller, _$location_, $rootScope) {
      $location = _$location_;
      $scope = $rootScope.$new();
      mockStateParams = {mlmodel: 123};
      AnalyzeCtrl = $controller(
        'AnalyzeCtrl',
        {$stateParams: mockStateParams, $location: $location, $scope: $scope}
      );
    }));

    it('should pass a dummy test', inject(function() {
      expect(AnalyzeCtrl).toBeTruthy();
    }));
  });
});
