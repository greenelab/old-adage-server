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
  'adage.analyze.sample',
  'adage.signature.resources'
])

.factory('SignatureSet', ['$resource', 'ApiBasePath',
  function($resource, ApiBasePath) {
    return $resource(ApiBasePath + 'node/set/:ids/');
  }
])

.factory('SampleBin', ['$log', '$cacheFactory', '$q', 'Sample', 'Activity',
  'Signature', 'SignatureSet', 'MathFuncts', 'errGen',
function($log, $cacheFactory, $q, Sample, Activity, Signature, SignatureSet,
MathFuncts, errGen) {
  var SampleBin = {
    selectedMlModel: {
      id: null
    },
    heatmapData: {
      samples: [],
      signatureOrder: []
    },
    volcanoData: {
      source: []
    },
    sampleToGroup: {}, // this is a hash from sample id to group name
    sampleData: {},
    sampleCache: $cacheFactory('sample'),
    activityCache: $cacheFactory('activity'),
    signatureCache: $cacheFactory('signature'),

    addSample: function(id) {
      if (this.heatmapData.samples.indexOf(+id) !== -1) {
        // quietly ignore the double-add
        $log.warn('SampleBin.addSample: ' + id +
            ' already in the sample list; ignoring.');
      } else {
        this.heatmapData.samples.push(+id);
        this.sampleToGroup[+id] = 'other';
        // TODO when cache generalized: start pre-fetching sample data here
        this.heatmapData.signatureOrder = [];  // reset to default order
      }
    },

    removeSample: function(id) {
      var pos = this.heatmapData.samples.indexOf(+id);
      this.heatmapData.samples.splice(pos, 1);
      delete this.sampleToGroup[+id];
      this.heatmapData.signatureOrder = [];  // reset to default order
      this.rebuildHeatmapActivity(
        this.selectedMlModel.id, this.heatmapData.samples
      );
    },

    addExperiment: function(sampleIdList) {
      for (var i = 0; i < sampleIdList.length; i++) {
        this.addSample(sampleIdList[i]);
      }
    },

    addItem: function(searchItem) {
      if (searchItem.item_type === 'sample') {
        this.addSample(searchItem.pk);
      } else if (searchItem.item_type === 'experiment') {
        this.addExperiment(searchItem.related_items);
      }
    },

    hasItem: function(searchItem) {
      if (searchItem.item_type === 'sample') {
        if (this.heatmapData.samples.indexOf(+searchItem.pk) !== -1) {
          return true;
        } else {
          return false;
        }
      } else if (searchItem.item_type === 'experiment') {
        // what we want to know, in the case of an experiment, is 'are
        // all of the samples from this experiment already added?'
        for (var i = 0; i < searchItem.related_items.length; i++) {
          if (this.heatmapData.samples.indexOf(
              +searchItem.related_items[i]) === -1) {
            return false;
          }
        }
        return true;
      }
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

    getSampleData: function(id) {
      var sampleObj = this.sampleData[id];
      sampleObj.activity = this.activityCache.get(id).map(
        // distill .activity to an array of just "value"s
        function(val) {
          return val.value;
        }
      );
      return sampleObj;
    },
    setSampleData: function(id, obj) {
      this.sampleData[id] = obj;
      // TODO need to pre-fetch activity into cache here?
      //      (if so, also need to track promises)
    },

    getSampleObjects: function() {
      // reformat data from heatmapData.activity to a form that can be used
      // by hcluster.js: need a separate array of objects for each sample
      return this.heatmapData.samples.map(function(val) {
        return this.getSampleData(val) || {id: val};
      }, this);
    },
    getSignatureObjects: function() {
      // The heatmapData.activity array organizes activity data in a
      // representation convenient to render using vega.js: each element of the
      // array corresponds to one mark on the heatmap. For clustering by
      // hcluster.js, on the other hand, we need to reorganize the data so that
      // all activity for each *signature* is collected in an array. The result
      // is essentially the same as that from `getSampleObjects` above, but
      // transposed. We achieve this without too many intermediate steps via
      // two nested Array.prototype.map() operations:

      // (1) first, we obtain a list of signatures by retrieving signature
      //     activity for the first sample in our heatmap
      var firstSampleSignatures = this.activityCache.get(
        this.heatmapData.samples[0]
      );
      // (2a) next, we build a new array (`retval`) comprised of
      //      `signatureObject`s by walking through the `firstSampleSignatures`
      //      and constructing a `signatureObject` for each. [outer .map()]
      var retval = firstSampleSignatures.map(function(val, index) {
        var signatureObject = {
          'id': val.node,
          'activity': this.heatmapData.samples.map(
            // (2b) the array of activity for each signature is built by
            //      plucking the activity `.value` for each sample within the
            //      `index`th signature from the `activityCache` [inner .map()]
            function(sampleId) {
              var cachedActivity = this.activityCache.get(sampleId);
              if (cachedActivity[index].node !== val.node) {
                // ensure we're pulling out the right node (aka signature)
                $log.error(
                  'getSignatureObjects: signature IDs do not match. First ' +
                  ' sample = ', val, ', but sample ' + sampleId + ' =',
                  cachedActivity[index]
                );
              }
              return cachedActivity[index].value;
            },
            this
          )
        };
        return signatureObject;
      }, this);

      // (3) the two nested .map()s are all we need to do to organize the
      //     data for the convenience of hcluster.js, so we're done
      return retval;
    },

    getSampleDetails: function(pk) {
      // TODO caller can now implement user error reporting via $promise
      var cbSampleBin = this; // closure link to SampleBin for callbacks
      var pSample = Sample.get({id: pk},
        function success(responseObject, responseHeaders) {
          if (responseObject) {
            cbSampleBin.setSampleData(pk, responseObject);
          } else {
            $log.warn('Query for sample ' + pk + ' returned nothing.');
            // TODO user error reporting
          }
        },
        function error(responseObject, responseHeaders) {
          $log.error($scope.analysis.queryStatus);
        }
      ).$promise;
      return pSample;
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
      SignatureSet.get(
        {ids: uncachedPkArr.join(';')},
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

    _getIDs: function(val) {
      return val.id;
    },
    logError: function(httpResponse) {
      $log.error(errGen('Query errored', httpResponse));
    },
    clusterSamples: function() {
      // TODO implement non-blocking response here as done for
      // clusterSignatures()
      var sampleClust = hcluster()
        .distance('euclidean')
        .linkage('avg')
        .posKey('activity')
        .data(this.getSampleObjects());
      this.heatmapData.samples = sampleClust.orderedNodes().map(
        this._getIDs);
    },
    clusterSignatures: function() {
      // declare some closure variables our callbacks will need
      var cbSampleBin = this,
        defer = $q.defer();

      setTimeout(function() {
        // We'd like the clustering code to run asynchronously so our caller
        // can display a status update and then remove it when finished.
        // setTimeout(fn, 0) is a trick for triggering this behavior
        defer.resolve(true);  // triggers the cascade of .then() calls below
      }, 0);

      return defer.promise.then(function() {
        // do the actual clustering (in the .data call here)
        var signatureClust = hcluster()
          .distance('euclidean')
          .linkage('avg')
          .posKey('activity')
          .data(cbSampleBin.getSignatureObjects());
        // update the heatmap
        cbSampleBin.heatmapData.signatureOrder =
          signatureClust.orderedNodes().map(cbSampleBin._getIDs);
      });
    },

    rebuildHeatmapActivity: function(mlmodel, samples) {
      // FIXME need a "reloading..." spinner or something while this happens
      //  note: progress can be reported by returning a $promise to the caller
      if (!mlmodel) {
        // ignore "rebuild" requests until a model is specified
        $log.info(
          'rebuildHeatmapActivity: skipping because mlmodel=', mlmodel
        );
        return;
      }
      var cbSampleBin = this; // closure link to SampleBin for callbacks
      var loadCache = function(responseObject) {
        if (responseObject) {
          var sampleID = responseObject.objects[0].sample;
          cbSampleBin.activityCache.put(sampleID, responseObject.objects);
          $log.info('populating cache with ' + sampleID);
          // TODO need to find & report samples that return no results
        } else {
          // FIXME what happens if responseObject is empty? (possible?)
          $log.error('responseObject is empty: what now?');
        }
      };
      var updateHeatmapActivity = function(activityPromisesFulfilled) {
        // when all promises are fulfilled, we can update heatmapData
        var newActivity = [];

        for (var i = 0; i < samples.length; i++) {
          var sampleActivity = cbSampleBin.activityCache.get(samples[i]);
          newActivity = newActivity.concat(sampleActivity);
          // re-initialize signatureOrder, if needed
          if (i === 0 && cbSampleBin.heatmapData.signatureOrder.length === 0) {
            cbSampleBin.heatmapData.signatureOrder = sampleActivity.map(
              function(val) {
                return val.node;
              }
            );
          }
        }
        cbSampleBin.heatmapData.activity = newActivity;
      };

      // preflight the cache and request anything missing
      var activityPromises = [];
      for (var i = 0; i < samples.length; i++) {
        var sampleActivity = this.activityCache.get(samples[i]);
        if (!sampleActivity) {
          $log.info('cache miss for ' + samples[i]);
          // cache miss, so populate the entry
          var p = Activity.get({
            'mlmodel': mlmodel,
            'sample': samples[i],
            'order_by': 'node'
          }).$promise;
          activityPromises.push(p);
          p.then(loadCache).catch(this.logError);
        }
      }
      // when the cache is ready, update the heatmap activity data
      $q.all(activityPromises).then(updateHeatmapActivity).catch(this.logError);
    },

    getActivityForSampleList: function(mlModelId) {
      // retrieve activity data for heatmap to display
      if (!mlModelId && !this.selectedMlModel.id) {
        $log.warn('getActivityForSampleList called before setting mlmodel');
        return;
      }
      if (!mlModelId) {
        // default to the current selectedMlModel
        mlModelId = this.selectedMlModel.id;
      }
      // FIXME restore query progress messages (see rebuildHeatmapActivity)
      //  note: progress can be reported by returning a $promise to the caller
      // respObj.queryStatus = 'Retrieving sample activity...';
      this.rebuildHeatmapActivity(mlModelId, this.heatmapData.samples);
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
      var firstSampleSignatures = this.activityCache.get(sg['base-group'][0])
        .map(function(val) {
          return val.node;  // extract just the signature IDs
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
              var cachedActivity = cbSampleBin.activityCache.get(sampleId);
              if (cachedActivity[index].node !== signatureId) {
                // ensure we're pulling out the right node
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
        .catch(this.logError);
    }
  };

  return SampleBin;
}])

.controller('SampleBinCtrl', ['$scope', 'SampleBin', 'GlobalModelInfo',
  function SampleBinCtrl($scope, SampleBin, GlobalModelInfo) {
    // give our templates a way to access the SampleBin service
    $scope.sb = SampleBin;
    $scope.modelInfo = GlobalModelInfo;
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
