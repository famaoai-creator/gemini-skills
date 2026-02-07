const handleRequest = require('../src/messy_logic');

describe('Legacy Logic: handleRequest (Backfill for Refactoring)', () => {
  it('should allow admin save', () => {
    const res = handleRequest('admin', '12345', 'save');
    expect(res.s).toBe(1);
  });

  it('should fail auth for wrong pass', () => {
    const res = handleRequest('admin', 'wrong', 'save');
    expect(res.msg).toBe('auth');
  });
});
