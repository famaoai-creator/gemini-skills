/**
 * 認証トークン検証コアロジック (Critical Logic)
 */
function validateToken(token) {
  if (!token || typeof token.exp !== 'number') return false;
  return token.exp > Date.now();
}

module.exports = { validateToken };
