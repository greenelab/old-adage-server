angular.module('adage.tribe_client.genesets', [
  'adage.tribe_client.resource',
  'adage.gene.resource',
  'adage.utils'
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
  controller: ['$log', 'Genesets', 'Gene', 'errGen',
    function($log, Genesets, Gene, errGen) {
      var self = this;

      self.search = {};

      self.searchGenesets = function() {
        self.searchStatus = 'Searching for gene sets...';
        var qparams = {
          'query': self.search.query,
          'organism__scientific_name': self.organism,
          'limit': self.limit
        };

        Genesets.query(qparams,
          function success(data) {
            self.genesets = [];
            var returnedGenesets = data.objects;
            angular.forEach(returnedGenesets, function(geneset) {
              var entrezIds = geneset.tip.genes.join(',');
              Gene.get({'entrezid__in': entrezIds},
                function success(response) {
                  self.searchStatus = null;
                  geneset.geneObjs = response.objects;
                  self.genesets.push(geneset);
                },
                function error(errResponse) {
                  self.searchStatus = null;
                  var errMessage = errGen('Failed to get Gene information',
                                          errResponse);
                  $log.error(errMessage);
                  self.geneQueryStatus = errMessage +
                                         '. Please try again later.';
                }
              );
            });
          },
          function error(errResponse) {
            self.searchStatus = null;
            var errMessage = errGen('Failed to retrieve gene sets from Tribe',
                                    errResponse);
            $log.error(errMessage);
            self.genesetQueryStatus = errMessage + '. Please try again later.';
          }
        );
      };
    }
  ]
})

// Directive for table containing search results
.component('genesetResultTable', {
  templateUrl: 'tribe_client/geneset-result-table.tpl.html',
  bindings: {
    limit: '@',
    genesets: '=',
    selectedGeneset: '='
  },
  controller: ['CommonGeneFuncts', function(CommonGeneFuncts) {
    var self = this;
    // TODO: Implement pagination for geneset search results in
    // case the number of results ($scope.genesetResultCount above)
    // is greater than this 'limit' parameter (the maximum number of
    // geneset results that the Tribe API should return at once).

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
