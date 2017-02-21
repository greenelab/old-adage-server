describe('Sample', function() {
  var $httpBackend, $log, mockSample;
  var mockSampleResponse = {
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
  };
  var mockGetExperimentResponse = [
    {
      'accession': 'E-GEOD-9989',
      'description': 'We grew Pseudomonas aeruginosa biofilms on CFBE41o- bla…',
      'name': 'Transcription profiling of P. aeruginosa biofilms treated blah…',
      'resource_uri': '/api/v0/experiment/E-GEOD-9989/',
      'sample_set': [
        '/api/v0/sample/1/',
        '/api/v0/sample/2/',
        '/api/v0/sample/3/',
        '/api/v0/sample/4/',
        '/api/v0/sample/5/',
        '/api/v0/sample/6/'
      ]
    },
    {
      'accession': 'E-GEOD-10030',
      'description': 'This SuperSeries is composed of the following blah…',
      'name': 'Transcription profiling of Pseudomonas aeruginosa treated blah…',
      'resource_uri': '/api/v0/experiment/E-GEOD-10030/',
      'sample_set': [
        '/api/v0/sample/1/',
        '/api/v0/sample/2/',
        '/api/v0/sample/3/',
        '/api/v0/sample/4/',
        '/api/v0/sample/5/',
        '/api/v0/sample/6/',
        '/api/v0/sample/7/',
        '/api/v0/sample/8/',
        '/api/v0/sample/9/',
        '/api/v0/sample/10/'
      ]
    }
  ];

  beforeEach(module('adage.analyze.sample'));
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
      $httpBackend.expectGET('/api/v0/sample/1?limit=0').respond(
        mockSampleResponse
      );
      var resp = mockSample.get({id: 1});
      $httpBackend.flush();
      // $log.debug('Sample.get resp is: ' + JSON.stringify(resp));

      expect(resp.id).toEqual(1);
      expect(resp.ml_data_source).toEqual('GSM252496.CEL');
      expect(resp.annotations.additional_notes).toEqual('9.5 h biofilms');
    });
  });

  describe('getUri', function() {
    it('should call GET on the passed uri', function() {
      $httpBackend.expectGET('/api/v0/sample/1/').respond(mockSampleResponse);
      var resp = mockSample.getUri('/api/v0/sample/1/');
      $httpBackend.flush();
      // $log.debug('Sample.getUri resp is: ' + JSON.stringify(resp));

      resp.then(function(respObj) {
        expect(respObj.data.id).toEqual(1);
        expect(respObj.data.ml_data_source).toEqual('GSM252496.CEL');
        expect(respObj.data.annotations.additional_notes).toEqual(
          '9.5 h biofilms'
        );
      });
    });
  });

  describe('SampleCtrl', function() {
    describe('isCurrentUrl', function() {
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
        ).respond(mockSampleResponse);
        $httpBackend.expectGET(
          '/api/v0/sample/1/get_experiments?limit=0'
        ).respond(mockGetExperimentResponse);
        $scope.show(1);
        expect($scope.sample.status).toEqual('retrieving...');
        $httpBackend.flush();

        expect($scope.sample.status).toEqual('');
        expect($scope.sample.results.name).toEqual('GSE9989GSM252496');
        expect($scope.sample.relatedExperiments.length).toEqual(2);
        expect(
          $scope.sample.relatedExperiments[0].accession
        ).toEqual('E-GEOD-9989');
      }));
    });
  });
});

