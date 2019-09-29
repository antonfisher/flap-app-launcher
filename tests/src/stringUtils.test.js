const assert = require('assert');
const stringUtils = require('../../src/stringUtils');

describe('String Utils', () => {
  describe('addLeftPad()', () => {
    it("should return the same substring if it isn't presented in the string", () => {
      assert.equal(stringUtils.addLeftPad('abc', 'f'), 'f');
    });

    it('should add left pad to the substring if it is presented in the string', () => {
      assert.equal(stringUtils.addLeftPad('abc', 'a'), 'a');
      assert.equal(stringUtils.addLeftPad('abc', 'b'), ' b');
      assert.equal(stringUtils.addLeftPad('abc', 'c'), '  c');
    });

    it('should remove left pad from the substring', () => {
      assert.equal(stringUtils.addLeftPad('abc', ' c'), '  c');
    });
  });

  describe('removeLeftPad()', () => {
    it('should return the same string if it there is no left pad', () => {
      assert.equal(stringUtils.removeLeftPad('a b c'), 'a b c');
    });

    it('should remove left pad from the string', () => {
      assert.equal(stringUtils.removeLeftPad(' a b c'), 'a b c');
      assert.equal(stringUtils.removeLeftPad('  a b c'), 'a b c');
    });

    it('should allow to pass an empty value', () => {
      assert.equal(stringUtils.removeLeftPad(), '');
    });
  });
});
