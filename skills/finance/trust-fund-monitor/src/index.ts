// @ts-ignore
import { runSkillAsync } from '@agent/core';
const { logger, safeReadFile, safeWriteFile } = require('@agent/core/secure-io');
const pathResolver = require('@agent/core/path-resolver');
import axios from 'axios';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface SkillArgs {
  action?: string;
  code?: string;
  _: string[];
}

runSkillAsync('trust-fund-monitor', async (args: SkillArgs) => {
  const safeArgs = args || { _: [] };
  const action = safeArgs.action || (safeArgs._ && safeArgs._[0]) || 'get-nav';
  let fundCode = safeArgs.code;

  const endpointPath = pathResolver.rootResolve('knowledge/common/api-endpoints.json');
  const aliasPath = pathResolver.rootResolve('knowledge/finance/fund-aliases.json');

  const endpoints = JSON.parse(safeReadFile(endpointPath, { encoding: 'utf8' }));
  const fundData = JSON.parse(safeReadFile(aliasPath, { encoding: 'utf8' }));

  if (fundCode && fundData.aliases[fundCode.toLowerCase()]) {
    fundCode = fundData.aliases[fundCode.toLowerCase()];
  }

  try {
    if (action === 'get-nav') {
      if (!fundCode) throw new Error('Fund code or alias required.');
      logger.info('💰 [Finance] Fetching NAV for: ' + fundCode);
      const url = endpoints.mufg.csv_base + fundCode + '/';
      
      try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const raw = response.data.toString('binary');
        const lines = raw.trim().split('\n');
        if (lines.length > 1) {
          const latest = lines[lines.length - 1].split(',');
          const date = latest[0].replace(/"/g, '');
          const nav = latest[1].replace(/"/g, '');
          return { status: 'success', data: { date, nav } };
        }
      } catch (e) {
        return { 
          status: 'needs_attention', 
          message: 'API Key may be required for REST v1.',
          url: endpoints.mufg.rest_v1 
        };
      }
    } else if (action === 'list-aliases') {
      return { status: 'success', data: fundData.aliases };
    }
  } catch (err: any) {
    throw new Error('Finance Monitor Failure: ' + err.message);
  }
});
