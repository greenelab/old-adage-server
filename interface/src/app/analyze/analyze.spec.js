describe( 'AnalyzeCtrl', function() {
  describe( 'isCurrentUrl', function() {
    var AnalyzeCtrl, $location, $scope;

    beforeEach( module( 'adage.analyze' ) );

    beforeEach( inject( function( $controller, _$location_, $rootScope ) {
      $location = _$location_;
      $scope = $rootScope.$new();
      AnalyzeCtrl = $controller( 'AnalyzeCtrl', { $location: $location, $scope: $scope });
    }));

    it( 'should pass a dummy test', inject( function() {
      expect( AnalyzeCtrl ).toBeTruthy();
    }));
  });
});
