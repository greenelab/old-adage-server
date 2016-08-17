/**
 * Unit tests.
 */

describe('DownloadCtrl', function() {
  describe('isCurrentUrl', function() {
    var DownloadCtrl, $location, $scope;

    beforeEach(module('adage'));

    beforeEach(inject(function($controller, _$location_, $rootScope) {
      $location = _$location_;
      $scope = $rootScope.$new();
      DownloadCtrl = $controller('DownloadCtrl',
                                 {$location: $location, $scope: $scope});
    }));

    it('validates DownloadCtrl controller', inject(function() {
      expect(DownloadCtrl).toBeTruthy();
    }));
  });
});
