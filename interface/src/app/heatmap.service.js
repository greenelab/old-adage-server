angular.module('adage.heatmap.service', [
  'adage.signature.resources',   // provides Activity, Signature
  'adage.utils'
])

.factory('Heatmap', ['$log', '$cacheFactory', '$q', 'Activity',
  function($log, $cacheFactory, $q, Activity) {
    var Heatmap = {
      vegaData: {
        samples: [],  // only samples with activity data can be in the heatmap
        signatureOrder: []
      },
      activityCache: $cacheFactory('activity'),

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
        // var cbSampleBin = this; // closure link to SampleBin for callbacks
        var cbHeatmap = this;   // closure link to Heatmap for callbacks
        var loadCache = function(responseObject) {
          if (responseObject && responseObject.objects.length > 0) {
            var sampleID = responseObject.objects[0].sample;
            cbHeatmap.activityCache.put(sampleID, responseObject.objects);
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
            var sampleActivity = cbHeatmap.activityCache.get(samples[i]);
            if (sampleActivity === undefined) {
              // this sample has no activity data, so move it out of the heatmap
              $log.error(
                'updateHeatmapActivity: no activity for sample id', samples[i]
              );
              excludeSamples.push(samples[i]);
            } else {
              newActivity = newActivity.concat(sampleActivity);
              // re-initialize signatureOrder, if needed
              if (cbHeatmap.vegaData.signatureOrder.length === 0) {
                cbHeatmap.vegaData.signatureOrder = sampleActivity.map(
                  function(val) {
                    return val.signature;
                  }
                );
              }
            }
          }
          excludeSamples.forEach(function(id) {
            // remove from the heatmap
            pos = cbHeatmap.vegaData.samples.indexOf(id);
            cbHeatmap.vegaData.samples.splice(pos, 1);

            // TODO #278 Heatmap cannot modify SampleBin - check for regression
            // delete cbSampleBin.sampleToGroup[id];
            // // add to the non-heatmap list if not already present
            // if (cbSampleBin.samples.indexOf(id) === -1) {
            //   cbSampleBin.samples.push(id);
            // }
          });
          cbHeatmap.vegaData.activity = newActivity;
        };

        // preflight the cache and request anything missing
        var activityPromises = [];
        for (var i = 0; i < samples.length; i++) {
          var sampleActivity = cbHeatmap.activityCache.get(samples[i]);
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
      }
    };
    return Heatmap;
  }
])

;
