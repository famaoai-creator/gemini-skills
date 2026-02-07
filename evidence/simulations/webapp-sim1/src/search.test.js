const request = require('supertest');
const express = require('express');
const app = require('./server_v2'); // まだ存在しないファイルをインポート

describe('Customer Search API (TDD)', () => {
  it('should return matching customers by name', async () => {
    const res = await request(app).get('/api/customers/search?name=Taro');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].name).toContain('Taro');
  });

  it('should return empty list if no match found', async () => {
    const res = await request(app).get('/api/customers/search?name=NotFound');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(0);
  });
});
