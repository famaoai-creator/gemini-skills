import { runSkill } from '@agent/core';
import { createStandardYargs } from '@agent/core/cli-utils';
import { saveFact, searchMemory } from './lib.js';

const argv = createStandardYargs()
  .option('action', { alias: 'a', type: 'string', choices: ['save', 'search'], demandOption: true })
  .option('fact', { alias: 'f', type: 'string' })
  .option('query', { alias: 'q', type: 'string' })
  .option('category', { alias: 'c', type: 'string', default: 'general' })
  .parseSync();

if (require.main === module || (typeof process !== 'undefined' && process.env.VITEST !== 'true')) {
  runSkill('sovereign-memory', () => {
    if (argv.action === 'save') {
      if (!argv.fact) throw new Error('Fact is required for save action');
      return saveFact(argv.fact as string, argv.category as string);
    } else {
      if (!argv.query) throw new Error('Query is required for search action');
      return searchMemory(argv.query as string);
    }
  });
}
