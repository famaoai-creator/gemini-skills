import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { runSkill } from '@agent/core';
import { safeWriteFile } from '@agent/core/secure-io';
import { processImpactAnalysis, AnalysisInput } from './lib.js';

const argv = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    demandOption: true,
    description: 'Path to JSON file with engineering metrics',
  })
  .option('out', {
    alias: 'o',
    type: 'string',
    description: 'Output file path',
  })
  .parseSync();

runSkill('business-impact-analyzer', () => {
  const resolved = path.resolve(argv.input as string);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }

  const inputContent = fs.readFileSync(resolved, 'utf8');
  const input = JSON.parse(inputContent) as AnalysisInput;

  const result = processImpactAnalysis(input);
  const resultWithSource = {
    ...result,
    source: path.basename(resolved),
  };

  if (argv.out) {
    safeWriteFile(argv.out as string, JSON.stringify(resultWithSource, null, 2));
  }

  return resultWithSource;
});
