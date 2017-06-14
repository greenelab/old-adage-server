describe('sample_annotation', function() {
  var $httpBackend, $log, SampleMocks;

  beforeEach(module('adage.sampleAnnotation'));
  beforeEach(module('adage.mocks.sample'));
  beforeEach(inject(function(_$httpBackend_, _$log_, _SampleMocks_) {
    $httpBackend = _$httpBackend_;
    $log = _$log_;
    SampleMocks = _SampleMocks_;
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

  describe('SampleAnnotationCtrl', function() {
    var SampleAnnotationCtrl, mockStateParams, mockMlModelTracker;

    beforeEach(inject(function($controller) {
      var modelID = 23;
      mockStateParams = {samples: '1', mlmodel: modelID};
      mockMlModelTracker = {id: modelID, title: 'test model', organism: null};
      SampleAnnotationCtrl = $controller('SampleAnnotationCtrl', {
        $stateParams: mockStateParams,
        MlModelTracker: mockMlModelTracker
      });
    }));

    it('should pass a dummy test', inject(function() {
      $httpBackend.expectGET(
        '/api/v0/sample?id__in=1&limit=0'
      ).respond(SampleMocks.sample1Paginated);
      $httpBackend.flush();

      expect(SampleAnnotationCtrl).toBeTruthy();
    }));

    it('should render the SampleAnnotationCtrl for a sample',
      function() {
        $httpBackend.expectGET(
          '/api/v0/sample?id__in=1&limit=0'
        ).respond(SampleMocks.sample1Paginated);
        expect(SampleAnnotationCtrl.queryStatus).toEqual(
          'Connecting to the server ...'
        );
        $httpBackend.flush();

        expect(SampleAnnotationCtrl.queryStatus).toEqual('');
        expect(SampleAnnotationCtrl.uniqueAnnotationTypes.length).toEqual(12);
        expect(SampleAnnotationCtrl.samples[0].name).toEqual(
          SampleMocks.sample1Paginated.objects[0].name
        );
      }
    );
  });
});
