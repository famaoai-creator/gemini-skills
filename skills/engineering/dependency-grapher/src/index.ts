import * as fs from 'fs';
import * as path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { runSkill } from '@agent/core';
import { safeWriteFile } from '@agent/core/secure-io';
import { generateMermaidGraph } from './lib.js';

const argv = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    demandOption: true,
    description: 'Root directory to scan for skills',
  })
  .option('out', {
    alias: 'o',
    type: 'string',
    description: 'Output path for Mermaid file',
  })
  .parseSync();

runSkill('dependency-grapher', () => {
  const rootDir = path.resolve(argv.input as string);
  const output = (argv.out as string) || 'evidence/dependency-map.mmd';

  const result = generateMermaidGraph(rootDir);

  safeWriteFile(output, result.mermaid);
  return {
    status: 'success',
    skillsScanned: result.skillCount,
    outputPath: output,
  };
});
