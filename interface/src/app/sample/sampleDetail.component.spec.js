describe('Sample', function() {
  var $httpBackend, $log, mockSampleData;

  beforeEach(module('adage.sampleDetail.component'));
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

  describe('SampleDetailCtrl', function() {
    var $componentController;
    var bindings = {id: 1};   // TODO test on-load callback here

    beforeEach(inject(function(_$componentController_) {
      $componentController = _$componentController_;
    }));

    it('should pass a dummy test', inject(function() {
      var ctrl = $componentController('sampleDetail', null, bindings);
      expect(ctrl).toBeTruthy();
    }));

    it('should render the sampleDetail for a sample', inject(function() {
      var ctrl = $componentController('sampleDetail', null, bindings);

      $httpBackend.expectGET(
        '/api/v0/sample/1?limit=0'
      ).respond(mockSampleData.sample1);
      $httpBackend.expectGET(
        '/api/v0/sample/1/get_experiments?limit=0'
      ).respond(mockSampleData.sample1GetExperiments);
      ctrl.show(1);
      expect(ctrl.sample.status).toEqual('retrieving...');
      $httpBackend.flush();

      expect(ctrl.sample.status).toEqual('');
      expect(ctrl.sample.results.name).toEqual(mockSampleData.sample1.name);
      expect(ctrl.sample.relatedExperiments.length).toEqual(2);
      expect(
        ctrl.sample.relatedExperiments[0].accession
      ).toEqual(mockSampleData.sample1GetExperiments[0].accession);
    }));
  });
});

