import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { runSkill } from '@agent/core';
import { safeWriteFile } from '@agent/core/secure-io';
import { processAudit, Stage } from './lib.js';

const argv = yargs(hideBin(process.argv))
  .option('dir', {
    alias: 'd',
    type: 'string',
    default: '.',
    description: 'Project directory to audit',
  })
  .option('stage', {
    alias: 's',
    type: 'string',
    default: 'series-a',
    choices: ['seed', 'series-a', 'series-b', 'ipo'],
    description: 'Fundraising stage',
  })
  .option('out', {
    alias: 'o',
    type: 'string',
    description: 'Output file path',
  })
  .parseSync();

runSkill('investor-readiness-audit', () => {
  const targetDir = path.resolve(argv.dir as string);
  if (!fs.existsSync(targetDir)) {
    throw new Error(`Directory not found: ${targetDir}`);
  }

  const result = processAudit(targetDir, argv.stage as Stage);

  if (argv.out) {
    safeWriteFile(argv.out as string, JSON.stringify(result, null, 2));
  }

  return result;
});
