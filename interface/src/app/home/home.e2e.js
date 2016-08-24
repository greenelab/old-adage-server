// A generic e2e test.
describe('Home Test', function() {
  it('should test the title of "home"', function() {
    browser.get('/#/home');
    expect(browser.getTitle()).toEqual("Home | adage");

  });

});
