describe('adage.analyze.sample', function() {
  var $httpBackend, $log, mockSampleData;

  beforeEach(module('adage.analyze.sample'));
  beforeEach(module('adage.mocks.sample'));
  beforeEach(inject(function(_$httpBackend_, _$log_, SampleMocks) {
    $httpBackend = _$httpBackend_;
    $log = _$log_;
    mockSampleData = SampleMocks;
  }));

  // Ensure no outstanding expectation or request at the end.
  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    // very useful $log capture information from:
    // http://www.jvandemo.com/how-to-access-angular-log-debug-messages-from-within-karma/
    if ($log.debug.logs.length > 0) {
      console.log($log.debug.logs);
    }
  });

  describe('SampleCtrl', function() {
    var SampleCtrl, $location, $scope;

    beforeEach(inject(function($controller, _$location_, $rootScope) {
      $location = _$location_;
      $scope = $rootScope.$new();
      SampleCtrl = $controller(
        'SampleCtrl',
        {$location: $location, $scope: $scope}
      );
    }));

    it('should pass a dummy test', inject(function() {
      expect(SampleCtrl).toBeTruthy();
    }));

    it('should render the sampleDetail for a sample', inject(function() {
      $httpBackend.expectGET(
        '/api/v0/sample/1?limit=0'
      ).respond(mockSampleData.sample1);
      $httpBackend.expectGET(
        '/api/v0/sample/1/get_experiments?limit=0'
      ).respond(mockSampleData.sample1GetExperiments);
      $scope.show(1);
      expect($scope.sample.status).toEqual('retrieving...');
      $httpBackend.flush();

      expect($scope.sample.status).toEqual('');
      expect($scope.sample.results.name).toEqual(mockSampleData.sample1.name);
      expect($scope.sample.relatedExperiments.length).toEqual(2);
      expect(
        $scope.sample.relatedExperiments[0].accession
      ).toEqual(mockSampleData.sample1GetExperiments[0].accession);
    }));
  });
});

