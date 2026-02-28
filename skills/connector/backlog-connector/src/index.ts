import { safeReadFile } from '@agent/core/secure-io';
import { runSkillAsync } from '@agent/core';
import * as pathResolver from '@agent/core/path-resolver';
import axios from 'axios';

if (require.main === module || (typeof process !== 'undefined' && process.env.VITEST !== 'true')) {
  runSkillAsync('backlog-connector', async () => {
    // 引数の取得
    const args = process.argv.slice(2);
    const projectKeyArg = args.find(a => a.startsWith('--project='))?.split('=')[1] || 
                          (args.includes('--project') ? args[args.indexOf('--project') + 1] : null);
    const countArg = parseInt(args.find(a => a.startsWith('--count='))?.split('=')[1] || 
                     (args.includes('--count') ? args[args.indexOf('--count') + 1] : '20'));
    const offsetArg = parseInt(args.find(a => a.startsWith('--offset='))?.split('=')[1] || 
                      (args.includes('--offset') ? args[args.indexOf('--offset') + 1] : '0'));

    if (!projectKeyArg) throw new Error('Missing required argument: --project');

    // 1. 共有知識（Confidential/Personal）の読み込み
    // アップグレードされた tier-guard により、safeReadFile での読み取りが許可されます。
    const inventoryPath = pathResolver.resolve('knowledge/confidential/connections/inventory.json');
    const credsPath = pathResolver.resolve('knowledge/personal/connections/backlog.json');

    console.error(`Loading config via SECURE-IO: ${inventoryPath}`);
    
    const inventory = JSON.parse(safeReadFile(inventoryPath, { encoding: 'utf8' }) as string);
    const backlogSys = inventory.systems.backlog;

    const creds = JSON.parse(safeReadFile(credsPath, { encoding: 'utf8' }) as string);
    const apiKey = creds.apiKey;

    const projectInfo = backlogSys.projects[projectKeyArg];
    const actualProjectId = projectInfo ? projectInfo.id : projectKeyArg;

    try {
      const response = await axios.get(`${backlogSys.space_url}/api/v2/issues`, {
        params: {
          apiKey: apiKey,
          'projectId[]': [actualProjectId],
          count: countArg,
          offset: offsetArg,
          sort: 'created',
          order: 'desc'
        }
      });

      return { 
        project: projectKeyArg, 
        count: response.data.length,
        offset: offsetArg,
        issues: response.data.map((i: any) => ({ key: i.issueKey, summary: i.summary }))
      };
    } catch (e: any) {
      console.error(`Backlog API Error: ${e.message}`);
      throw e;
    }
  });
}
