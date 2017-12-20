/**
 * This module includes a few utility components that will be shared in other
 * modules to avoid duplicate codes.
 */

angular.module('adage.utils', [])
.constant('ApiBasePath', '/api/v0/')

// A service function that returns a string of error message based on input
// context and response.
.value('errGen', function(context, response) {
  if (response.status && response.statusText) {
    return context + ': ' + response.status + ' ' + response.statusText;
  }
  return context;
})

// Number of digits in activity value shown on frontend:
.constant('ActivityDigits', 5)

// Service of global machine learning model, which is shared by multiple
// modules.
.service('MlModelTracker', [function() {
  this.init = function() {
    this.id = null;
    this.title = null;
    this.organism = null;
    this.g2gEdgeCutoff = null;
    this.desc = null;
  };

  this.set = function(inputModel) {
    if (this.id !== inputModel.id) {
      this.id = inputModel.id || null;
      this.title = inputModel.title || null;
      this.organism = inputModel.organism || null;
      this.g2gEdgeCutoff = inputModel.g2g_edge_cutoff;
      this.desc = inputModel.desc_html;
    }
  };

  this.init();
}])
;
