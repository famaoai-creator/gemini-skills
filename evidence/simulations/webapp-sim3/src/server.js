const express = require('express');
const { searchCustomers } = require('./logic');
const app = express();

const DB = [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }];

app.get('/api/customers', (req, res) => {
  const query = req.query.q;
  const results = searchCustomers(DB, query);
  res.json(results);
});

module.exports = app;
