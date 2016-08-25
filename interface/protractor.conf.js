// Protractor configuration file.
exports.config = {
  // The URL of the server that we are testing.
  baseUrl: 'http://localhost/',

  // The address of a running Selenium server.
  seleniumAddress: 'http://localhost:4444/wd/hub',
  // According to:
  // http://stackoverflow.com/questions/19066747/integrating-protractor-with-yeoman-via-grunt
  // "grunt-protractor-runner" module already includes "protractor". If we
  // comment out the above "seleniumAddress: " line, protractor task will
  // start the selenium server automatically. Unfortunately the selenium server
  // bundled in grunt-protractor-runner/protractor is too old to support
  // Firefox web browser. In order to solve this issue, we installed
  // "grunt-protractor-webdriver" module and started a new task
  // "protractor_webdriver" (which starts the selenium server bundled in the
  //  latest "protractor" module) before "protractor:e2e" task.
  // (See Gruntfile.js for details.)
  // When "grunt-protractor-runner" is updated to have the latest "protractor"
  // module, we will not need "grunt-protractor-webdriver" any more.


  // Location(s) of the spec file (may include glob patterns).
  specs: [ 'src/test_e2e/**/*.js', 'src/**/*.e2e.js' ],

  // Jasmine related options.
  framework: 'jasmine',
  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000,
    showColors: true
  },

  // Multiple web browsers.
  multiCapabilities: [
    { browserName: 'chrome' },
    { browserName: 'firefox' },
    // Add other browsers here, such as 'safari'.
  ],

};
