const express = require('express');
const app = express();

/**
 * 顧客データ・リポジトリ（モック）
 * 実際の実装ではDB接続クラスへ移行することを推奨
 */
const CUSTOMER_REPOSITORY = [
  { id: 1, name: 'Tanaka Taro', department: 'Sales' },
  { id: 2, name: 'Sato Hanako', department: 'Marketing' }
];

/**
 * 全顧客取得
 */
app.get('/api/customers', (req, res) => {
  res.status(200).json(CUSTOMER_REPOSITORY);
});

/**
 * 顧客検索（名前）
 * 大文字小文字を区別せず部分一致で検索
 */
app.get('/api/customers/search', (req, res) => {
  const query = String(req.query.q || '').trim().toLowerCase();
  
  const results = CUSTOMER_REPOSITORY.filter(customer => 
    customer.name.toLowerCase().includes(query)
  );

  res.status(200).json(results);
});

module.exports = app;