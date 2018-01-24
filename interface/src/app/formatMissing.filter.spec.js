describe('adage.formatMissing', function() {
  describe('filter', function() {
    var $filter;

    beforeEach(module('adage.formatMissing.filter'));
    beforeEach(inject(function(_$filter_) {
      $filter = _$filter_;
    }));

    it('should pass a dummy test', inject(function() {
      var filter = $filter('formatMissing')('');
      expect(filter).toBeTruthy();
    }));

    it('should return N/A for empty string by default', inject(function() {
      var filter = $filter('formatMissing')('');
      expect(filter).toEqual('N/A');
    }));

    it('should return N/A for whitespace by default', inject(function() {
      var filter = $filter('formatMissing')(' ');
      expect(filter).toEqual('N/A');
    }));

    it('should not fail when input is missing', inject(function() {
      var filter = $filter('formatMissing')();
      expect(filter).toEqual('N/A');
    }));

    it('should return input for non-empty string by default', inject(
      function() {
        var filter = $filter('formatMissing')('non-blank text');
        expect(filter).toEqual('non-blank text');
      }
    ));

    it('should return replacement for empty string', inject(function() {
      var filter = $filter('formatMissing')('', '-');
      expect(filter).toEqual('-');
    }));

    it('should return replacement for whitespace', inject(function() {
      var filter = $filter('formatMissing')(' ', '-');
      expect(filter).toEqual('-');
    }));

    it('should return input for non-empty string with replacement', inject(
      function() {
        var filter = $filter('formatMissing')('non-blank text', '-');
        expect(filter).toEqual('non-blank text');
      }
    ));
  });
})
;
