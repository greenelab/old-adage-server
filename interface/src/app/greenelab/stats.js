angular.module('greenelab.stats', [

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
      // The 'n' and 'k' arguments are the same as the 'n' and 'k'
      // arguments for the hyperGeometricTest function below (the number
      // of items in the sample and the number of successes in the sample,
      // respectively).
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
      //
      // The names of these variables are chosen based partly on the variable
      // names in the /integrator/static/js/imp.js script mentioned above,
      // but are also common in online descriptions of the hypergeometric test.
      // See: https://en.wikipedia.org/wiki/Hypergeometric_distribution#Application_and_example
      var sum = 0;
      for (var i = 0; i < k; i++) {
        var logSum = this.binomLog(m, i) +
            this.binomLog(N - m, n - i) - this.binomLog(N, n);
        sum += Math.exp(logSum);
      }
      return sum;
    },

    /*
     * This tTest function simply exposes the ttest library we have repackaged
     * from npm: https://www.npmjs.com/package/ttest .
     * Source is at: https://github.com/AndreasMadsen/ttest .
     */
    tTest: ttest,

    /*
     * Similarly, the multTest function exposes the multtest library we have
     * repackaged from npm: https://www.npmjs.com/package/multtest .
     * Source is at: https://github.com/Planeshifter/multtest .
     */
    multTest: multtest,

    mean: function(arr) {
      // TODO: the ttest library above embeds a Summary library that can
      //       compute means and we should use that (have to figure out how to
      //       expose it and ttest without too much redundant packaging)

      // don't do a divide by 0...
      if (arr.length === 0) {
        return 0;
      }
      // compute the mean of the elements in arr
      var sum = arr.reduce(function(acc, val) {
        return acc + val;
      }, 0);

      return sum / arr.length;
    }

  };
}])

;
