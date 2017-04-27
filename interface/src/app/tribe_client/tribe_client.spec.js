/**
 * 'adage.tribe_client' module unit tests
 *
 **/

// Test UserFactory factory
describe('UserFactory and properties are defined', function() {
  beforeEach(module('adage.tribe_client'));

  var UserFactory;

  beforeEach(inject(function(_UserFactory_) {
    UserFactory = _UserFactory_;
  }));

  it('should be defined', function() {
    expect(UserFactory).toBeDefined();
  });

  it('should be defined', function() {
    expect(UserFactory.getUser).toBeDefined();
  });

  it('should be defined', function() {
    expect(UserFactory.getPromise).toBeDefined();
  });

  it('should be defined', function() {
    expect(UserFactory.resetPromise).toBeDefined();
  });

  it('should be defined', function() {
    expect(UserFactory.resetAndGetPromise).toBeDefined();
  });
});
