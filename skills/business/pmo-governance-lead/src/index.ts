import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { runSkill } from '@agent/core';
import { safeWriteFile } from '@agent/core/secure-io';
import { processGovernanceAudit, QUALITY_GATES } from './lib.js';

const argv = yargs(hideBin(process.argv))
  .option('dir', {
    alias: 'd',
    type: 'string',
    default: '.',
    description: 'Project directory to audit',
  })
  .option('phase', {
    alias: 'p',
    type: 'string',
    choices: ['requirements', 'design', 'implementation', 'testing', 'deployment', 'all'],
    default: 'all',
    description: 'SDLC phase to check',
  })
  .option('out', {
    alias: 'o',
    type: 'string',
    description: 'Output file path',
  })
  .parseSync();

runSkill('pmo-governance-lead', () => {
  const targetDir = path.resolve(argv.dir as string);
  if (!fs.existsSync(targetDir)) {
    throw new Error(`Directory not found: ${targetDir}`);
  }

  const result = processGovernanceAudit(targetDir, argv.phase as string);

  if (argv.out) {
    safeWriteFile(argv.out as string, JSON.stringify(result, null, 2));
  }

  return result;
});
