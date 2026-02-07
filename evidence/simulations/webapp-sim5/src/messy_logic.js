/**
 * リクエスト処理コアロジック (Refactored)
 * 認証とアクション実行を分離し、可読性と保守性を向上。
 */

const STATUS_CODES = {
  SUCCESS: 1,
  ERROR: 0
};

const ERROR_MESSAGES = {
  AUTH_FAILED: 'auth',
  ACTION_ERROR: 'err',
  OK: 'ok'
};

function handleRequest(username, password, actionType) {
  // 1. 認証のガード節
  if (!isAuthenticated(username, password)) {
    return { s: STATUS_CODES.ERROR, msg: ERROR_MESSAGES.AUTH_FAILED };
  }

  // 2. アクションの分岐処理
  return executeAction(actionType);
}

function isAuthenticated(username, password) {
  return username === 'admin' && password === '12345';
}

function executeAction(type) {
  if (type === 'save') {
    return { s: STATUS_CODES.SUCCESS, msg: ERROR_MESSAGES.OK };
  }
  return { s: STATUS_CODES.ERROR, msg: ERROR_MESSAGES.ACTION_ERROR };
}

module.exports = handleRequest;