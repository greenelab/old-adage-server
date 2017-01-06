/**
 * Unit tests.
 */

// Test the generic controller properties (without server calls):
describe('DownloadCtrl w/o server calls', function() {
  beforeEach(module('adage.download'));

  var ctrl, mockService;
  // Create a mocked "AnnotationTypes" service, which overwrites the service
  // in download.js (because it is loaded after "adage.download" module).
  beforeEach(module(function($provide) {
    mockService = {
      get: function() { }
    };
    $provide.value('AnnotationTypes', mockService);
  }));

  beforeEach(inject(function($controller) {
    ctrl = $controller('DownloadCtrl');
  }));

  it('should be defined', function() {
    expect(ctrl).toBeDefined();
  });

  it('should have three fixed annotation types', function() {
    expect(ctrl.fixedTypes).toEqual(
      ['experiment', 'sample_name', 'ml_data_source']
    );
  });

  // Because get() method in mocked AnnotationTypes service does nothing,
  // all controller properties should have their initial values.

  it('should have pending connection status', function() {
    expect(ctrl.queryStatus).toEqual('Connecting to the server ...');
  });

  it('should have no included types', function() {
    expect(ctrl.includedTypes.length).toEqual(0);
  });

  it('should have no excluded types', function() {
    expect(ctrl.excludedTypes.length).toEqual(0);
  });
});

// Test the controller with server calls.
describe('DownloadCtrl with server calls', function() {
  beforeEach(module('adage.download'));

  var ctrl, $httpBackend;
  // Set local variable "$httpBackend" to $httpBackend service instance
  // in ngMock, then set "ctrl" to DownloadCtrl instance.
  // The underscore wrapping in the first argument _$httpBackend_ is
  // explained in "Resolving References" section of this article:
  // https://docs.angularjs.org/api/ngMock/function/angular.mock.inject
  beforeEach(inject(function(_$httpBackend_, $controller) {
    $httpBackend = _$httpBackend_;
    // The exact URI requested by controller through AnnotationTypes service:
    var uri = '/api/v0/annotationtype?limit=0';
    // When $httpBackend.flush() is called, $httpBackend will respond to
    // the controller's GET request with some mock data:
    $httpBackend.expectGET(uri).respond(
      {objects: [
        {typename: 'mock_type1'},
        {typename: 'mock_type2'},
        {typename: 'mock_type3'}
      ]}
    );
    // Instantiate the controller:
    ctrl = $controller('DownloadCtrl');
  }));

  it('should set includedTypes based on server response', function() {
    expect(ctrl.queryStatus).toEqual('Connecting to the server ...');
    expect(ctrl.includedTypes.length).toEqual(0);
    expect(ctrl.excludedTypes.length).toEqual(0);

    // Here comes the asynchronous response of GET request (requested by
    // the controller) with fake data:
    $httpBackend.flush();

    expect(ctrl.queryStatus).toEqual('');
    expect(ctrl.includedTypes)
      .toEqual(['mock_type1', 'mock_type2', 'mock_type3']);
    expect(ctrl.excludedTypes.length).toEqual(0);
  });

  it('should include or exclude a selected annotation', function() {
    $httpBackend.flush();
    // Exclude 'mock_type2':
    ctrl.delType(1);
    expect(ctrl.includedTypes).toEqual(['mock_type1', 'mock_type3']);
    expect(ctrl.excludedTypes).toEqual(['mock_type2']);

    // Exclude 'mock_type1' too:
    ctrl.delType(0);
    expect(ctrl.includedTypes).toEqual(['mock_type3']);
    expect(ctrl.excludedTypes).toEqual(['mock_type2', 'mock_type1']);

    // Add 'mock_type1' back to includedTypes:
    ctrl.addType(1);
    expect(ctrl.includedTypes).toEqual(['mock_type3', 'mock_type1']);
    expect(ctrl.excludedTypes).toEqual(['mock_type2']);
  });

  // Ensure no outstanding expectation or request at the end.
  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
});
