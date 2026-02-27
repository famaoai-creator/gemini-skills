import * as path from 'node:path';
import { runSkill } from '@agent/core';
import { safeWriteFile } from '@agent/core/secure-io';
import * as pathResolver from '@agent/core/path-resolver';
import { generateNikoNikoMarkdown, Session } from './lib.js';

const mockSessions: Session[] = [
  { date: '2026-02-01', mood: 'Flow', icon: '😄', note: 'High velocity coding' },
  { date: '2026-02-02', mood: 'Normal', icon: '🙂', note: 'Routine maintenance' },
];

if (require.main === module || (typeof process !== 'undefined' && process.env.VITEST !== 'true')) {
  runSkill('biometric-context-adapter', () => {
    const rootDir = pathResolver.rootDir();
    const reportPath = path.join(rootDir, 'work/niko_niko_calendar.md');

    const markdown = generateNikoNikoMarkdown(mockSessions);
    safeWriteFile(reportPath, markdown);

    return { output: reportPath, sessions: mockSessions.length };
  });
}
