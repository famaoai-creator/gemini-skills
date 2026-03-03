/**
 * scripts/archive_missions.ts
 * Moves completed mission data from active/ to evidence/.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { logger } from '@agent/core/core';
import { safeReadFile } from '@agent/core';
import * as pathResolver from '@agent/core/path-resolver';

const activeMissionsDir = pathResolver.active('missions');
const evidenceMissionsDir = path.join(process.cwd(), 'evidence/missions');

async function main() {
  if (!fs.existsSync(activeMissionsDir)) {
    logger.info('No active missions directory found.');
    return;
  }

  const targetMid = process.env.MISSION_ID;
  const missions = fs.readdirSync(activeMissionsDir).filter(f => {
    const isDir = fs.lstatSync(path.join(activeMissionsDir, f)).isDirectory();
    return targetMid ? (isDir && f === targetMid) : isDir;
  });

  let archivedCount = 0;

  for (const mission of missions) {
    const missionDir = path.join(activeMissionsDir, mission);
    const reportPath = path.join(missionDir, 'ace-report.json');

    try {
      if (fs.existsSync(reportPath)) {
        const report = JSON.parse(safeReadFile(reportPath, { encoding: 'utf8' }) as string);
        const date = new Date(report.timestamp || Date.now());
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const targetDir = path.join(evidenceMissionsDir, yearMonth, mission);

        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
        fs.cpSync(missionDir, targetDir, { recursive: true });
        fs.rmSync(missionDir, { recursive: true, force: true });

        logger.success(`Archived mission ${mission} to ${yearMonth}`);
        archivedCount++;
      } else {
        // Handle orphaned missions (> 7 days)
        const stat = fs.statSync(missionDir);
        if ((Date.now() - stat.mtimeMs) > 7 * 24 * 60 * 60 * 1000) {
          const targetDir = path.join(evidenceMissionsDir, 'orphaned', mission);
          if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
          fs.cpSync(missionDir, targetDir, { recursive: true });
          fs.rmSync(missionDir, { recursive: true, force: true });
          logger.info(`Archived orphaned mission ${mission}`);
          archivedCount++;
        }
      }
    } catch (err: any) {
      logger.error(`Failed to archive ${mission}: ${err.message}`);
    }
  }

  if (archivedCount > 0) logger.success(`Successfully archived ${archivedCount} missions.`);
}

main().catch(err => {
  logger.error(err.message);
  process.exit(1);
});
