#!/usr/bin/env node
/**
 * Land Price Analyzer v1.0
 * Strictly uses @agent/core for I/O and path resolution.
 * Ministry of Land, Infrastructure, Transport and Tourism (MLIT) RE-Infolib API.
 */

const { runSkill } = require('@agent/core');
const { logger } = require('@agent/core/core');
const { safeReadFile } = require('@agent/core/secure-io');
const pathResolver = require('@agent/core/path-resolver');
const axios = require('axios');
const fs = require('fs');

const CREDENTIALS_PATH = pathResolver.rootResolve('knowledge/personal/connections/mlit/mlit-credentials.json');

runSkill('land-price-analyzer', async (args) => {
  const action = args.action || args._[0] || 'get-land-price';
  const areaCode = args.area || '13101'; // Default: Chiyoda-ku, Tokyo

  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(`MLIT credentials not found at ${CREDENTIALS_PATH}. Please save {"apiKey": "YOUR_API_KEY"} to this file.`);
  }

  const { apiKey } = JSON.parse(safeReadFile(CREDENTIALS_PATH, { encoding: 'utf8' }));
  if (!apiKey) throw new Error('Missing apiKey in mlit-credentials.json');

  logger.info(`🏘️ [Finance] Analyzing land data for area: ${areaCode}...`);

  try {
    let url = '';
    let params = {
      area: areaCode,
    };

    switch (action) {
      case 'get-land-price':
        // 公示地価・基準地価の取得
        url = 'https://www.reinfolib.mlit.go.jp/api/pro/v1/landPrice/search';
        break;
      case 'get-transaction-price':
        // 不動産取引価格情報の取得
        url = 'https://www.reinfolib.mlit.go.jp/api/pro/v1/realEstateTransaction/search';
        params.year = args.year || '2023';
        break;
      default:
        throw new Error(`Unsupported action: ${action}`);
    }

    const response = await axios.get(url, {
      headers: { 'Ocp-Apim-Subscription-Key': apiKey },
      params
    });

    const data = response.data.data || [];
    logger.success(`✅ Successfully retrieved ${data.length} records.`);

    return {
      status: 'success',
      data: {
        action,
        area: areaCode,
        record_count: data.length,
        results: data.slice(0, 10) // Return top 10 for analysis
      }
    };
  } catch (err) {
    logger.error(`RE-Infolib API Failure: ${err.message}`);
    if (err.response?.data) logger.error(JSON.stringify(err.response.data));
    throw err;
  }
});
