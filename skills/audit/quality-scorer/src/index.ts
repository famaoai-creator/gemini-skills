import path from 'path';
import fs from 'fs';
import { runSkill } from '@agent/core';
import { createStandardYargs } from '@agent/core/cli-utils';
import { safeWriteFile } from '@agent/core/secure-io';
import { calculateScore } from './lib.js';

const parser = createStandardYargs()
  .option('content', { alias: 'c', type: 'string', description: 'Content to score' })
  .option('file', { alias: 'f', type: 'string', description: 'File to score' })
  .option('out', { alias: 'o', type: 'string', description: 'Output JSON path' });

runSkill('quality-scorer', () => {
  const argv = parser.parseSync();
  const target = argv.file ? fs.readFileSync(path.resolve(argv.file as string), 'utf8') : (argv.content as string);
  if (!target) throw new Error('No content or file provided.');

  const result = calculateScore(target);

  if (argv.out) safeWriteFile(argv.out as string, JSON.stringify(result, null, 2));
  return result;
});
