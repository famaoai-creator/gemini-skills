/**
 * 顧客検索のコアロジック (Critical Logic)
 */
function searchCustomers(customers, query) {
  if (!query) return customers;
  const q = query.toLowerCase();
  return customers.filter(c => c.name.toLowerCase().includes(q));
}

module.exports = { searchCustomers };
