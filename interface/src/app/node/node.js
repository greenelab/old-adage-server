/**
 * "adage.gene.network" module.
 */

angular.module('adage.node', [
  'ui.router',
  'placeholders',
  'ui.bootstrap'
])

.config(function config($stateProvider) {
  $stateProvider.state('node', {
    url: '/node/{id:int}',
    views: {
      main: {
        templateUrl: 'node/node.tpl.html',
        controller: 'NodeCtrl as ctrl'
      }
    },
    data: {pageTitle: 'Node Information'}
  });
})

.factory('NodeInfo', ['$resource', '$stateParams',
  function($resource) {
    return $resource('/api/v0/node/:id');
  }
])

.factory('HeavyGenes', ['$resource', function($resource) {
  return $resource('/api/v0/participation/');
}])

.controller('NodeCtrl', ['NodeInfo', '$stateParams', '$log',
  function NodeController(NodeInfo, $stateParams, $log) {
    var self = this;
    if (!$stateParams.id) {
      self.statusMessage = 'Please specify node ID in the URL.';
      return;
    }
    self.id = $stateParams.id;
    self.statusMessage = 'Connecting to the server ...';
    NodeInfo.get(
      {id: self.id},
      function success(response) {
        self.name = response.name;
        self.mlmodel = response.mlmodel.title;
        self.statusMessage = '';
      },
      function error(err) {
        $log.error('Failed to get node information: ');
        self.statusMessage = 'Failed to get node information from server';
      }
    );
  }
])

.directive('highWeightGenes', ['HeavyGenes', '$log',
  function(HeavyGenes, $log) {
    return {
      templateUrl: 'node/heavy_genes.tpl.html',
      scope: {
        nodeId: '='
      },
      link: function($scope) {
        $scope.queryStatus = 'Connecting to the server ...';
        HeavyGenes.get(
          {node: $scope.nodeId, limit: 0},
          function success(response) {
            $scope.genes = [];
            var i = 0, n = response.objects.length;
            var sysName, stdName, desc;
            var numHypo = 0;
            for (; i < n; ++i) {
              sysName = response.objects[i].gene.systematic_name;
              stdName= response.objects[i].gene.standard_name;
              desc = response.objects[i].gene.description;
              if (desc.toLowerCase() === 'hypothetical protein') {
                ++numHypo;
              }
              $scope.genes.push(
                {sysName: sysName, stdName: stdName, desc: desc});
            }
            $scope.hypoPercentage = Math.round(numHypo / n * 100);
            $scope.queryStatus = '';
          },
          function error(err) {
            $log.error('Failed to get high weight genes: ' + err);
            $scope.queryStatus = 'Failed to get high weight genes from server';
          }
        );
      }
    };
  }]
)

// TODO: Directives for the other setions
;
