const { searchCustomers } = require('../src/logic');

describe('Core Logic: searchCustomers (TDD)', () => {
  const data = [{ name: 'Alice' }, { name: 'Bob' }];

  it('should find customers by name', () => {
    const results = searchCustomers(data, 'ali');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Alice');
  });

  it('should return empty list for no match', () => {
    const results = searchCustomers(data, 'Zoe');
    expect(results.length).toBe(0);
  });
});
