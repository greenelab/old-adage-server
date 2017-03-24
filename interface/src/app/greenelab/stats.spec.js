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
      expect(+(1 - MathFuncts.hyperGeometricTest(1, 5, 10, 50)))
      .toBeCloseTo(0.689437218, 10);

      expect(+(1 - MathFuncts.hyperGeometricTest(2, 5, 10, 50)))
      .toBeCloseTo(0.2581000208, 10);

      expect(+(1 - MathFuncts.hyperGeometricTest(3, 5, 10, 50)))
      .toBeCloseTo(0.0482603032, 10);

      expect(+(1 - MathFuncts.hyperGeometricTest(4, 5, 10, 50)))
      .toBeCloseTo(0.0040835205, 10);

      expect(+(1 - MathFuncts.hyperGeometricTest(5, 5, 10, 50)))
      .toBeCloseTo(0.0001189375, 10);
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
    expect(+tt.testValue()).toBeCloseTo(-1.8608134675, 10);
    expect(+tt.pValue()).toBeCloseTo(0.0793941404, 10);
    expect(+tt.confidence()[0]).toBeCloseTo(-3.3654832104, 10); // lower ci
    expect(+tt.confidence()[1]).toBeCloseTo(0.2054832104, 10); // upper ci
    expect(tt.valid()).toBe(true);
    expect(+tt.freedom()).toBeCloseTo(17.7764735162, 10);

    // Compare with R's output from:
    // tt <- t.test(c(0.5361161, 0.3878819, -0.2688780, -0.3422277, 2.4233964),
    // c(-1.9037639, -2.1121372, 1.9007528, 0.2987301, -1.0119501))
    tt = MathFuncts.tTest(
      [0.5361161, 0.3878819, -0.2688780, -0.3422277, 2.4233964],
      [-1.9037639, -2.1121372, 1.9007528, 0.2987301, -1.0119501]
    );
    expect(+tt.testValue()).toBeCloseTo(1.2360437329, 10);
    expect(+tt.pValue()).toBeCloseTo(0.2564335358, 10);
    expect(+tt.confidence()[0]).toBeCloseTo(-1.0175996584, 10); // lower ci
    expect(+tt.confidence()[1]).toBeCloseTo(3.2434624584, 10); // upper ci
    expect(tt.valid()).toBe(true);
    expect(+tt.freedom()).toBeCloseTo(6.9769307501, 10);

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
    expect(+tt.testValue()).toBeCloseTo(-3.3209761128, 10);
    expect(+tt.pValue()).toBeCloseTo(0.0015663897, 10);
    expect(+tt.confidence()[0]).toBeCloseTo(-1.3411325516, 10); // lower ci
    expect(+tt.confidence()[1]).toBeCloseTo(-0.3322217752, 10); // upper ci
    expect(tt.valid()).toBe(false);
    expect(+tt.freedom()).toBeCloseTo(57.209217643, 10);
  });
});


