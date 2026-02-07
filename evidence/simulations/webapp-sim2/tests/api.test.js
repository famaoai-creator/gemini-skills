const request = require('supertest');
const app = require('../src/app');

describe('Customer API (TDD Phase: RED)', () => {
  it('GET /api/customers should return all customers', async () => {
    const res = await request(app).get('/api/customers');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('GET /api/customers/search should be case-insensitive', async () => {
    const res = await request(app).get('/api/customers/search?q=taro');
    expect(res.statusCode).toEqual(200);
    expect(res.body[0].name).toContain('Taro');
  });
});
