angular.module('adage.formatMissing.filter', [])

.filter('formatMissing', function() {
  return function(inputStr, substituteStr) {
    // default to 'N/A'
    var replacement = (substituteStr === undefined ? 'N/A' : substituteStr);
    if (inputStr === undefined) {
      return replacement;
    }
    // The crazy RegEx below performs a "String.trim", but should work in more
    // browsers. Credit due to Mozilla for the documentation at:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim#Polyfill
    if (inputStr.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '') === '') {
      return replacement;
    } else {
      return inputStr;
    }
  };
})
;
