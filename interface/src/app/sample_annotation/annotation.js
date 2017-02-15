/**
 * "adage.sampleAnnotation" module.
 */

angular.module('adage.sampleAnnotation', [
  'ui.router',
  'ui.bootstrap',
  'greenelab.utils'
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

.controller('SampleAnnotationCtrl', [
  '$stateParams', '$q', '$http', '$log', 'ApiBasePath', 'errGen',
  function($stateParams, $q, $http, $log, ApiBasePath, errGen) {
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
      // If 'node' is specified in the URL, query the node first:
      if ($stateParams.node) {
        self.hasNode = true;
        var nodeID = $stateParams.node;
        var activityApiConfig = {
          params: {'node': nodeID, 'sample__in': samplesInUrl}
        };
        $http.get(ApiBasePath + 'activity/', activityApiConfig)
          .then(function success(response) {
            var validSamples = [];
            response.data.objects.forEach(function(element) {
              validSamples.push(element.sample);
              sampleDict[element.sample] = {activity: element.value};
            });
            deferred.resolve(validSamples.join());
          }, function error(response) {
            var errMessage = errGen('Failed to get activities', response);
            $log.error(errMessage);
            self.queryStatus = errMessage + '. Please try again later.';
            deferred.reject();
          });
      } else { // If 'node' is not in the URL, include all input sample IDs.
        deferred.resolve(samplesInUrl);
      }
      return deferred.promise;
    };

    var sidPromise = getSampleIDPromise();
    // The first then() block only includes a success handler function, because
    // the error has been notified to the frontend by setting self.queryStatus.
    sidPromise.then(function success(validSamples) {
      var sampleApiConfig = {
        params: {'id__in': validSamples, 'limit': 0}
      };
      return $http.get(ApiBasePath + 'sample/', sampleApiConfig);
    }).then(function success(response) {
      // If no valid sample records are found, report the error.
      if (!response.data.objects.length) {
        self.queryStatus = 'Valid samples not found';
        return;
      }
      response.data.objects.forEach(function(element) {
        if (!self.hasNode) { // If node is not in URL, create the object first
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

      // Convert sampleDict from an object literal to an array and save it as
      // self.samples. (It has to be an array so that samples can be shown on
      // web UI using "orderBy" filter in Angular.
      self.samples = [];
      Object.keys(sampleDict).map(function(key) {
        self.samples.push(sampleDict[key]);
      });
      self.queryStatus = '';
    }, function error(response) {
      var errMessage = errGen('Failed to get sample annotations', response);
      $log.error(errMessage);
      self.queryStatus = errMessage + '. Please try again later.';
    }); // end of sidPromise.then().then() chaining

    self.uniqueAnnotationTypes.sort(); // Sort the annotation types
  }
]);
