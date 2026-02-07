const express = require('express');
const { validateToken } = require('./auth');
const app = express();

const CUSTOMERS = [
  { id: 1, name: 'Alice', rank: 'Platinum' },
  { id: 2, name: 'Bob', rank: 'Gold' }
];

app.get('/api/customers', (req, res) => {
  // 認証の簡易チェック（本来はミドルウェア化）
  const dummyToken = { exp: Date.now() + 1000 };
  if (!validateToken(dummyToken)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(CUSTOMERS);
});

module.exports = app;
