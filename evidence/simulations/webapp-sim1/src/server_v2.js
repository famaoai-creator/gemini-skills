const express = require('express');
const app = express();

// データ層の分離（将来のDB拡張を見据えた構成）
const CUSTOMER_REPOSITORY = [
  { id: 1, name: 'Tanaka Taro' },
  { id: 2, name: 'Sato Hanako' },
];

/**
 * 顧客検索エンドポイント
 * @query name 検索キーワード
 */
app.get('/api/customers/search', (req, res) => {
  const queryName = req.query.name || '';
  
  const results = CUSTOMER_REPOSITORY.filter(customer => 
    customer.name.toLowerCase().includes(queryName.toLowerCase())
  );

  res.status(200).json(results);
});

module.exports = app;