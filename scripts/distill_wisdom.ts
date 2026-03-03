/**
 * scripts/distill_wisdom.ts
 * Extracts reusable insights from mission evidence.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { logger, safeReadFile, safeWriteFile } from '@agent/core';
import * as pathResolver from '@agent/core/path-resolver';

const wisdomDir = pathResolver.knowledge('incidents');

function extractLessons(log: string, isSuccess: boolean): string {
  if (!log) return 'No logs available.';
  const lines = log.split('\n');
  const lessons: string[] = [];
  
  if (!isSuccess) {
    const errorLines = lines.filter(l => l.includes('ERROR') || l.includes('fail')).slice(-5);
    if (errorLines.length > 0) {
      lessons.push('### Failure Root Cause (Estimated)');
      lessons.push(errorLines.join('\n'));
    }
  }

  const observations = lines.filter(l => l.includes('Observation') || l.includes('Finding'));
  if (observations.length > 0) {
    lessons.push('### Key Observations');
    lessons.push(observations.slice(0, 5).join('\n'));
  }

  return lessons.length === 0 ? 'Execution completed without specific logged observations.' : lessons.join('\n\n');
}

export function distill(missionDir: string): string | null {
  const missionId = path.basename(missionDir);
  const reportPath = path.join(missionDir, 'ace-report.json');
  const logPath = path.join(missionDir, 'execution.log');

  if (!fs.existsSync(reportPath)) return null;

  try {
    const report = JSON.parse(safeReadFile(reportPath, { encoding: 'utf8' }) as string);
    let logContent = '';
    if (fs.existsSync(logPath)) logContent = safeReadFile(logPath, { encoding: 'utf8' }) as string;

    const isSuccess = report.status === 'success' || logContent.includes('[SUCCESS]');
    const category = isSuccess ? 'success-pattern' : 'incident-recovery';

    const content = `---
mission_id: ${missionId}
timestamp: ${report.timestamp || new Date().toISOString()}
category: ${category}
role: ${report.role || 'Unknown'}
---

# Wisdom Distilled from Mission ${missionId}

## 🎯 Intent
${report.intent || 'Unknown'}

## 📊 Outcome
**${isSuccess ? 'Victory Conditions Met' : 'Execution Failed'}**

## 📝 Summary
${report.summary || 'No summary provided.'}

## 💡 Key Lessons
${extractLessons(logContent, isSuccess)}
`;

    const filePath = path.join(wisdomDir, `distilled-${missionId}-${Date.now()}.md`);
    safeWriteFile(filePath, content);
    return filePath;
  } catch (err: any) {
    logger.error(`[Distiller] Error: ${err.message}`);
    return null;
  }
}

async function main() {
  const target = process.argv[2];
  if (target && fs.existsSync(target)) {
    const result = distill(target);
    if (result) logger.success(`Wisdom saved to ${result}`);
  }
}

if (require.main === module) {
  main().catch(err => {
    logger.error(err.message);
    process.exit(1);
  });
}
