#!/usr/bin/env node
/**
 * JPX Market Analyzer v1.0
 * Implementation based on @agent/core standards.
 * JPX J-Quants API Integration.
 */

const { runSkill } = require('@agent/core');
const { logger } = require('@agent/core/core');
const { safeReadFile, safeWriteFile } = require('@agent/core/secure-io');
const pathResolver = require('@agent/core/path-resolver');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = pathResolver.rootResolve('knowledge/personal/connections/jpx/jpx-credentials.json');
const CACHE_DIR = pathResolver.active('shared/cache/jpx');
const TOKEN_CACHE_FILE = path.join(CACHE_DIR, 'tokens.json');

/**
 * Ensures ID Token is valid, refreshing if necessary.
 */
async function getAuthToken(creds) {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

  let cache = { idToken: null, refreshToken: null, expires: 0 };
  if (fs.existsSync(TOKEN_CACHE_FILE)) {
    cache = JSON.parse(safeReadFile(TOKEN_CACHE_FILE, { encoding: 'utf8' }));
  }

  // If ID token is still valid (using 23h buffer for 24h token)
  if (cache.idToken && cache.expires > Date.now()) {
    return cache.idToken;
  }

  try {
    let refreshToken = cache.refreshToken;

    // Step 1: Get/Refresh Refresh Token if needed
    if (!refreshToken) {
      logger.info('🔑 [JPX] Authenticating with mail/password...');
      const loginRes = await axios.post('https://api.jquants.com/v1/token/auth_user', {
        mailaddress: creds.mailaddress,
        password: creds.password
      });
      refreshToken = loginRes.data.refreshToken;
    }

    // Step 2: Get ID Token
    logger.info('🎫 [JPX] Retrieving ID Token...');
    const idRes = await axios.post(`https://api.jquants.com/v1/token/auth_refresh?refreshtoken=${refreshToken}`);
    const idToken = idRes.data.idToken;

    // Cache results (ID token valid for 24h)
    safeWriteFile(TOKEN_CACHE_FILE, JSON.stringify({
      refreshToken,
      idToken,
      expires: Date.now() + (23 * 60 * 60 * 1000)
    }));

    return idToken;
  } catch (err) {
    throw new Error(`JPX Authentication Failed: ${err.message}`);
  }
}

runSkill('jpx-market-analyzer', async (args) => {
  const action = args.action || args._[0] || 'get-prices';
  const code = args.code; // e.g. 8697 (JPX)

  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(`JPX credentials not found. Please save {"mailaddress": "...", "password": "..."} to ${CREDENTIALS_PATH}`);
  }

  const creds = JSON.parse(safeReadFile(CREDENTIALS_PATH, { encoding: 'utf8' }));
  const idToken = await getAuthToken(creds);

  const headers = { Authorization: `Bearer ${idToken}` };

  try {
    switch (action) {
      case 'get-prices':
        if (!code) throw new Error('Stock code (--code) is required.');
        logger.info(`📈 [JPX] Fetching daily prices for ${code}...`);
        const priceRes = await axios.get('https://api.jquants.com/v1/prices/daily_quotes', {
          headers,
          params: { code }
        });
        const prices = priceRes.data.daily_quotes || [];
        return { status: 'success', code, data: prices.slice(-5) }; // Last 5 days

      case 'get-financials':
        if (!code) throw new Error('Stock code (--code) is required.');
        logger.info(`📑 [JPX] Fetching financials for ${code}...`);
        const finRes = await axios.get('https://api.jquants.com/v1/fina/statements', {
          headers,
          params: { code }
        });
        const statements = finRes.data.statements || [];
        return { status: 'success', code, data: statements.slice(0, 3) };

      default:
        throw new Error(`Unsupported action: ${action}`);
    }
  } catch (err) {
    logger.error(`JPX API Failure: ${err.message}`);
    throw err;
  }
});
