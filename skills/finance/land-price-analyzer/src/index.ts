// @ts-ignore
import { runSkillAsync } from '@agent/core';
const { logger, safeReadFile } = require('@agent/core/secure-io');
const pathResolver = require('@agent/core/path-resolver');
import axios from 'axios';
import * as fs from 'node:fs';

interface SkillArgs {
  action?: string;
  area?: string;
  year?: string;
  _: string[];
}

runSkillAsync('land-price-analyzer', async (args: SkillArgs) => {
  const safeArgs = args || { _: [] };
  
  const credPath = pathResolver.rootResolve('knowledge/personal/connections/mlit/mlit-credentials.json');
  const endpointPath = pathResolver.rootResolve('knowledge/common/api-endpoints.json');
  const aliasPath = pathResolver.rootResolve('knowledge/finance/fund-aliases.json');

  if (!fs.existsSync(credPath)) throw new Error('MLIT credentials missing.');
  
  const { apiKey } = JSON.parse(safeReadFile(credPath, { encoding: 'utf8' }));
  const endpoints = JSON.parse(safeReadFile(endpointPath, { encoding: 'utf8' }));
  const aliases = JSON.parse(safeReadFile(aliasPath, { encoding: 'utf8' }));

  const action = safeArgs.action || (safeArgs._ && safeArgs._[0]) || 'get-land-price';
  const areaCode = safeArgs.area || aliases.default_municipality || '13101';

  logger.info('🏘️ [Finance] Analyzing land data for area: ' + areaCode);

  try {
    let url = '';
    let params: any = { area: areaCode };

    if (action === 'get-land-price') {
      url = endpoints.mlit.land_price_search;
    } else if (action === 'get-transaction-price') {
      url = endpoints.mlit.real_estate_transaction_search;
      params.year = safeArgs.year || '2023';
    } else {
      throw new Error('Unsupported action: ' + action);
    }

    const response = await axios.get(url, {
      headers: { 'Ocp-Apim-Subscription-Key': apiKey },
      params
    });

    const data = response.data.data || [];
    return { status: 'success', data: { action, area: areaCode, results: data.slice(0, 10) } };
  } catch (err: any) {
    throw new Error('RE-Infolib Failure: ' + err.message);
  }
});
