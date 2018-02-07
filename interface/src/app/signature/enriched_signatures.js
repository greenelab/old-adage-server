/**
 * "adage.enrichedSignatures" module.
 */

angular.module('adage.enrichedSignatures', [
  'adage.signature.resources',
  'adage.participation.resources',
  'adage.gene.resource',
  'adage.utils',
  'greenelab.stats'
])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('enriched_signatures', {
    url: '/signature/enriched_signatures?mlmodel&genes',
    views: {
      main: {
        templateUrl: 'signature/enriched_signatures.tpl.html',
        controller: 'EnrichedSignaturesCtrl as ctrl'
      }
    },
    data: {pageTitle: 'Enriched Signatures'}
  });
}])

.controller('EnrichedSignaturesCtrl', ['$stateParams', 'Signature',
  'Participation', 'Gene', 'MlModelTracker', 'MathFuncts', 'pValueDigits',
  '$scope', '$q', '$log', 'errGen',
  function EnrichedSignatureController($stateParams, Signature, Participation,
    Gene, MlModelTracker, MathFuncts, pValueDigits, $scope, $q, $log, errGen) {
    var self = this;
    self.isValidModel = false;
    $scope.mlmodel = MlModelTracker;
    // Do nothing if the model ID in URL is falsey. The error will be taken
    // care of by "<ml-model-validator>" component.
    if (!$stateParams.mlmodel) {
      return;
    }

    self.modelInUrl = $stateParams.mlmodel;
    self.statusMessage = 'Connecting to the server ...';
    self.pValueCutoff = 0.05;
    self.enrichedSignatures = [];

    // Do nothing if no genes are specified in URL.
    if (!$stateParams.genes || !$stateParams.genes.split(',').length) {
      self.statusMessage = 'No genes are specified.';
      self.enrichedSignatures = [];
      return;
    }

    var genesInUrl = [];
    $stateParams.genes.split(',').forEach(function(token) {
      var id = parseInt(token);
      if (!isNaN(id) && genesInUrl.indexOf(id) === -1) {
        genesInUrl.push(id);
      }
    });

    // Promise that gets all signatures of given mlmodel in URL:
    var apiPromises = [];
    apiPromises.push(Signature.get(
      {mlmodel: self.modelInUrl, limit: 0},
      function success(response) {
        self.signatures = Object.create(null);
        response.objects.forEach(function(element) {
          self.signatures[element.id] = element.name;
        });
      },
      function error(err) {
        var message = errGen('Failed to get signatures: ', err);
        $log.error(message);
        self.statusMessage = message + '. Please try again later.';
      }
    ).$promise);

    var participations;
    // Promise that gets all participation records that are related to
    // the genes in URL:
    apiPromises.push(Participation.get(
      {'related_genes': $stateParams.genes, 'limit': 0},
      function success(response) {
        participations = response.objects;
      },
      function error(err) {
        var message = errGen(
          'Failed to get signature-gene participations: ', err);
        $log.error(message);
        self.statusMessage = message + '. Please try again later.';
      }
    ).$promise);

    // Helper function that calculates the enrichment for each signature
    // that includes at least one gene in the url.
    var calculateEnrichments = function(typeName, genesBySignatures) {
      var m = genesInUrl.length,
        N = self.geneNum,
        pValueArray = [],
        matchedGenesBySignature = [],
        signatureIDs = Object.keys(genesBySignatures);
      signatureIDs.forEach(function(sigID) {
        var genes = genesBySignatures[sigID],
          n = Object.keys(genes).length, k = 0,
          matchedGenes = [], selectedGene, pValue;
        for (var i = 0; i < genesInUrl.length; i++) {
          selectedGene = genesInUrl[i];
          if (genes[selectedGene]) {
            k++;
            matchedGenes.push(genes[selectedGene]);
          }
        }
        matchedGenesBySignature.push(matchedGenes);

        // Four parameters are needed in the formula:
        //     hyperGeometricTest(k, m, n, N)
        // k: the number of heavy genes related to sigID in genesInUrl;
        // m: the number of genes in genesInUrl;
        // n: the total number of heavy genes related to sigID;
        // N: the total number of genes.
        pValue = 1 - MathFuncts.hyperGeometricTest(k, m, n, N);
        pValueArray.push(pValue);
      });

      var significantSignatures = [];
      var correctedPValues = MathFuncts.multTest.fdr(pValueArray);
      correctedPValues.forEach(function(element, index) {
        var correctedPValue, sigID;
        if (element < self.pValueCutoff) {
          correctedPValue = element.toPrecision(pValueDigits);
          sigID = signatureIDs[index];
          significantSignatures.push({
            'url': '#/signature/' + sigID,
            'name': self.signatures[sigID],
            'participationType': typeName,
            'genes': matchedGenesBySignature[index].join(', '),
            'pValue': correctedPValue
          });
        }
      });

      significantSignatures.sort(function(a, b) {
        return a.pValue - b.pValue;
      });

      return significantSignatures;
    };

    // groupedGenes is an object that behaves like a 2-D table of genes.
    // groupedGenes[participationTypeID][signatureID] is an object whose
    // keys are gene IDs and values are genes names of those genes that
    // participate with signatureID and with participationTypeID.
    var groupedGenes = Object.create(null);

    // Main function to calculate the enrichment.
    var getEnrichedSignatures = function() {
      participations.forEach(function(element) {
        var sigID = element.signature;
        if (!self.signatures[sigID]) {
          return;
        } // ignore signatures that are not in current mlmodel

        var typeName = element.participation_type.name;
        if (!groupedGenes[typeName]) {
          groupedGenes[typeName] = Object.create(null);
        }

        if (!groupedGenes[typeName][sigID]) {
          groupedGenes[typeName][sigID] = Object.create(null);
        }
        geneID = element.gene.id;
        geneName = (element.gene.standard_name ?
                    element.gene.standard_name :
                    element.gene.systematic_name);
        groupedGenes[typeName][sigID][geneID] = geneName;
      });

      var participationTypes = Object.keys(groupedGenes);
      participationTypes.forEach(function(typeName) {
        var genesBySignatures = groupedGenes[typeName];
        var enrichment = calculateEnrichments(typeName, genesBySignatures);
        for (var i = 0; i < enrichment.length; i++) {
          self.enrichedSignatures.push(enrichment[i]);
        }
      });
      self.statusMessage = '';
    };

    // Do not retrieve genes from backend until mlmodel is ready,
    // because current mlmodel's organism ID is needed in the query.
    $scope.$watch('mlmodel.organism', function() {
      if ($scope.mlmodel.organism) {
        // Promise that gets the total number of genes.
        // For the moment, the total number of genes in our universe to
        // perform this enrichment analysis, is the total number of
        // Entrez IDs in our database for Pseudomonas aeruginosa.
        // The only field we care in response is 'total_count', so
        // 'limit' is set to 1 to save some bandwidth.
        apiPromises.push(Gene.get(
          {organism: $scope.mlmodel.organism.id, limit: 1},
          function success(response) {
            self.geneNum = response.meta.total_count;
          },
          function error(err) {
            var message = errGen('Failed to get total gene number: ', err);
            $log.error(message);
            self.statusMessage = message + '. Please try again later.';
          }
        ).$promise);
        // Wait for all promises to finish before calculating the
        // enriched signatures.
        $q.all(apiPromises).then(getEnrichedSignatures);
      }
    });
  }
])
;
