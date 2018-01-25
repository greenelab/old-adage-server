angular.module('adage.heatmap.service', [
  'adage.sample.service',
  'adage.activity.service',
  'adage.utils'
])

.factory('Heatmap', ['$log', '$cacheFactory', '$q', 'Sample', 'Activity',
  function($log, $cacheFactory, $q, Sample, Activity) {
    var Heatmap = {
      vegaData: {
        samples: [],  // only samples with activity data can be in the heatmap
        signatureOrder: []
      },

      getActivityForSampleList: function(mlModelId, samples) {
        // retrieve activity data for heatmap to display
        if (!mlModelId) {
          $log.warn('getActivityForSampleList called before setting mlmodel');
          return;
        }
        // FIXME restore query progress messages (see rebuildHeatmapActivity)
        //  note: progress can be reported by returning a $promise to the caller
        // respObj.queryStatus = 'Retrieving sample activity...';
        this.rebuildHeatmapActivity(mlModelId, samples);
      },

      getSampleObjects: function() {
        // reformat data from vegaData.activity to a form that can be used
        // by hcluster.js: need a separate array of objects for each sample
        return this.vegaData.samples.map(function(val) {
          var sampleObject = Sample.getSampleData(val);
          if (!sampleObject) {
            // we haven't yet loaded full sample data so yield a stubby version
            return {id: val};
          }
          sampleObject.activity = Activity.cache.get(val).map(
            // distill .activity to an array of just "value"s
            function(val) {
              return val.value;
            }
          );
          return sampleObject;
        }, this);
      },
      getSignatureObjects: function() {
        // The vegaData.activity array organizes activity data in a
        // representation convenient to render using vega.js: each element of
        // the array corresponds to one mark on the heatmap. For clustering by
        // hcluster.js, on the other hand, we need to reorganize the data so
        // that all activity for each *signature* is collected in an array. The
        // result is essentially the same as that from `getSampleObjects`
        // above, but transposed. We achieve this without too many intermediate
        // steps via two nested Array.prototype.map() operations:

        // (1) first, we obtain a list of signatures by retrieving signature
        //     activity for the first sample in our heatmap
        var firstSampleSignatures = Activity.cache.get(
          this.vegaData.samples[0]
        );
        // (2a) next, we build a new array (`retval`) comprised of
        //      `signatureObject`s by walking through the
        //      `firstSampleSignatures` and constructing a `signatureObject`
        //      for each. [outer .map()]
        var retval = firstSampleSignatures.map(function(val, index) {
          var signatureObject = {
            'id': val.signature,
            'activity': Heatmap.vegaData.samples.map(
              // (2b) the array of activity for each signature is built by
              //      plucking the activity `.value` for each sample within the
              //      `index`th signature from `Activity.cache` [inner .map()]
              function(sampleId) {
                var cachedActivity = Activity.cache.get(sampleId);
                if (cachedActivity[index].signature !== val.signature) {
                  // ensure we're pulling out the right signature
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

      logError: function(httpResponse) {
        $log.error(errGen('Query errored', httpResponse));
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
        var loadCache = function(responseObject) {
          if (responseObject && responseObject.objects.length > 0) {
            var sampleID = responseObject.objects[0].sample;
            Activity.cache.put(sampleID, responseObject.objects);
            $log.info('populating cache with ' + sampleID);
          }
          // Note: no else clause here on purpose.
          // An empty responseObject means no activity data for this sample.
          // We detect this error and handle it in updateHeatmapActivity.
        };
        var updateHeatmapActivity = function(activityPromisesFulfilled) {
          // when all promises are fulfilled, we can update vegaData
          var newActivity = [];
          var excludeSamples = [];

          for (var i = 0; i < samples.length; i++) {
            var sampleActivity = Activity.cache.get(samples[i]);
            if (sampleActivity === undefined) {
              // this sample has no activity data, so move it out of the heatmap
              $log.error(
                'updateHeatmapActivity: no activity for sample id', samples[i]
              );
              excludeSamples.push(samples[i]);
            } else {
              newActivity = newActivity.concat(sampleActivity);
              // re-initialize signatureOrder, if needed
              if (Heatmap.vegaData.signatureOrder.length === 0) {
                Heatmap.vegaData.signatureOrder = sampleActivity.map(
                  function(val) {
                    return val.signature;
                  }
                );
              }
            }
          }
          excludeSamples.forEach(function(id) {
            // remove from the heatmap
            pos = Heatmap.vegaData.samples.indexOf(id);
            Heatmap.vegaData.samples.splice(pos, 1);

            // TODO #278 Heatmap cannot modify SampleBin - check for regression
            // delete cbSampleBin.sampleToGroup[id];
            // // add to the non-heatmap list if not already present
            // if (cbSampleBin.samples.indexOf(id) === -1) {
            //   cbSampleBin.samples.push(id);
            // }
          });
          Heatmap.vegaData.activity = newActivity;
        };

        // preflight the cache and request anything missing
        var activityPromises = [];
        for (var i = 0; i < samples.length; i++) {
          var sampleActivity = Activity.cache.get(samples[i]);
          if (!sampleActivity) {
            $log.info('cache miss for ' + samples[i]);
            // cache miss, so populate the entry
            var p = Activity.get({
              'mlmodel': mlmodel,
              'sample': samples[i],
              'order_by': 'signature'
            }).$promise;
            activityPromises.push(p);
            p.then(loadCache).catch(this.logError);
          }
        }
        // when the cache is ready, update the heatmap activity data
        $q.all(activityPromises)
          .then(updateHeatmapActivity)
          .catch(this.logError);
      },

      _getIDs: function(val) {
        return val.id;
      },
      clusterSamples: function() {
        // TODO implement non-blocking response here as done for
        // clusterSignatures()
        var sampleClust = hcluster()
          .distance('euclidean')
          .linkage('avg')
          .posKey('activity')
          .data(this.getSampleObjects());
        this.vegaData.samples = sampleClust.orderedNodes().map(
          this._getIDs);
      },
      clusterSignatures: function() {
        // declare some closure variables our callbacks will need
        var defer = $q.defer();

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
            .data(Heatmap.getSignatureObjects());
          // update the heatmap
          Heatmap.vegaData.signatureOrder =
            signatureClust.orderedNodes().map(Heatmap._getIDs);
        });
      }
    };
    return Heatmap;
  }
])

;
