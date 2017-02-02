/**
 * Test <high-weight-genes> directive.
 **/

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
        'h-w-genes="ctrl.hWGenes"></high-weight-genes>';
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

    // Get isolated scope of <high-weight-genes> directive:
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
