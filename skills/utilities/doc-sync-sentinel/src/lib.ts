import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Doc-Sync Sentinel Core Library.
 */

export interface SyncStatus {
  file: string;
  synced: boolean;
  lastUpdated: string;
}

export function checkSync(srcFile: string, targetFile: string): SyncStatus {
  if (!fs.existsSync(srcFile) || !fs.existsSync(targetFile)) {
    return { file: path.basename(srcFile), synced: false, lastUpdated: 'never' };
  }

  const srcStat = fs.statSync(srcFile);
  const targetStat = fs.statSync(targetFile);

  return {
    file: path.basename(srcFile),
    synced: targetStat.mtime >= srcStat.mtime,
    lastUpdated: targetStat.mtime.toISOString()
  };
}
