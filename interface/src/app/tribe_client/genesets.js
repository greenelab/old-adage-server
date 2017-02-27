angular.module('adage.tribe_client.genesets', [
  'adage.tribe_client.resource',
  'adage.gene.resource'
])

// Wrapping component that houses the genesetSearchBar and the
// genesetResultTable.
.component('genesetSearchForm', {
  templateUrl: 'tribe_client/geneset-search-form.tpl.html',
  bindings: {
    organism: '@',
    mlModel: '@'
  },
  controller: ['$state', 'CommonGeneFuncts',
    function($state, CommonGeneFuncts) {
      var self = this;

      // Number of results (in this case genesets) to come back
      // in each response page.
      self.limit = 10;
      self.sendToNetwork = function() {
        self.selectedGenes = {};

        var genes = self.selectedGeneset.geneObjs;
        for (var i = 0; i < genes.length; i++) {
          self.selectedGenes[genes[i].id] = genes[i];
        }
        CommonGeneFuncts.sendToNetwork(self, $state);
      };
    }
  ]
})


// Search box for users to enter their search text into
// and go search Tribe genesets.
.component('genesetSearchBar', {
  templateUrl: 'tribe_client/geneset-search-bar.tpl.html',
  bindings: {
    limit: '@',
    organism: '@',
    genesets: '='
  },
  controller: ['$log', 'Genesets', 'Gene', function($log, Genesets, Gene) {
    var self = this;

    self.search = {};

    self.searchGenesets = function() {
      var qparams = {};
      qparams['query'] = self.search.query;
      qparams['organism__scientific_name'] = self.organism;
      qparams['limit'] = self.limit;

      Genesets.query(qparams, function(data) {
        self.genesets = [];
        var returnedGenesets = data.objects;
        angular.forEach(returnedGenesets, function(geneset) {
          var entrezIds = geneset.tip.genes.join(',');
          Gene.get({'entrezid__in': entrezIds},
            function success(response) {
              geneset.geneObjs = response.objects;
              self.genesets.push(geneset);
            },
            function error(err) {
              $log.error('Failed to get gene information: ' + err);
              self.errorMessage = 'Failed to get gene information from server';
            }
          );
        });
      });
    };
  }]
})

// Directive for table containing search results
.component('genesetResultTable', {
  templateUrl: 'tribe_client/geneset-result-table.tpl.html',
  bindings: {
    limit: '@',
    organism: '@',
    genesets: '=',
    selectedGeneset: '='
  },
  controller: ['CommonGeneFuncts', function(CommonGeneFuncts) {
    var self = this;
    self.selectedGeneset = {};

    self.getGeneLabelList = function(geneList) {
      var geneLabelList = geneList.map(function(gene) {
        return CommonGeneFuncts.getGeneLabel(gene);
      }).join(' ');
      return geneLabelList;
    };
  }]
})

;
