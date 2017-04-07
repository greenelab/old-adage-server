/**
 * 'adage.node' module unit tests
 *
 **/

// Test <high-weight-genes> directive.
describe('<high-weight-genes> directive', function() {
  beforeEach(module('adage.node'));

  // Thanks to "grunt-html2js" module (called by Grunt), the template file
  // "node/high_weight_genes.tpl.html" has been converted into an Angular
  // module of the same name and put in $templateCache before karma runs.
  beforeEach(module('node/high_weight_genes.tpl.html'));

  var $compile, $httpBackend, $rootScope;
  beforeEach(inject(function(_$compile_, _$httpBackend_, _$rootScope_) {
    $compile = _$compile_;
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;
  }));

  it('should render HTML correctly', function() {
    var parentScope = $rootScope.$new();
    parentScope.nodeID = 123;
    var testHTML = '<high-weight-genes node-id="{{nodeID}}" ' +
        'genes="ctrl.genes"></high-weight-genes>';
    var uri = '/api/v0/participation?limit=0&node=' + parentScope.nodeID;
    var element = $compile(testHTML)(parentScope);

    // Mocked response data of genes:
    var mockGenes = [
      {gene: {
        'systematic_name': 'g1_sys',
        'standard_name': 'g1_std',
        'description': 'g1_desc'
      }},
      {gene: {
        'systematic_name': 'g2_sys',
        'standard_name': 'g2_std',
        'description': 'hypothetical protein'
      }},
      {gene: {
        'systematic_name': 'g3_sys',
        'standard_name': 'g3_std',
        'description': 'g3_desc'
      }}
    ];

    $httpBackend.expectGET(uri).respond({objects: mockGenes});
    parentScope.$digest(); // Start Angular's digest cycle manually.

    // Get isolate scope of <high-weight-genes> directive:
    var elementScope = element.isolateScope();

    // Before $httpBackend.flush() is called, no backend data is available;
    // so queryStatus in the directive's scope keeps its initial value, and
    // the rendered HTML only shows a <div> with queryStatus message.
    expect(elementScope.queryStatus).toBe('Connecting to the server ...');
    // Confirm the text in rendered html too:
    var divElement = element.find('div');
    expect(divElement.text()).toBe('Connecting to the server ...');

    // Make backend data available to the directive.
    $httpBackend.flush();

    // Confirm that properties in directive are populated based on mockGenes:
    expect(elementScope.queryStatus).toBe('');
    expect(elementScope.genes.length).toEqual(3);
    expect(elementScope.genes[0].sysName).toEqual(
      mockGenes[0].gene.systematic_name);
    expect(elementScope.genes[1].stdName).toEqual(
      mockGenes[1].gene.standard_name);
    expect(elementScope.genes[2].desc).toEqual(
      mockGenes[2].gene.description);
    expect(elementScope.hypoPercentage).toEqual(33);

    // Confirm that the rendered HTML contains data in mockGenes too:
    var tdElements = element.find('td');
    expect(tdElements.text()).toContain(mockGenes[0].gene.standard_name);
    expect(tdElements.text()).toContain(mockGenes[1].gene.description);
    expect(tdElements.text()).toContain(mockGenes[2].gene.systematic_name);
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
});

// Test <high-range-exp> directive.
describe('<high-range-exp> directive', function() {
  beforeEach(module('adage.node'));

  beforeEach(module('node/high_range_exp.tpl.html'));

  var $compile, $httpBackend, $rootScope;
  var parentScope, element, testHTML, activityUri, experimentUri;
  beforeEach(inject(function(_$compile_, _$httpBackend_, _$rootScope_) {
    $compile = _$compile_;
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;

    parentScope = $rootScope.$new();
    parentScope.nodeID = 123;
    parentScope.topExp = 20;

    testHTML = '<high-range-exp node-id="{{nodeID}}" ' +
      ' top-exp="{{topExp}}"></high-range-exp>';

    element = $compile(testHTML)(parentScope);
    activityUri = '/api/v0/activity/?limit=0&node=' + parentScope.nodeID;
    experimentUri = '/api/v0/experiment/?limit=0&node=' + parentScope.nodeID;
  }));

  it('should render HTML correctly', function() {
    // Mocked activity response data:
    var mockActivity = [
      {id: 1, node: 123, sample: 1001, value: 0.0854334209211516}
    ];

    // Mocked experiment response data:
    var mockExperiment = [{
      'accession': 'E-GEOD-00001',
      'description': 'Sample description',
      'name': 'Sample experiment name',
      'resource_uri': '/api/v0/experiment/E-GEOD-00001/',
      'sample_set': ['/api/v0/sample/1/', '/api/v0/sample/2/']
    }];

    $httpBackend.expectGET(activityUri).respond({objects: mockActivity});
    $httpBackend.expectGET(experimentUri).respond({objects: mockExperiment});
    parentScope.$digest(); // Start Angular's digest cycle manually.

    // Get isolate scope of <high-range-exp> directive:
    var elementScope = element.isolateScope();

    // Confirm that the queryStatus is 'Connecting to the server ...' if
    // server has not returned a response.
    expect(elementScope.queryStatus).toBe('Connecting to the server ...');
    // Confirm the text in rendered html too:
    var divElement = element.find('div');
    expect(divElement.text()).toBe('Connecting to the server ...');


    // Make backend data available to the directive.
    $httpBackend.flush();

    // Confirm that properties in directive are what we expect them to be
    // The queryStatus should now be an empty string.
    expect(elementScope.queryStatus).toBe('');
  });

  it('should get the appropriate activity values', function() {
    // Mocked activity response data:
    var mockActivity = [
      {id: 1, node: 123, sample: 1001, value: 0.0854334209211516},
      {id: 2, node: 123, sample: 1002, value: 0.0689115612702348},
      {id: 3, node: 123, sample: 1003, value: 0.0702073433150119},
      {id: 4, node: 123, sample: 1004, value: 0.0677049302827924},
      {id: 5, node: 123, sample: 1005, value: 0.0712094377832054},
      {id: 6, node: 123, sample: 1006, value: 0.0721038265557411},
      {id: 7, node: 123, sample: 1007, value: 0.0715914344928831},
      {id: 8, node: 123, sample: 1008, value: 0.0825894283807123},
      {id: 9, node: 123, sample: 1009, value: 0.0836206569872482},
      {id: 10, node: 123, sample: 1010, value: 0.0647705496729518},
      {id: 11, node: 123, sample: 1011, value: 0.0658942367538415},
      {id: 12, node: 123, sample: 1012, value: 0.0727115753936357},
      {id: 13, node: 123, sample: 1013, value: 0.0790896289324697},
      {id: 14, node: 123, sample: 1014, value: 0.0692046195604449},
      {id: 15, node: 123, sample: 1015, value: 0.078560557941843},
      {id: 16, node: 123, sample: 1016, value: 0.0743736434104904},
      {id: 17, node: 123, sample: 1017, value: 0.07871175918013},
      {id: 18, node: 123, sample: 1018, value: 0.0614160606502279},
      {id: 19, node: 123, sample: 1019, value: 0.0661371872868119},
      {id: 20, node: 123, sample: 1020, value: 0.0783672660119669},
      {id: 21, node: 123, sample: 1021, value: 0.0769023791604038}
    ];

    // Mocked experiment response data:
    var mockExperiment = [{
      'accession': 'E-GEOD-00001',
      'description': 'Sample description',
      'name': 'Sample experiment name',
      'resource_uri': '/api/v0/experiment/E-GEOD-00001/',
      'sample_set': ['/api/v0/sample/1/', '/api/v0/sample/2/']
    }];

    $httpBackend.expectGET(activityUri).respond({objects: mockActivity});
    $httpBackend.expectGET(experimentUri).respond({objects: mockExperiment});
    parentScope.$digest(); // Start Angular's digest cycle manually.

    // Get isolate scope of <high-range-exp> directive:
    var elementScope = element.isolateScope();

    // Make backend data available to the directive.
    $httpBackend.flush();

    // Confirm that properties in directive are what we expect them to be
    // The queryStatus should now be an empty string.
    expect(elementScope.queryStatus).toBe('');

    // The 'activities' property in the local scope should be an object,
    // where each key is the sample id and each value is the activity value
    // itself (which is a float).
    expect(elementScope.activities).toEqual({
      1001: 0.0854334209211516,
      1002: 0.0689115612702348,
      1003: 0.0702073433150119,
      1004: 0.0677049302827924,
      1005: 0.0712094377832054,
      1006: 0.0721038265557411,
      1007: 0.0715914344928831,
      1008: 0.0825894283807123,
      1009: 0.0836206569872482,
      1010: 0.0647705496729518,
      1011: 0.0658942367538415,
      1012: 0.0727115753936357,
      1013: 0.0790896289324697,
      1014: 0.0692046195604449,
      1015: 0.078560557941843,
      1016: 0.0743736434104904,
      1017: 0.07871175918013,
      1018: 0.0614160606502279,
      1019: 0.0661371872868119,
      1020: 0.0783672660119669,
      1021: 0.0769023791604038
    });
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
});
