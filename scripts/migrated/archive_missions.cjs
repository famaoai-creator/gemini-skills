#!/usr/bin/env node
/**
 * Mission Archiver Script v3.0
 * Moves completed mission data from active/ missions to evidence/ missions.
 * Standards-compliant version (Script Optimization Mission).
 */

const fs = require('fs');
const path = require('path');
const { logger, errorHandler, safeReadFile, pathResolver, requireRole } = require('./system-prelude.cjs');
const { distill } = require('./distill_wisdom.cjs');
const { judge } = require('./ai_judge.cjs');

requireRole('Ecosystem Architect');

const activeMissionsDir = pathResolver.active('missions');
const evidenceMissionsDir = pathResolver.rootResolve('evidence/missions');

function main() {
  if (!fs.existsSync(activeMissionsDir)) {
    logger.info('No active missions directory found.');
    process.exit(0);
  }

  const targetMid = process.env.MISSION_ID;
  const missions = fs
    .readdirSync(activeMissionsDir)
    .filter((f) => {
      try {
        const isDir = fs.lstatSync(path.join(activeMissionsDir, f)).isDirectory();
        if (targetMid) return isDir && f === targetMid;
        return isDir;
      } catch (_) {
        return false;
      }
    });

  let archivedCount = 0;

  for (const mission of missions) {
    const missionDir = path.join(activeMissionsDir, mission);
    const reportPath = path.join(missionDir, 'ace-report.json');

    if (fs.existsSync(reportPath)) {
      try {
        // YOLO: Evaluate and Distill wisdom BEFORE moving the directory
        const evaluation = judge(missionDir);
        if (evaluation) {
          logger.info(`[JUDGE] Mission ${mission} graded: ${evaluation.grade} (${evaluation.score}/100) by ${evaluation.judge}`);
        }

        const wisdomPath = distill(missionDir);
        if (wisdomPath) {
          logger.info(`[WISDOM] Distilled knowledge to ${path.basename(wisdomPath)}`);
        }

        const reportContent = safeReadFile(reportPath, { encoding: 'utf8' });
        const report = JSON.parse(reportContent);
        const timestamp = report.timestamp || new Date().toISOString();
        const date = new Date(timestamp);
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        const targetDir = path.join(evidenceMissionsDir, yearMonth, mission);

        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        // Move entire mission directory to evidence
        fs.cpSync(missionDir, targetDir, { recursive: true });
        fs.rmSync(missionDir, { recursive: true, force: true });

        logger.success(`Archived mission ${mission} to ${yearMonth}`);
        archivedCount++;
      } catch (err) {
        logger.error(`Failed to archive mission ${mission}: ${err.message}`);
      }
    } else {
      try {
        const stat = fs.statSync(missionDir);
        const ageDays = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60 * 24);
        if (ageDays > 7) {
          const targetDir = path.join(evidenceMissionsDir, 'orphaned', mission);
          if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
          fs.cpSync(missionDir, targetDir, { recursive: true });
          fs.rmSync(missionDir, { recursive: true, force: true });
          logger.info(`Archived orphaned mission ${mission} (No ace-report.json)`);
          archivedCount++;
        }
      } catch (err) {
        logger.error(`Failed to check orphan mission ${mission}: ${err.message}`);
      }
    }
  }

  if (archivedCount === 0) {
    logger.info('No missions needed archiving.');
  } else {
    logger.success(`Successfully archived ${archivedCount} missions.`);
  }
}

try {
  main();
} catch (err) {
  errorHandler(err, 'Mission Archiving Failed');
}
