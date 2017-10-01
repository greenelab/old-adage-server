describe('adage.sample.service', function() {
  var $httpBackend, $log, Sample, mockSampleData;

  beforeEach(module('adage.sample.service', 'adage.mocks.sample'));
  beforeEach(inject(function(_$httpBackend_, _$log_, _Sample_, SampleMocks) {
    $httpBackend = _$httpBackend_;
    $log = _$log_;
    Sample = _Sample_;
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

  describe('get', function() {
    it('should call sample with id and limit=0', function() {
      $httpBackend.expectGET('/api/v0/sample/1?limit=0').respond(
        mockSampleData.sample1
      );
      var resp = Sample.get({id: 1});
      $httpBackend.flush();
      // $log.debug('Sample.get resp is: ' + JSON.stringify(resp));

      expect(resp.id).toEqual(1);
      expect(resp.ml_data_source).toEqual(
        mockSampleData.sample1.ml_data_source
      );
      expect(resp.annotations.additional_notes).toEqual(
        mockSampleData.sample1.annotations.additional_notes
      );
    });
  });

  describe('getUri', function() {
    it('should call GET on the passed uri', function() {
      $httpBackend.expectGET('/api/v0/sample/1/').respond(
        mockSampleData.sample1
      );
      var resp = Sample.getUri('/api/v0/sample/1/');
      $httpBackend.flush();
      // $log.debug('Sample.getUri resp is: ' + JSON.stringify(resp));

      resp.then(function(respObj) {
        expect(respObj.data.id).toEqual(1);
        expect(respObj.data.ml_data_source).toEqual(
          mockSampleData.sample1.ml_data_source
        );
        expect(respObj.data.annotations.additional_notes).toEqual(
          mockSampleData.sample1.annotations.additional_notes
        );
      });
    });
  });
});
