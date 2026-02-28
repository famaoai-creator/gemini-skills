import * as fs from 'node:fs';
import * as path from 'node:path';
import { runSkill } from '@agent/core';
import { createStandardYargs } from '@agent/core/cli-utils';
import { safeWriteFile, safeReadFile } from '@agent/core/secure-io';
import { scanKnowledge, findDuplicates } from './lib.js';

const argv = createStandardYargs()
  .option('dir', { alias: 'd', type: 'string', default: 'knowledge' })
  .option('action', { alias: 'a', type: 'string', default: 'audit' })
  .option('out', { alias: 'o', type: 'string' })
  .parseSync();

if (require.main === module || (typeof process !== 'undefined' && process.env.VITEST !== 'true')) {
  runSkill('knowledge-refiner', () => {
    const targetDir = path.resolve(argv.dir as string);
    if (!fs.existsSync(targetDir)) throw new Error(`Directory not found: ${targetDir}`);

    const files = scanKnowledge(targetDir);
    const duplicates = findDuplicates(files);

    const result = {
      directory: targetDir,
      action: argv.action,
      summary: {
        totalFiles: files.length,
        totalWords: files.reduce((s, f) => s + f.words, 0),
        totalLines: files.reduce((s, f) => s + f.lines, 0),
      },
      duplicateCount: duplicates.length,
      duplicates: duplicates.slice(0, 20),
      recommendations: duplicates.length > 0 ? [`${duplicates.length} duplicate(s) found`] : [],
    };

    if (argv.out) safeWriteFile(argv.out as string, JSON.stringify(result, null, 2));
    return result;
  });
}
