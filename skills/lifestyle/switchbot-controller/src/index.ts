// @ts-ignore
import { runSkillAsync } from '@agent/core';
const { logger, safeReadFile } = require('@agent/core/secure-io');
const pathResolver = require('@agent/core/path-resolver');
import axios from 'axios';
import * as fs from 'node:fs';
import * as crypto from 'node:crypto';

interface SkillArgs {
  action?: string;
  deviceId?: string;
  cmd?: string;
  param?: string;
  _: string[];
}

function getHeaders(token: string, secret: string) {
  const nonce = crypto.randomUUID();
  const t = Date.now();
  const data = token + t + nonce;
  const sign = crypto.createHmac('sha256', secret).update(data).digest('base64');
  return {
    'Authorization': token,
    'sign': sign,
    'nonce': nonce,
    't': t,
    'Content-Type': 'application/json; charset=utf8'
  };
}

runSkillAsync('switchbot-controller', async (args: SkillArgs) => {
  const safeArgs = args || { _: [] };
  const action = safeArgs.action || (safeArgs._ && safeArgs._[0]) || 'list-devices';

  const credPath = pathResolver.rootResolve('knowledge/personal/connections/switchbot/switchbot-credentials.json');
  const endpointPath = pathResolver.rootResolve('knowledge/common/api-endpoints.json');

  if (!fs.existsSync(credPath)) throw new Error('SwitchBot credentials missing.');
  
  const { openToken, secret } = JSON.parse(safeReadFile(credPath, { encoding: 'utf8' }));
  const endpoints = JSON.parse(safeReadFile(endpointPath, { encoding: 'utf8' }));
  const baseUrl = endpoints.switchbot.base_url;

  const headers = getHeaders(openToken, secret);

  try {
    if (action === 'list-devices') {
      logger.info('📱 [Lifestyle] Fetching SwitchBot devices...');
      const res = await axios.get(baseUrl, { headers });
      const list = [...(res.data.body.deviceList || []), ...(res.data.body.infraredRemoteList || [])];
      const output = list.map((d: any) => '- [' + d.deviceId + '] ' + d.deviceName + ' (' + d.deviceType + ')').join('\n');
      return { status: 'success', data: output };
    } else if (action === 'control') {
      const { deviceId, cmd, param = 'default' } = safeArgs;
      if (!deviceId || !cmd) throw new Error('Missing deviceId or cmd.');
      await axios.post(baseUrl + '/' + deviceId + '/commands', { command: cmd, parameter: param, commandType: 'command' }, { headers });
      return { status: 'success', message: 'Command sent.' };
    }
  } catch (err: any) {
    throw new Error('SwitchBot Failure: ' + err.message);
  }
});
