import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { runSkill } from '@agent/core';
import { safeWriteFile } from '@agent/core/secure-io';
import { processTalentRequirements, RoleType } from './lib.js';

const argv = yargs(hideBin(process.argv))
  .option('dir', {
    alias: 'd',
    type: 'string',
    default: '.',
    description: 'Project directory',
  })
  .option('role', {
    alias: 'r',
    type: 'string',
    default: 'engineer',
    choices: ['engineer', 'senior-engineer', 'tech-lead', 'devops', 'qa'],
    description: 'Role type',
  })
  .option('out', {
    alias: 'o',
    type: 'string',
    description: 'Output file path',
  })
  .parseSync();

runSkill('talent-requirement-generator', () => {
  const targetDir = path.resolve(argv.dir as string);
  if (!fs.existsSync(targetDir)) {
    throw new Error(`Directory not found: ${targetDir}`);
  }

  const result = processTalentRequirements(targetDir, argv.role as RoleType);

  if (argv.out) {
    safeWriteFile(argv.out as string, JSON.stringify(result, null, 2));
  }

  return result;
});
