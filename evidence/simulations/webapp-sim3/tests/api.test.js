const request = require('supertest');
const app = require('../src/server');

describe('Full API Backfill Tests', () => {
  it('GET /api/customers - returns all', async () => {
    const res = await request(app).get('/api/customers');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(3);
  });

  it('GET /api/customers - filters correctly', async () => {
    const res = await request(app).get('/api/customers?q=bob');
    expect(res.body[0].name).toBe('Bob');
  });
});
