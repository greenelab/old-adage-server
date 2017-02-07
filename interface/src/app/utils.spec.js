/**
 * Unit tests.
 */

// Test the hyperGeometricTest function
describe('Test for hypergeometric test function in utils.js', function() {
  beforeEach(module('adage.utils'));

  var MathFuncts;

  beforeEach(function() {
    inject(function($injector) {
      MathFuncts = $injector.get('MathFuncts');
    });
  });

  it('should be defined', function() {
    expect(MathFuncts).toBeDefined();
  });

  // The following functions will make sure that the output for the
  // hyperGeometricTest function matches the output produced by
  // http://stattrek.com/m/online-calculator/hypergeometric.aspx and
  // https://www.geneprof.org/GeneProf/tools/hypergeometric.jsp for
  // some given k values.
  it('should output the desired p-values when k is an integer between 1 and 5',
    function() {
      expect(+(1 - MathFuncts.hyperGeometricTest(1, 5, 10, 50)).toFixed(10))
      .toEqual(0.689437218);

      expect(+(1 - MathFuncts.hyperGeometricTest(2, 5, 10, 50)).toFixed(10))
      .toEqual(0.2581000208);

      expect(+(1 - MathFuncts.hyperGeometricTest(3, 5, 10, 50)).toFixed(10))
      .toEqual(0.0482603032);

      expect(+(1 - MathFuncts.hyperGeometricTest(4, 5, 10, 50)).toFixed(10))
      .toEqual(0.0040835205);

      expect(+(1 - MathFuncts.hyperGeometricTest(5, 5, 10, 50)).toFixed(10))
      .toEqual(0.0001189375);
    }
  );
});
