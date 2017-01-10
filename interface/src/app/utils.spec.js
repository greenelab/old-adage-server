/**
 * Unit tests.
 */

// Test the hyperGeometricTest function
describe('Test for hypergeometric test function in utils.js', function() {
  beforeEach(module('adage.utils'));

  var mockService;

  beforeEach(function() {
    angular.mock.inject(function($injector) {
      mockService = $injector.get('MathFuncts');
    });
  });

  it('should be defined', function() {
    expect(mockService).toBeDefined();
  });

  // The following functions will make sure that the output for the
  // hyperGeometricTest function matches the output produced by
  // http://stattrek.com/m/online-calculator/hypergeometric.aspx and
  // https://www.geneprof.org/GeneProf/tools/hypergeometric.jsp for
  // some given k values.
  it('should output a desired p-value for k=1', function() {
    expect(+(1 - mockService.hyperGeometricTest(1, 5, 10, 50)).toFixed(10))
    .toEqual(0.689437218);
  });

  it('should output a desired p-value for k=2', function() {
    expect(+(1 - mockService.hyperGeometricTest(2, 5, 10, 50)).toFixed(10))
    .toEqual(0.2581000208);
  });

  it('should output a desired p-value for k=3', function() {
    expect(+(1 - mockService.hyperGeometricTest(3, 5, 10, 50)).toFixed(10))
    .toEqual(0.0482603032);
  });

  it('should output a desired p-value for k=4', function() {
    expect(+(1 - mockService.hyperGeometricTest(4, 5, 10, 50)).toFixed(10))
    .toEqual(0.0040835205);
  });

  it('should output a desired p-value for k=5', function() {
    expect(+(1 - mockService.hyperGeometricTest(5, 5, 10, 50)).toFixed(10))
    .toEqual(0.0001189375);
  });
});
