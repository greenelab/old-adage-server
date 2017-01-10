angular.module('adage.utils', [

])

.factory('MathFuncts', [function() {
  return {
    /*
     * The binomLog and hyperGeometricTest functions are based heavily on the
     * 'binomlog' and 'hyperg' functions in /integrator/static/js/imp.js
     * See code here:
     * https://bitbucket.org/cgreene/integrator/src/1194f7ae1b11057a4649114e1f55570542acbcde/integrator/static/js/imp.js?at=giant&fileviewer=file-view-default
    */
    binomLog: function(n, k) {
      var coeff = 0;
      for (var i = n - k + 1; i <= n; i++) {
        coeff += Math.log(i);
      }
      for (i = 1; i <= k; i++) {
        coeff -= Math.log(i);
      }
      return coeff;
    },

    hyperGeometricTest: function(k, m, n, N) {
      // k is the number of successes in the sample
      // m is the number of successes in the population
      // n is the number of items in the sample
      // N is the number of items in the population
      var sum = 0;
      for (var i = 0; i < k; i++) {
        var logSum = this.binomLog(m, i) +
            this.binomLog(N - m, n - i) - this.binomLog(N, n);
        sum += Math.exp(logSum);
      }
      return sum;
    }

  };
}])

;
