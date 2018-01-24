/*
 * The sampleBin module provides a service for collecting the samples selected
 * for analysis by the user (this would be a shopping cart in an e-commerce
 * web site). It also provides utilities for retrieving additional sample
 * information and activity levels required for drawing the heatmap.
 */
angular.module('adage.analyze.sampleBin', [
  'ngResource',
  'greenelab.stats',
  'adage.utils',
  'adage.sample.service',       // provides Sample
  'adage.signature.resources',  // provides Activity, Signature
  'adage.heatmap.service'
])

.factory('SignatureSet', ['$resource', 'ApiBasePath',
  function($resource, ApiBasePath) {
    return $resource(
      ApiBasePath + 'signature/post_multiple/',
      {},
      {post: {
        method: 'POST',
        headers: {'Content-Type': 'text/plain'}
      }}
    );
  }
])

.factory('SampleBin', ['$log', '$cacheFactory', '$q', 'Sample', 'Activity',
  'Signature', 'SignatureSet', 'MathFuncts', 'errGen', 'MlModelTracker',
  'Heatmap',
function($log, $cacheFactory, $q, Sample, Activity, Signature, SignatureSet,
MathFuncts, errGen, MlModelTracker, Heatmap) {
  var SampleBin = {
    samples: [],  // When refactored, all SampleBin samples will be listed here.
                  // For now, this only holds samples without activity data.
    volcanoData: {
      source: []
    },
    sampleToGroup: {}, // this is a hash from sample id to group name
    signatureCache: $cacheFactory('signature'),

    addSample: function(id) {
      if (Heatmap.vegaData.samples.indexOf(+id) !== -1) {
        // quietly ignore the double-add
        $log.warn('SampleBin.addSample: ' + id +
            ' already in the sample list; ignoring.');
      } else {
        Heatmap.vegaData.samples.push(+id);
        this.sampleToGroup[+id] = 'other';
        // TODO when cache generalized: start pre-fetching sample data here
        Heatmap.vegaData.signatureOrder = [];  // reset to default order
      }
    },

    removeSample: function(id) {
      var pos = Heatmap.vegaData.samples.indexOf(+id);
      if (pos === -1) {
        // this sample must be in the "missing activity" list
        pos = this.samples.indexOf(+id);
        this.samples.splice(pos, 1);
        return;
      }
      Heatmap.vegaData.samples.splice(pos, 1);
      delete this.sampleToGroup[+id];
      Heatmap.vegaData.signatureOrder = [];  // reset to default order
      Heatmap.rebuildHeatmapActivity(
        MlModelTracker.id, Heatmap.vegaData.samples
      );
    },

    clearSamples: function() {
      Heatmap.vegaData.samples = [];
      Heatmap.vegaData.signatureOrder = [];  // reset to default order
      Heatmap.rebuildHeatmapActivity(
        MlModelTracker.id, Heatmap.vegaData.samples
      );
    },

    clearSamplesMissingActivity: function() {
      this.samples = [];
    },

    addExperiment: function(sampleIdList) {
      for (var i = 0; i < sampleIdList.length; i++) {
        this.addSample(sampleIdList[i]);
      }
    },

    addItem: function(searchItem) {
      if (searchItem.itemType === 'sample') {
        this.addSample(searchItem.pk);
      } else if (searchItem.itemType === 'experiment') {
        this.addExperiment(searchItem.relatedItems);
      }
    },

    hasItem: function(searchItem) {
      if (searchItem.itemType === 'sample') {
        if (Heatmap.vegaData.samples.indexOf(+searchItem.pk) !== -1) {
          return true;
        } else {
          return false;
        }
      } else if (searchItem.itemType === 'experiment') {
        // what we want to know, in the case of an experiment, is 'are
        // all of the samples from this experiment already added?'
        for (var i = 0; i < searchItem.relatedItems.length; i++) {
          if (Heatmap.vegaData.samples.indexOf(
              +searchItem.relatedItems[i]) === -1) {
            return false;
          }
        }
        return true;
      }
    },

    length: function() {
      // make it easy to ask how many samples are in the sampleBin
      return Heatmap.vegaData.samples.length;
    },

    getSamplesByGroup: function() {
      var keys = Object.keys(this.sampleToGroup);
      var samplesByGroup = {};
      var i, groupForThisKey;

      // each distinct value in sampleToGroup becomes a key in samplesByGroup,
      // and the keys of sampleToGroup are collected in a list within each
      // corresponding value of samplesByGroup
      for (i = 0; i < keys.length; i++) {
        groupForThisKey = this.sampleToGroup[+keys[i]];
        if (!samplesByGroup[groupForThisKey]) {
          samplesByGroup[groupForThisKey] = [];
        }
        samplesByGroup[groupForThisKey].push(+keys[i]);
      }

      return samplesByGroup;
    },

    getCachedSignature: function(pk) {
      return this.signatureCache.get(pk);
    },
    getSignatureSetPromise: function(pkArr) {
      // Check for any pk already cached, then retrieve what's missing in
      // bulk via the set endpoint on the signature API. Return a promise and
      // supply a callback that populates the cache when the API returns.
      var cbSampleBin = this; // closure link to SampleBin for callbacks
      var defer = $q.defer();
      var cachedSignatureSet = [];

      var uncachedPkArr = pkArr.reduce(function(acc, val) {
        var cachedVal = cbSampleBin.getCachedSignature(val);
        if (!cachedVal) {
          // cache does not have this pk, so keep it in our accumulator
          acc.push(val);
        } else {
          cachedSignatureSet.push(cachedVal);
        }
        return acc;
      }, []);
      if (uncachedPkArr.length === 0) {
        // we've got everything cached already; return before calling the API
        defer.resolve(cachedSignatureSet);
        return defer.promise;
      }
      SignatureSet.post(
        {},
        uncachedPkArr.join(';'),
        function success(responseObject) {
          var i;
          var signatureArr = responseObject.objects;
          for (i = 0; i < signatureArr.length; i++) {
            // populate the cache with what came back
            cbSampleBin.signatureCache.put(signatureArr[i].id, signatureArr[i]);
          }
          defer.resolve(cachedSignatureSet.concat(signatureArr));
        },
        function error(httpResponse) {
          $log.error(errGen('Error retrieving SignatureSet', httpResponse));
          defer.reject(httpResponse);
        }
      );

      return defer.promise;
    },
    getSignaturePromise: function(pk) {
      // Retrieve Signature data for signature id=pk from a cache, if available,
      // returning a promise that is already fulfilled. If signature `pk` is not
      // cached, use the API to get it and add it to the cache.
      var cbSampleBin = this; // closure link to SampleBin for callbacks
      var defer = $q.defer();

      // check the cache first and return what's there, if found
      var cachedSignature = this.getCachedSignature(pk);
      if (cachedSignature) {
        defer.resolve(cachedSignature);
        return defer.promise;
      }

      // we didn't return above, so pk is not in the cache => fetch it
      Signature.get({id: pk},
        function success(responseObject) {
          cbSampleBin.signatureCache.put(pk, responseObject);
          defer.resolve(responseObject);
        },
        function error(httpResponse) {
          // TODO log an error message (see Issue #79)
          $log.error(errGen('Error retrieving Signature', httpResponse));
          defer.reject(httpResponse);
        }
      );
      return defer.promise;
    },

    // volcano plot methods
    getVolcanoPlotData: function() {
      // use sample lists for base-group and comp-group to produce output for
      // the volcano plot of the form:
      //   signature - diff - logsig,
      // where:
      //   signature = the signature name as supplied by Signature
      //   diff = mean(base-group activity values) -
      //          mean(comp-group activity values)
      //   logsig = -log10(p-value from 2-sample t-test on
      //                   base-group vs. comp-group)
      var sg = this.getSamplesByGroup();
      var cbSampleBin = this;

      // verify that we have at least one sample each in base-group
      // and comp-group
      if (!sg['base-group'] || sg['base-group'].length === 0) {
        return null;
      }
      if (!sg['comp-group'] || sg['comp-group'].length === 0) {
        return null;
      }

      // (1a) we obtain a list of signatures by retrieving signature activity
      //      for the first sample in our volcano plot
      var firstSampleSignatures = Heatmap.activityCache.get(sg['base-group'][0])
        .map(function(val) {
          return val.signature;  // extract just the signature IDs
        }
      );
      // (1b) now obtain (and cache) a name for each signature id
      var signatureSetPromise = this.getSignatureSetPromise(
        firstSampleSignatures);
      var mapSignaturesToSignatureInfo = function() {
        // (2a) next, we build an array (replacing `volcanoData.source`)
        //      comprised of `signatureObject`s by walking through the
        //      `firstSampleSignatures` and constructing a `signatureObject` for
        //      each. [outer .map()]
        var signatureSet = firstSampleSignatures.map(
          function(signatureId, index) {
            // build the raw signatureSet
            var mapSampleIdsToActivity = function(sampleId) {
              // (2b) the array of activity for each signature is built by
              //      plucking the activity `.value` for each sample within the
              //      `index`th signature from the `activityCache`
              //      [inner .map()]
              var cachedActivity = Heatmap.activityCache.get(sampleId);
              if (cachedActivity[index].signature !== signatureId) {
                // ensure we're pulling out the right signature
                $log.error(
                  'mapSignaturesToSignatureInfo: signature IDs do not match.' +
                  ' First sample = ' + signatureId + ', but sample ' +
                  sampleId + ' =', cachedActivity[index]
                );
              }
              return cachedActivity[index].value;
            };
            var signatureObject = {
              'id': signatureId,
              'name': cbSampleBin.getCachedSignature(signatureId).name,
              'activityBase': sg['base-group'].map(mapSampleIdsToActivity),
              'activityComp': sg['comp-group'].map(mapSampleIdsToActivity)
            };
            signatureObject.diff = (
              MathFuncts.mean(signatureObject.activityBase) -
              MathFuncts.mean(signatureObject.activityComp)
            );
            signatureObject.rawPValue = MathFuncts.tTest(
              signatureObject.activityBase, signatureObject.activityComp
            ).pValue();

            return signatureObject;
          }
        );

        // use FDR on the raw p-values from signatureSet to get adjustedPValues
        var rawPValues = signatureSet.map(
          function getRawPValue(signatureObject) {
            return signatureObject.rawPValue;
          }
        );
        var adjustedPValues = MathFuncts.multTest.fdr(rawPValues);

        // compute logsig from the adjustedPValues & update the signatureSet
        signatureSet.forEach(function(signatureObject, i) {
          signatureObject.logsig = -Math.log10(adjustedPValues[i]);
        });
        cbSampleBin.volcanoData.source = signatureSet;
        // no return needed here: we've updated `cbSampleBin.volcanoData`
      };
      // invoke mapSignaturesToSignatureInfo only after signatureSetPromise is
      // fulfilled
      signatureSetPromise
        .then(mapSignaturesToSignatureInfo)
        .catch(function(httpResponse) {
          $log.error(errGen('Query errored', httpResponse));
        });
    }
  };

  return SampleBin;
}])

.controller('SampleBinCtrl', [
  '$scope', 'SampleBin', 'MlModelTracker', 'Heatmap',
  function SampleBinCtrl($scope, SampleBin, MlModelTracker, Heatmap) {
    // give templates a way to access the SampleBin & MlModelTracker services
    $scope.sb = SampleBin;
    // TODO #278 split Heatmap service samples from sampleBin samples
    $scope.heatmap = Heatmap;
    $scope.modelInfo = MlModelTracker;
  }
])

.directive('sampleBin', function() {
  return {
    replace: true,
    restrict: 'E',
    // scope: {},
    templateUrl: 'analyze/analysis/sampleBin.tpl.html',
    controller: 'SampleBinCtrl'
  };
})

;
