import * as fs from 'node:fs';

export interface BoxConfigStatus {
  found: boolean;
  path: string | null;
}

export function checkBoxConfig(configPath?: string): BoxConfigStatus {
  if (configPath) {
    return { found: fs.existsSync(configPath), path: configPath };
  }
  const defaultPaths = [
    'knowledge/personal/box_config.json',
    'box_config.json',
    '.box/config.json',
  ];
  for (const p of defaultPaths) {
    if (fs.existsSync(p)) return { found: true, path: p };
  }
  return { found: false, path: null };
}

export function simulateBoxAction(action: string, folder: string, query?: string): any {
  const results: Record<string, any> = {
    status: {
      connected: false,
      mode: 'dry-run',
      message: 'Box API not called (dry-run mode).',
    },
    list: {
      folderId: folder,
      items: [
        { type: 'folder', id: 'sim-001', name: 'Documents' },
        { type: 'file', id: 'sim-002', name: 'report.pdf' },
      ],
    },
    download: { message: 'In live mode, would download files from folder ' + folder },
    search: {
      query,
      results: query ? [{ id: 'sim-003', name: query + '_result.doc', type: 'file' }] : [],
    },
  };
  return results[action] || { error: 'Unknown action' };
}
