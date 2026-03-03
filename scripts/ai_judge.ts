/**
 * scripts/ai_judge.ts
 * Grades mission outcomes based on persona-specific criteria.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { logger, safeReadFile, safeWriteFile } from '@agent/core';

const PERSONA_CRITERIA: Record<string, { weight: number; focus: string }> = {
  'Ruthless Auditor': { weight: 1.2, focus: 'Risk & Compliance' },
  'Pragmatic CTO': { weight: 1.0, focus: 'Efficiency & Scalability' },
  'Empathetic CXO': { weight: 0.8, focus: 'UX & Accessibility' },
  'Ecosystem Architect': { weight: 1.1, focus: 'Structural Integrity' },
  'Security Reviewer': { weight: 1.3, focus: 'Security & PII' }
};

export function judge(missionDir: string) {
  const missionId = path.basename(missionDir);
  const reportPath = path.join(missionDir, 'ace-report.json');
  const logPath = path.join(missionDir, 'execution.log');

  if (!fs.existsSync(reportPath)) return null;

  try {
    const report = JSON.parse(safeReadFile(reportPath, { encoding: 'utf8' }) as string);
    let logContent = fs.existsSync(logPath) ? safeReadFile(logPath, { encoding: 'utf8' }) as string : '';

    const assignedRole = report.role || 'Ecosystem Architect';
    let judgePersona = 'Ecosystem Architect';
    
    if (assignedRole.includes('Security')) judgePersona = 'Security Reviewer';
    else if (assignedRole.includes('PMO') || assignedRole.includes('Auditor')) judgePersona = 'Ruthless Auditor';
    else if (assignedRole.includes('Developer') || assignedRole.includes('CTO')) judgePersona = 'Pragmatic CTO';

    const criteria = PERSONA_CRITERIA[judgePersona];
    let baseScore = report.status === 'success' ? 85 : 40;
    const errorCount = (logContent.match(/ERROR/g) || []).length;
    baseScore -= errorCount * 5;

    const finalScore = Math.max(0, Math.min(100, Math.round(baseScore * criteria.weight)));
    
    let grade = 'F';
    if (finalScore >= 90) grade = 'S';
    else if (finalScore >= 80) grade = 'A';
    else if (finalScore >= 70) grade = 'B';
    else if (finalScore >= 60) grade = 'C';
    else if (finalScore >= 40) grade = 'D';

    const evaluation = {
      missionId,
      judge: judgePersona,
      focus: criteria.focus,
      score: finalScore,
      grade,
      timestamp: new Date().toISOString()
    };

    safeWriteFile(path.join(missionDir, 'ai-evaluation.json'), JSON.stringify(evaluation, null, 2));
    return evaluation;
  } catch (err: any) {
    logger.error(`[AI-Judge] Error: ${err.message}`);
    return null;
  }
}

async function main() {
  const target = process.argv[2];
  if (target && fs.existsSync(target)) {
    const result = judge(target);
    if (result) logger.info(`Mission graded: ${result.grade} (${result.score}/100)`);
  }
}

if (require.main === module) {
  main().catch(err => {
    logger.error(err.message);
    process.exit(1);
  });
}
