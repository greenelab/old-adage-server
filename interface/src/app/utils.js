/**
 * This module includes a few utility components that will be shared in other
 * modules to avoid duplicate codes.
 */

angular.module('greenelab.utils', [])
.constant('ApiBasePath', '/api/v0/')

// A service function that returns a string of error message based on input
// context and response.
.value('errGen', function(context, response) {
  if (response.statusCode && response.statusText) {
    return context + ': ' + response.statusCode + ' ' + response.statusText;
  }
  return context;
});
