angular.module( 'adage.analyze', [
  'ui.router',
  'placeholders',
  'ui.bootstrap',
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

.controller( 'AnalyzeCtrl', function AnalyzeCtrl( $scope, $uibModal, $log, Search ) {
  $scope.query = {
    text: "",
    results: [],
    status: ""
  };
  // $scope.query.results = [];
  $scope.get_search = function( query ) {
    $scope.query.results = [];
    $scope.query.status = "";
    if (!$scope.query.text) {
      console.log('Query text is empty, so skipping search.');
      return;
    }
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
      },
      function(response_object, responseHeaders) {
        console.log('Query errored with: ' + response_object);
        $scope.query.status = "Query failed.";
      }
    );
  };
  
  $scope.detail = {
    search_item: {}
  };
  $scope.show_detail = function( search_item ) {
    $scope.detail.search_item = search_item;
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'analyze/detailModal.tpl.html',
      controller: 'DetailModalCtrl',
      size: 'lg',
      resolve: {
        detail: function() {
          return $scope.detail;
        }
      }
    });
    modalInstance.result.then(function (selectedItem) {
      $log.info('Modal dismissed with selectedItem at: ' + new Date());
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
  
  $scope.analysis = {
    sample_list: []
  };
  $scope.add_item = function( search_item ) {
    $log.info('add_item: ' + search_item.item_type);
    if (search_item.item_type == 'sample') {
      $scope.analysis.sample_list.push(+search_item.pk);
    } else if (search_item.item_type == 'experiment') {
      $scope.analysis.sample_list = 
        $scope.analysis.sample_list.concat(search_item.related_items);
    }
  };
  $scope.show_analysis = function( ) {
    var modalInstance = $uibModal.open({
      animation: false,
      templateUrl: 'analyze/analysisModal.tpl.html',
      controller: 'AnalysisModalCtrl',
      resolve: {
        analysis: function() {
          return $scope.analysis;
        }
      }
    });
    modalInstance.result.then(function (selectedItem) {
      $log.info('Modal dismissed with selectedItem at: ' + new Date());
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
})

.controller('DetailModalCtrl', function($scope, $uibModalInstance, $log, detail, Sample, Experiment) {
  $scope.detail = detail;
  $scope.close = function() {
    $uibModalInstance.dismiss('close');
  };
  if (detail.search_item.item_type == 'sample') {
    Sample.get({ id: detail.search_item.pk },
      function(response_object, responseHeaders) {
        if (response_object) {
          $scope.detail.status = "Found a match.";
          $scope.detail.results = JSON.stringify(response_object, null, 4);
        }
      },
      function(response_object, responseHeaders) {
        console.log('Query errored with: ' + response_object);
        $scope.detail.status = "Query failed.";
      }
    );
  } else if (detail.search_item.item_type == 'experiment') {
    Experiment.get({ accession: detail.search_item.pk },
      function(response_object, responseHeaders) {
        if (response_object) {
          $scope.detail.status = "Found a match.";
          $scope.detail.results = JSON.stringify(response_object, null, 4);
        }
      },
      function(response_object, responseHeaders) {
        console.log('Query errored with: ' + response_object);
        $scope.detail.status = "Query failed.";
      }
    );
  }
})
.controller('AnalysisModalCtrl', function($scope, $uibModalInstance, analysis) {
  $scope.analysis = analysis;
  $scope.close = function() {
    $uibModalInstance.dismiss('close');
  };
})
;
