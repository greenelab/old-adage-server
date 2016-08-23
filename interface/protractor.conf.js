// Protractor configuration file.
exports.config = {
  // The URL of the server that we are testing.
  baseUrl: 'http://localhost/',

  // The address of a running Selenium server.
  // This option is commented out to allow grunt to start it automatically.
  // http://stackoverflow.com/questions/19066747/integrating-protractor-with-yeoman-via-grunt
  // -------------------------------------------------
  // seleniumAddress: 'http://localhost:4444/wd/hub',
  // -------------------------------------------------
  // As the stackoverflow thread pointed out, another way to start webdriver
  // from grunt is to install "grunt-protractor-webdriver" package, and
  // configure it inside Gruntfile.js.

  // Spec patterns are relative to the location of the spec file.
  // They may include glob patterns.
  specs: [ 'src/test_e2e/**/*.js', 'src/**/*.e2e.js' ],

}
