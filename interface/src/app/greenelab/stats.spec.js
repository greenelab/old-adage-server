/**
 * Unit tests.
 */

// Test the hyperGeometricTest function
describe('Test the hypergeometric test function in stats.js', function() {
  beforeEach(module('greenelab.stats'));

  var MathFuncts;

  beforeEach(inject(function(_MathFuncts_) {
    MathFuncts = _MathFuncts_;
  }));

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

describe('tTest in stats.js', function() {
  beforeEach(module('greenelab.stats'));

  var MathFuncts;

  beforeEach(inject(function(_MathFuncts_) {
    MathFuncts = _MathFuncts_;
  }));

  it('should be defined', function() {
    expect(MathFuncts).toBeDefined();
    expect(MathFuncts).toBeTruthy();
  });

  // These tests compare results from tTest against results obtained from
  // R's t.test
  // http://stat.ethz.ch/R-manual/R-devel/library/stats/html/t.test.html
  it('should produce correct results for several examples', function() {
    var tt;

    // Compare with R's output from:
    // tt <- t.test(c(0.7, -1.6, -0.2, -1.2, -0.1, 3.4, 3.7, 0.8, 0.0, 2.0),
    // c(1.9, 0.8, 1.1, 0.1, -0.1, 4.4, 5.5, 1.6, 4.6, 3.4))
    tt = MathFuncts.tTest(
      [0.7, -1.6, -0.2, -1.2, -0.1, 3.4, 3.7, 0.8, 0.0, 2.0],
      [1.9, 0.8, 1.1, 0.1, -0.1, 4.4, 5.5, 1.6, 4.6, 3.4]
    );
    expect(+tt.testValue().toFixed(10)).toEqual(-1.8608134675);
    expect(+tt.pValue().toFixed(10)).toEqual(0.0793941404);
    expect(+tt.confidence()[0].toFixed(10)).toEqual(-3.3654832104); // lower ci
    expect(+tt.confidence()[1].toFixed(10)).toEqual(0.2054832104); // upper ci
    expect(tt.valid()).toBe(true);
    expect(+tt.freedom().toFixed(10)).toEqual(17.7764735162);

    // Compare with R's output from:
    // tt <- t.test(c(0.5361161, 0.3878819, -0.2688780, -0.3422277, 2.4233964),
    // c(-1.9037639, -2.1121372, 1.9007528, 0.2987301, -1.0119501))
    tt = MathFuncts.tTest(
      [0.5361161, 0.3878819, -0.2688780, -0.3422277, 2.4233964],
      [-1.9037639, -2.1121372, 1.9007528, 0.2987301, -1.0119501]
    );
    expect(+tt.testValue().toFixed(10)).toEqual(1.2360437329);
    expect(+tt.pValue().toFixed(10)).toEqual(0.2564335358);
    expect(+tt.confidence()[0].toFixed(10)).toEqual(-1.0175996584); // lower ci
    expect(+tt.confidence()[1].toFixed(10)).toEqual(3.2434624584); // upper ci
    expect(tt.valid()).toBe(true);
    expect(+tt.freedom().toFixed(10)).toEqual(6.9769307501);

    // Compare with R's output from:
    // tt <- t.test(c(0.002297313, -2.01655, 0.8762991, -0.04565538, 0.4066173,
    // -1.74174, -0.6146424, -0.2181745, -0.8356771, 0.802121, -0.4595774,
    // -0.5659323, 0.4222257, 0.5426019, -0.7335135, 1.300052, 0.6424826,
    // -0.4537989, -0.05198576, 0.6700204, 0.6788123, 0.1883912, -0.1741902,
    // -0.4503932, -1.098071, -0.3783309, 2.694307, -0.3503489, 0.8662056,
    // -0.2275408), c(0.3987437, -1.009402, 0.2637079, 1.040592, 1.531982,
    // 1.962857, 1.167957, -0.08074605, 2.429232, 0.6606925, 1.865024,
    // 0.9308863, 0.9875501, 0.5189416, 1.022688, 0.002726125, 1.695041,
    // 1.874482, -0.1429274, -1.328964, 1.668616, -0.2354719, -0.3779898,
    // 1.169342, 1.557759, 1.793148, -1.409778, 1.660374, 2.101568, 1.057995))
    tt = MathFuncts.tTest(
      [0.002297313, -2.01655, 0.8762991, -0.04565538, 0.4066173, -1.74174,
        -0.6146424, -0.2181745, -0.8356771, 0.802121, -0.4595774, -0.5659323,
        0.4222257, 0.5426019, -0.7335135, 1.300052, 0.6424826, -0.4537989,
        -0.05198576, 0.6700204, 0.6788123, 0.1883912, -0.1741902, -0.4503932,
        -1.098071, -0.3783309, 2.694307, -0.3503489, 0.8662056, -0.2275408],
      [0.3987437, -1.009402, 0.2637079, 1.040592, 1.531982, 1.962857,
        1.167957, -0.08074605, 2.429232, 0.6606925, 1.865024, 0.9308863,
        0.9875501, 0.5189416, 1.022688, 0.002726125, 1.695041, 1.874482,
        -0.1429274, -1.328964, 1.668616, -0.2354719, -0.3779898, 1.169342,
        1.557759, 1.793148, -1.409778, 1.660374, 2.101568, 1.057995]
    );
    expect(+tt.testValue().toFixed(10)).toEqual(-3.3209761128);
    expect(+tt.pValue().toFixed(10)).toEqual(0.0015663897);
    expect(+tt.confidence()[0].toFixed(10)).toEqual(-1.3411325516); // lower ci
    expect(+tt.confidence()[1].toFixed(10)).toEqual(-0.3322217752); // upper ci
    expect(tt.valid()).toBe(false);
    expect(+tt.freedom().toFixed(10)).toEqual(57.209217643);
  });
});
