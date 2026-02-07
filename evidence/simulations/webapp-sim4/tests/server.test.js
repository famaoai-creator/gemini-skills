const request = require('supertest');
const app = require('../src/server');

describe('Full API Backfill (webapp-sim4)', () => {
  it('GET /api/customers should succeed with mock valid token', async () => {
    const res = await request(app).get('/api/customers');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });
});
