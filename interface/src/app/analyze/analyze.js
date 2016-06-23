angular.module( 'adage.analyze', [
  'ui.router',
  'placeholders',
  'ui.bootstrap',
  'as.sortable',
  'ngAnimate',
  'ngResource',
  'ngSanitize'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'analyze', {
    url: '/analyze',
    views: {
      "main": {
        controller: 'AnalyzeCtrl',
        templateUrl: 'analyze/analyze.tpl.html'
      }
    },
    data:{ pageTitle: 'Analyze' }
  });
})
.config(['$resourceProvider', function($resourceProvider) {
  // Don't strip trailing slashes from calculated URLs
  $resourceProvider.defaults.stripTrailingSlashes = false;
}])

.factory( 'Search', ['$resource', '$http', function($resource, $http) {
  return $resource(
    '/api/v0/search/',
    // TODO need to add logic for handling pagination of results.
    // then, can change "limit" below to something sensible
    { q: '', limit: 0 },
    // Angular expects a query service to give only a list but our Tastypie
    // interface wraps the response list with pagination so we tell Angular to
    // expect an object instead via isArray: false
    { 'query': { method: 'GET', isArray: false } }
  );
}])
.factory( 'Sample', ['$resource', '$http', function($resource, $http) {
  return $resource(
    '/api/v0/sample/:id/',
    // TODO need to add logic for handling pagination of results.
    // then, can change "limit" below to something sensible
    { id: '@id', limit: 0 },
    // Angular expects a query service to give only a list but our Tastypie
    // interface wraps the response list with pagination so we tell Angular to
    // expect an object instead via isArray: false
    { 'get': { method: 'GET', isArray: false } }
  );
}])
.factory( 'Experiment', ['$resource', '$http', function($resource, $http) {
  return $resource(
    '/api/v0/experiment/:accession/',
    // TODO need to add logic for handling pagination of results.
    // then, can change "limit" below to something sensible
    { accession: '@accession', limit: 0 },
    // Angular expects a query service to give only a list but our Tastypie
    // interface wraps the response list with pagination so we tell Angular to
    // expect an object instead via isArray: false
    { 'get': { method: 'GET', isArray: false } }
  );
}])
.run(['$anchorScroll', function($anchorScroll) {
  $anchorScroll.yOffset = 80;
}])
.controller( 'AnalyzeCtrl', ['$scope', '$uibModal', '$log', '$state',
  '$location', '$anchorScroll', '$timeout', 'Search', 'Sample', 'Experiment',
  function AnalyzeCtrl( $scope, $uibModal, $log, $state, $location,
    $anchorScroll, $timeout, Search, Sample, Experiment ) {
  $scope.query = {
    text: "",
    results: [],
    status: ""
  };
  $scope.get_search = function() {
    $scope.query.results = [];
    $scope.query.status = "";
    if (!$scope.query.text) {
      console.log('Query text is empty, so skipping search.');
      return;
    }
    $location.search('q', $scope.query.text);
    $scope.query.status = "Searching for: " + $scope.query.text + "...";
    Search.query({ q: $scope.query.text },
      function(response_object, responseHeaders) {
        object_list = response_object.objects;
          if (object_list.length == 1) {
            noun = " match.";
          } else {
            noun = " matches.";
          }
          $scope.query.status = "Found " + object_list.length + noun;
        $scope.query.results = object_list;
        
        // also check for hash in location field and scroll, if present
        if ($location.hash()) {
          $log.info("$location.hash() is: " + $location.hash());
          $timeout(function() {
            $scope.scroll_to_id($location.hash());
          }, 500);
        }
      },
      function(response_object, responseHeaders) {
        console.log('Query errored with: ' + response_object);
        $scope.query.status = "Query failed.";
      }
    );
  };
    $scope.search_item_style = function(search_item) {
      // Determine which CSS classes should apply to this search_item.
      // We want Experiments and Samples to look different. Also, if we are
      // looking at detail on this search_item, it should be highlighted.
      var classList = search_item.item_type;
      if ($scope.detail.showing &&
          search_item.pk==$scope.detail.search_item.pk) {
        classList += ' active';
      }
      return classList;
    };

    $scope.scroll_to_id = function(id) {
      $log.info("scroll_to_id called with: " + id);
      $location.hash(id);
      $anchorScroll();
    };

    $scope.detail = {
      // The detail object contains all of the information needed for 
      // displaying the detail page for search_item and includes convenience
      // methods for managing that information.
      showing: false,
      search_item: null,
      status: "retrieving...",
      related_items: [],

      show: function( search_item ) {
        $scope.detail.search_item = search_item;
        $scope.detail.showing = true;
        if (search_item.item_type == 'sample') {
          Sample.get({ id: search_item.pk },
            function(response_object, responseHeaders) {
              if (response_object) {
                $scope.detail.status = "";
                $scope.detail.results = response_object;
              }
            },
            function(response_object, responseHeaders) {
              $log.warn('Query errored with: ' + response_object);
              $scope.detail.status = "Query failed.";
            }
          );
        } else if (search_item.item_type == 'experiment') {
          $scope.detail.related_items = [];
          var getSampleDetails = function(pk) {
            Sample.get({id: pk},
              function(response_object, responseHeaders) {
                if (response_object) {
                  $scope.detail.status = "";
                  $scope.detail.related_items.push(response_object);
                }
              },
              function(response_object, responseHeaders) {
                $log.warn('Query errored with: ' + response_object);
                $scope.detail.status = "Query failed.";
              }
            );
          };
          Experiment.get({ accession: search_item.pk },
            function(response_object, responseHeaders) {
              if (response_object) {
                $scope.detail.results = response_object;
                $scope.detail.status = "Retrieving sample details...";
                for (var i=0; i< search_item.related_items.length; i++) {
                  getSampleDetails(search_item.related_items[i]);
                }
              }
            },
            function(response_object, responseHeaders) {
              $log.warn('Query errored with: ' + response_object);
              $scope.detail.status = "Query failed.";
            }
          );
        }
        $timeout(function() {
          // if we inititate the scroll too early, the search results list
          // hasn't finished compressing width and it doesn't work right, so this
          // timeout waits until the transition has finished before scrolling
          $scope.scroll_to_id(search_item.pk);
        }, 500);
      },

      clear: function() {
        $scope.detail.showing = false;
        $scope.detail.status = null;
        // also check for hash in location field and scroll, if present
        if ($location.hash()) {
          $timeout(function() {
            $scope.scroll_to_id($location.hash());
          }, 500);
        }
      },

      make_ml_data_source_href: function(experimentId, mlDataSource) {
        /*
          TODO find a place where this URL template belongs
        */
        return ("http://www.ebi.ac.uk/arrayexpress/files/{expId}/" +
          "{expId}.raw.1.zip/{mlDataSource}")
          .replace(/{expId}/g, experimentId)
          .replace(/{mlDataSource}/g, mlDataSource);
      }
    };

    // check for search text in location field and load, if present
    var params = $location.search();
    if ('q' in params) {
      $scope.query.text = params['q'];
      $scope.get_search();
    }

    $scope.analysis = {
      sample_list: [],
      sample_objects: {},

      add_sample: function(sample_id) {
        if (this.sample_list.indexOf(+sample_id) != -1) {
          // quietly ignore the double-add
          $log.warn('analysis.add_sample: ' + sample_id + 
              ' already in the sample list; ignoring.');
        } else {
          this.sample_list.push(+sample_id);
        }
      },

      add_experiment: function(sample_id_list) {
        for (var i = 0; i < sample_id_list.length; i++) {
          this.add_sample(sample_id_list[i]);
        }
      },

      add_item: function(search_item) {
        $log.info('add_item: ' + search_item.item_type);
        if (search_item.item_type == 'sample') {
          $scope.analysis.add_sample(search_item.pk);
        } else if (search_item.item_type == 'experiment') {
          $scope.analysis.add_experiment(search_item.related_items);
        }
      },

      has_item: function(search_item) {
        if (search_item.item_type == 'sample') {
          if (this.sample_list.indexOf(+search_item.pk) != -1) {
            return true;
          } else {
            return false;
          }
        } else if (search_item.item_type == 'experiment') {
          // what we want to know, in the case of an experiment, is 'are
          // all of the samples from this experiment already added?'
          for (var i = 0; i < search_item.related_items.length; i++) {
            if (this.sample_list.indexOf(+search_item.related_items[i]) == -1) {
              return false;
            }
          }
          return true;
        }
      },
      
      show: function() {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'analyze/analysisModal.tpl.html',
          controller: 'AnalysisModalCtrl',
          size: 'lg',
          resolve: {
            analysis: function() {
              return $scope.analysis;
            }
          }
        });
        modalInstance.result.then(function (selectedItem) {
        //   $log.info('Modal dismissed with selectedItem at: ' + new Date());
        // }, function () {
        //   $log.info('Modal dismissed at: ' + new Date());
        });
      },

      getSampleDetails: function(pk) {
        Sample.get({id: pk},
          function(response_object, responseHeaders) {
            if (response_object) {
              $scope.analysis.sample_objects[pk] = response_object;
            }
          },
          function(response_object, responseHeaders) {
            $log.warn('Query for sample ' + pk + 
                ' errored with: ' + response_object);
          }
        );
      }
    };
}])
.directive('adageSampleDetail', function() {
  return {
    restrict: 'E',
    templateUrl: 'analyze/adageSampleDetail.tpl.html'
  };
})
.directive('adageExperimentDetail', function() {
  return {
    restrict: 'E',
    templateUrl: 'analyze/adageExperimentDetail.tpl.html'
  };
})
.controller('AnalysisModalCtrl', function($scope, $uibModalInstance, analysis) {
  $scope.analysis = analysis;
  $scope.close = function() {
    $uibModalInstance.dismiss('close');
  };
  
  // populate sample details
  for (var i=0; i < $scope.analysis.sample_list.length; i++) {
    analysis.getSampleDetails($scope.analysis.sample_list[i]);
  }
})
;
