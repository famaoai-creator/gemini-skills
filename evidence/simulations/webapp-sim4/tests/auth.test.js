const { validateToken } = require('../src/auth');

describe('Critical Logic: validateToken (TDD)', () => {
  it('should return valid:true for a non-expired token', () => {
    const token = { exp: Date.now() + 10000 };
    expect(validateToken(token)).toBe(true);
  });

  it('should return valid:false for an expired token', () => {
    const token = { exp: Date.now() - 10000 };
    expect(validateToken(token)).toBe(false);
  });

  it('should return false for malformed token', () => {
    expect(validateToken(null)).toBe(false);
  });
});
