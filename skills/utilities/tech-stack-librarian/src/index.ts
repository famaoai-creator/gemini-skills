import * as fs from 'node:fs';
import * as path from 'node:path';
import { runSkill } from '@agent/core';
import { createStandardYargs } from '@agent/core/cli-utils';
import { detectStack } from './lib.js';

const argv = createStandardYargs()
  .option('dir', { alias: 'd', type: 'string', default: '.' })
  .parseSync();

const BEST_PRACTICES = {
  typescript: { category: 'Language', practices: ['Use strict mode'] },
  docker: { category: 'Container', practices: ['Use multi-stage builds'] },
};

if (require.main === module || (typeof process !== 'undefined' && process.env.VITEST !== 'true')) {
  runSkill('tech-stack-librarian', () => {
    const targetDir = path.resolve(argv.dir as string);
    const stack = detectStack(targetDir, BEST_PRACTICES);
    return { directory: targetDir, stack };
  });
}