describe('multTest in stats.js', function() {
  beforeEach(module('greenelab.stats'));

  var MathFuncts;

  beforeEach(inject(function(_MathFuncts_) {
    MathFuncts = _MathFuncts_;
  }));

  it('should be defined', function() {
    expect(MathFuncts).toBeDefined();
    expect(MathFuncts).toBeTruthy();
  });

  // These tests compare results from multTest against results obtained from
  // R's p.adjust()
  // https://stat.ethz.ch/R-manual/R-devel/library/stats/html/p.adjust.html
  it('should produce correct results for several examples', function() {
    var correctedPValues;

    // Compare with R's output from:
    // p.adjust(c(0.689437218, 0.2581000208, 0.0482603032, 0.0040835205,
    // 0.0001189375), "fdr"). These decimal values were copied from the unit
    // test for the hypergeometric test above.
    correctedPValues = MathFuncts.multTest.fdr(
      [0.689437218, 0.2581000208, 0.0482603032, 0.0040835205, 0.0001189375]
    );

    correctedPValues = correctedPValues.map(function(pVal) {
      return +pVal.toFixed(10);
    });

    expect(correctedPValues).toEqual([
      0.6894372180, 0.3226250260, 0.0804338387, 0.0102088012, 0.0005946875
    ]);

    // Compare with R's output from:
    // p.adjust(c(0.687533670, 0.642542072, 0.746982625, 0.351400416,
    // 0.209067772, 0.924265458, 0.078444365, 0.349900649, 0.024239171,
    // 0.422568906, 0.069993721, 0.988193924, 0.677302087, 0.003492205,
    // 0.304922004, 0.969691329, 0.028714709, 0.235149190, 0.563318240,
    // 0.704495695), "fdr")
    // These random decimal values were obtained by running
    // runif(20, min=0, max=1) in R.
    correctedPValues = MathFuncts.multTest.fdr([
      0.687533670, 0.642542072, 0.746982625, 0.351400416, 0.209067772,
      0.924265458, 0.078444365, 0.349900649, 0.024239171, 0.422568906,
      0.069993721, 0.988193924, 0.677302087, 0.003492205, 0.304922004,
      0.969691329, 0.028714709, 0.235149190, 0.563318240, 0.704495695
    ]);

    correctedPValues = correctedPValues.map(function(pVal) {
      return +pVal.toFixed(7);
    });

    expect(correctedPValues).toEqual([
      0.8788031, 0.8788031, 0.8788031, 0.7028008, 0.6718548, 0.9881939,
      0.3137775, 0.7028008, 0.1914314, 0.7683071, 0.3137775, 0.9881939,
      0.8788031, 0.0698441, 0.7028008, 0.9881939, 0.1914314, 0.6718548,
      0.8788031, 0.8788031
    ]);

    // Compare with R's output from:
    // p.adjust(c(0.50737464, 0.19491067, 0.70651521, 0.18409645, 0.12852020,
    // 0.99336303, 0.05110014, 0.54454504, 0.27567967, 0.96049284, 0.76375006,
    // 0.95913694, 0.58669825, 0.64423308, 0.08539208, 0.69688756, 0.14988072,
    // 0.04168663, 0.35820879, 0.20795287, 0.60731184, 0.40967885, 0.57542731,
    // 0.13704495, 0.01209222, 0.51657558, 0.45194966, 0.65708676, 0.95112352,
    // 0.28213190, 0.51589586, 0.64646605, 0.21931969, 0.35188851, 0.94193562,
    // 0.61266120, 0.38419469, 0.74500034, 0.65281975, 0.02519793), "fdr").
    // These random decimal values were obtained by running
    // runif(40, min=0, max=1) in R.
    correctedPValues = MathFuncts.multTest.fdr(
      [0.50737464, 0.19491067, 0.70651521, 0.18409645, 0.12852020, 0.99336303,
       0.05110014, 0.54454504, 0.27567967, 0.96049284, 0.76375006, 0.95913694,
       0.58669825, 0.64423308, 0.08539208, 0.69688756, 0.14988072, 0.04168663,
       0.35820879, 0.20795287, 0.60731184, 0.40967885, 0.57542731, 0.13704495,
       0.01209222, 0.51657558, 0.45194966, 0.65708676, 0.95112352, 0.28213190,
       0.51589586, 0.64646605, 0.21931969, 0.35188851, 0.94193562, 0.61266120,
       0.38419469, 0.74500034, 0.65281975, 0.02519793]
    );

    correctedPValues = correctedPValues.map(function(pVal) {
      return +pVal.toFixed(7);
    });

    expect(correctedPValues).toEqual([
      0.8478539, 0.7310656, 0.8563821, 0.7310656, 0.7310656, 0.9933630,
      0.5110014, 0.8478539, 0.8060911, 0.9851209, 0.8728572, 0.9851209,
      0.8478539, 0.8478539, 0.6831366, 0.8563821, 0.7310656, 0.5110014,
      0.8478539, 0.7310656, 0.8478539, 0.8478539, 0.8478539, 0.7310656,
      0.4836888, 0.8478539, 0.8478539, 0.8478539, 0.9851209, 0.8060911,
      0.8478539, 0.8478539, 0.7310656, 0.8478539, 0.9851209, 0.8478539,
      0.8478539, 0.8728572, 0.8478539, 0.5039586
    ]);
  });
});
