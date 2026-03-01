// @ts-ignore
import { runSkillAsync } from '@agent/core';
const { logger, safeReadFile } = require('@agent/core/secure-io');
const pathResolver = require('@agent/core/path-resolver');
import axios from 'axios';
import * as fs from 'node:fs';

interface SkillArgs {
  keyword?: string;
  limit?: number;
  _: string[];
}

runSkillAsync('rakuten-ichiba-connector', async (args: SkillArgs) => {
  const safeArgs = args || { _: [] };
  const keyword = safeArgs.keyword || (safeArgs._ && safeArgs._[0]);
  const limit = safeArgs.limit || 5;

  const credPath = pathResolver.rootResolve('knowledge/personal/connections/rakuten/rakuten-credentials.json');
  const endpointPath = pathResolver.rootResolve('knowledge/common/api-endpoints.json');

  if (!fs.existsSync(credPath)) throw new Error('Rakuten credentials missing.');
  
  const { applicationId } = JSON.parse(safeReadFile(credPath, { encoding: 'utf8' }));
  const endpoints = JSON.parse(safeReadFile(endpointPath, { encoding: 'utf8' }));
  const url = endpoints.rakuten.ichiba_search;

  if (!keyword) throw new Error('Keyword is required.');

  logger.info(`🔍 [Lifestyle] Searching Rakuten Ichiba for: "${keyword}"...`);

  try {
    const response = await axios.get(url, {
      params: { applicationId, keyword, hits: limit, format: 'json' }
    });

    const items = response.data.Items || [];
    const formatted = items.map((i: any, idx: number) => {
      const item = i.Item;
      return `${idx + 1}. [${item.itemPrice}円] ${item.itemName}\n   URL: ${item.itemUrl}`;
    }).join('\n\n');

    logger.success(`✅ Found ${items.length} items.`);

    return { status: 'success', data: { keyword, count: items.length, results: formatted } };
  } catch (err: any) {
    throw new Error(`Rakuten API Failure: ${err.message}`);
  }
});
