angular.module('adage.formatMissing.filter', [])

.filter('formatMissing', function() {
  return function(inputStr, replacementStr) {
    // default to 'N/A'
    var replacement = (replacementStr === undefined ? 'N/A' : replacementStr);
    if (inputStr.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '') === '') {
      return replacement;
    } else {
      return inputStr;
    }
  };
})
;
