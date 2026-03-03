import * as path from 'node:path';
import { runSkill } from '@agent/core';
import { createStandardYargs } from '@agent/core/cli-utils';
import { loadDomainRules, classifyDomain } from './lib.js';
import pathResolver from '@agent/core/path-resolver';

const argv = createStandardYargs()
  .option('input', {
    alias: 'i',
    type: 'string',
    demandOption: true,
  })
  .parseSync();

if (require.main === module || (typeof process !== 'undefined' && process.env.VITEST !== 'true')) {
  runSkill('domain-classifier', () => {
    const rulesPath = path.join(pathResolver.rootDir(), 'knowledge/classifiers/domain-rules.yml');
    const rules = loadDomainRules(rulesPath);
    return classifyDomain(argv.input as string, rules);
  });
}
