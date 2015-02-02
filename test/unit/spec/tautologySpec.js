'use strict';

describe('tautology', function () {
  var truth;

  beforeEach(function () {
    truth = true;
  });

  it('should be trivially true', function () {
    expect(truth).toBeTrue();

  });
});