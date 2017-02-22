describe('Sample', function() {
  var $httpBackend, $log, mockSample;
  var mockSampleResponse = {
    'meta': {
      'limit': 1000,
      'next': null,
      'offset': 0,
      'previous': null,
      'total_count': 1
    },
    'objects': [
      {
        'annotations': {
          'additional_notes': '9.5 h biofilms',
          'biotic_int_lv_1': 'Human',
          'biotic_int_lv_2': 'Lung epithelial cells (CFBE41o- cells)',
          'description':
            'Pseudomonas aeruginosa 9.5 hour static coculture with human blah…',
          'genotype': 'WT',
          'growth_setting_1': 'Biofilm',
          'growth_setting_2': 'Static',
          'medium': 'MEM, 0.4% arginine',
          'nucleic_acid': 'RNA',
          'od': '9.5 hours',
          'strain': 'PA14',
          'temperature': '37'
        },
        'id': 1,
        'ml_data_source': 'GSM252496.CEL',
        'name': 'GSE9989GSM252496',
        'resource_uri': '/api/v0/sample/1/'
      }
    ]
  };


  beforeEach(module('adage.sampleAnnotation'));
  beforeEach(inject(function(_$httpBackend_, _$log_, Sample) {
    $httpBackend = _$httpBackend_;
    $log = _$log_;
    mockSample = Sample;
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
      $httpBackend.expectGET('/api/v0/sample?id=1').respond(
        mockSampleResponse.objects[0]
      );
      var resp = mockSample.get({id: 1});
      $httpBackend.flush();
      // $log.debug('Sample.get resp is: ' + JSON.stringify(resp));

      expect(resp.id).toEqual(1);
      expect(resp.ml_data_source).toEqual('GSM252496.CEL');
      expect(resp.annotations.additional_notes).toEqual('9.5 h biofilms');
    });
  });

  describe('SampleAnnotationCtrl', function() {
    var SampleAnnotationCtrl, $location, $scope, mockStateParams, $log;

    beforeEach(inject(
      function($controller, _$location_, _$q_, _$log_, $rootScope) {
        $location = _$location_;
        $log = _$log_;
        $scope = $rootScope.$new();
        mockStateParams = {samples: '1'};
        SampleAnnotationCtrl = $controller('SampleAnnotationCtrl', {
          $location: $location,
          $scope: $scope,
          $log: $log,
          $stateParams: mockStateParams
        });
      }
    ));

    it('should pass a dummy test', inject(function() {
      $httpBackend.expectGET(
        '/api/v0/sample?id__in=1&limit=0'
      ).respond(mockSampleResponse);
      $httpBackend.flush();

      expect(SampleAnnotationCtrl).toBeTruthy();
    }));

    it('should render the SampleAnnotationCtrl for a sample', inject(
      function() {
        $httpBackend.expectGET(
          '/api/v0/sample?id__in=1&limit=0'
        ).respond(mockSampleResponse);
        expect(SampleAnnotationCtrl.queryStatus).toEqual(
          'Connecting to the server ...'
        );
        $httpBackend.flush();

        expect(SampleAnnotationCtrl.queryStatus).toEqual('');
        expect(SampleAnnotationCtrl.uniqueAnnotationTypes.length).toEqual(12);
        expect(SampleAnnotationCtrl.samples[0].name).toEqual(
          'GSE9989GSM252496'
        );
      }
    ));
  });
});
