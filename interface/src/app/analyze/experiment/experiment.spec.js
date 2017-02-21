describe('Experiment', function() {
  var $httpBackend, $log, mockExperiment;
  var mockExperimentResponse = {
    'accession': 'E-GEOD-9989',
    'description': 'We grew Pseudomonas aeruginosa biofilms on CFBE41o- blah…',
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
  };
  var mockSampleResponses = [{
    'id': 1,
    'ml_data_source': 'GSM252496.CEL',
    'name': 'GSE9989GSM252496'
  }, {
    'id': 2,
    'ml_data_source': 'GSM252501.CEL',
    'name': 'GSE9989GSM252501'
  }, {
    'id': 3,
    'ml_data_source': 'GSM252505.CEL',
    'name': 'GSE9989GSM252505'
  }, {
    'id': 4,
    'ml_data_source': 'GSM252506.CEL',
    'name': 'GSE9989GSM252506'
  }, {
    'id': 5,
    'ml_data_source': 'GSM252507.CEL',
    'name': 'GSE9989GSM252507'
  }, {
    'id': 6,
    'ml_data_source': 'GSM252508.CEL',
    'name': 'GSE9989GSM252508'
  }];

  beforeEach(module('adage.analyze.sample'));
  beforeEach(inject(function(_$httpBackend_, _$log_, Experiment) {
    $httpBackend = _$httpBackend_;
    $log = _$log_;
    mockExperiment = Experiment;
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
    it('should call experiment with accession and limit=0', function() {
      $httpBackend.expectGET('/api/v0/experiment/E-GEOD-9989?limit=0').respond(
        mockExperimentResponse
      );
      var resp = mockExperiment.get({accession: 'E-GEOD-9989'});
      $httpBackend.flush();
      // $log.debug('Experiment.get resp is: ' + JSON.stringify(resp));

      expect(resp.accession).toEqual('E-GEOD-9989');
      expect(resp.name).toEqual(
        'Transcription profiling of P. aeruginosa biofilms treated blah…'
      );
      expect(resp.sample_set.length).toEqual(6);
    });
  });

  describe('ExperimentCtrl', function() {
    describe('isCurrentUrl', function() {
      var ExperimentCtrl, $location, $scope;

      beforeEach(inject(function($controller, _$location_, $rootScope) {
        $location = _$location_;
        $scope = $rootScope.$new();
        ExperimentCtrl = $controller(
          'ExperimentCtrl',
          {$location: $location, $scope: $scope}
        );
      }));

      it('should pass a dummy test', inject(function() {
        expect(ExperimentCtrl).toBeTruthy();
      }));

      it('should render the experimentDetail for an experiment', inject(
        function() {
          $httpBackend.expectGET(
            '/api/v0/experiment/E-GEOD-9989?limit=0'
          ).respond(mockExperimentResponse);
          $httpBackend.expectGET('/api/v0/sample/1/').respond(
            mockSampleResponses[0]
          );
          $httpBackend.expectGET('/api/v0/sample/2/').respond(
            mockSampleResponses[1]
          );
          $httpBackend.expectGET('/api/v0/sample/3/').respond(
            mockSampleResponses[2]
          );
          $httpBackend.expectGET('/api/v0/sample/4/').respond(
            mockSampleResponses[3]
          );
          $httpBackend.expectGET('/api/v0/sample/5/').respond(
            mockSampleResponses[4]
          );
          $httpBackend.expectGET('/api/v0/sample/6/').respond(
            mockSampleResponses[5]
          );
          $scope.show('E-GEOD-9989');
          expect($scope.experiment.status).toEqual('retrieving...');
          $httpBackend.flush();

          expect($scope.experiment.status).toEqual('');
          expect($scope.experiment.results.name).toEqual(
            'Transcription profiling of P. aeruginosa biofilms treated blah…'
          );
          expect($scope.experiment.related_samples.length).toEqual(6);
          expect(
            $scope.experiment.related_samples[0].name
          ).toEqual('GSE9989GSM252496');
        }
      ));
    });
  });
});

