/**
 * "adage.sampleAnnotation" module.
 */

angular.module('adage.sampleAnnotation', [
  'ui.router',
  'ui.bootstrap',
  'ngResource',
  'adage.utils'
])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('sampleAnnotation', {
    url: '/sample_annotation?node&samples',
    views: {
      main: {
        templateUrl: 'sample_annotation/annotation.tpl.html',
        controller: 'SampleAnnotationCtrl as ctrl'
      }
    },
    data: {pageTitle: 'Sample Annotations'}
  });
}])

.factory('Activity', ['$resource', 'ApiBasePath',
  function($resource, ApiBasePath) {
    return $resource(ApiBasePath + 'activity');
  }
])

.factory('Sample', ['$resource', 'ApiBasePath',
  function($resource, ApiBasePath) {
    return $resource(ApiBasePath + 'sample');
  }
])

.controller('SampleAnnotationCtrl', [
  '$stateParams', '$q', '$log', 'errGen', 'Activity', 'Sample',
  function($stateParams, $q, $log, errGen, Activity, Sample) {
    var self = this;
    self.queryStatus = 'Connecting to the server ...';

    // Ensure that the URL includes sample ID(s).
    if (!$stateParams.samples) {
      self.queryStatus = 'Please specify sample ID(s) in the URL.';
      return;
    }

    var samplesInUrl = $stateParams.samples;
    self.uniqueAnnotationTypes = [];
    // Note: Ideally self.uniqueAnnotationTypes should be a hashtable (such as
    // an object of Set) instead of Array, but Set is only available since ES6.

    self.hasNode = false;
    var sampleDict = {};

    // Function that sets valid sample IDs asynchronously:
    var getSampleIDPromise = function() {
      var deferred = $q.defer();
      // If 'node' is found in the URL, get the activity values based on node
      // and sample(s):
      if ($stateParams.node) {
        self.hasNode = true;
        self.activityPrecision = 5;
        var nodeID = $stateParams.node;
        Activity.get(
          {'node': nodeID, 'sample__in': samplesInUrl},  // parameters of GET
          function success(response) {
            var validSamples = [];
            response.objects.forEach(function(element) {
              validSamples.push(element.sample);
              sampleDict[element.sample] = {activity: element.value};
            });
            deferred.resolve(validSamples.join());
          },
          function error(response) {
            var errMessage = errGen('Failed to get activities', response);
            $log.error(errMessage);
            self.queryStatus = errMessage + '. Please try again later.';
            deferred.reject(errMessage);
          }
        );
      } else { // If 'node' is not in the URL, include all input sample IDs.
        deferred.resolve(samplesInUrl);
      }
      return deferred.promise;
    };

    var sidPromise = getSampleIDPromise();
    // The following then() block only includes a success handler function,
    // because the error has been reported by setting self.queryStatus.
    sidPromise.then(function success(validSamples) {
      Sample.get(
        {'id__in': validSamples, 'limit': 0}, // parameters of GET
        function success(response) {
          // If no valid sample records are found, report the error.
          if (!response.objects.length) {
            self.queryStatus = 'Valid samples not found';
            return;
          }
          response.objects.forEach(function(element) {
            if (!self.hasNode) { // If node is not in URL, create the object.
              sampleDict[element.id] = {};
            }
            sampleDict[element.id].name = element.name;
            sampleDict[element.id].annotations = element.annotations;
            var currentTypes = Object.keys(element.annotations);
            currentTypes.forEach(function(annotationType) {
              if (self.uniqueAnnotationTypes.indexOf(annotationType) === -1) {
                self.uniqueAnnotationTypes.push(annotationType);
              }
            });
          });

          // Convert sampleDict from an object literal to an array and save
          // it as self.samples. (It has to be an array so that the order of
          // samples can be customized on web UI with "orderBy" filter.)
          self.samples = [];
          Object.keys(sampleDict).map(function(key) {
            self.samples.push(sampleDict[key]);
          });
          self.uniqueAnnotationTypes.sort(); // Sort the annotation types
          self.queryStatus = '';
        },
        function error(response) {
          var errMessage = errGen('Failed to get sample annotations', response);
          $log.error(errMessage);
          self.queryStatus = errMessage + '. Please try again later.';
        }
      );
    }); // end of sidPromise.then()
  }
]);
