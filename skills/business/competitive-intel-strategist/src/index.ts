import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { runSkill } from '@agent/core';
import { safeWriteFile } from '@agent/core/secure-io';
import { processCompetitiveAnalysis, CompetitiveInput } from './lib.js';

const argv = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    demandOption: true,
    description: 'Path to JSON file with competitive data',
  })
  .option('out', {
    alias: 'o',
    type: 'string',
    description: 'Output file path',
  })
  .parseSync();

runSkill('competitive-intel-strategist', () => {
  const resolved = path.resolve(argv.input as string);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }

  const inputContent = fs.readFileSync(resolved, 'utf8');
  const input = JSON.parse(inputContent) as CompetitiveInput;

  if (!input.our_product) {
    throw new Error('Input must contain "our_product" object');
  }

  const result = processCompetitiveAnalysis(input);
  const resultWithSource = {
    ...result,
    source: path.basename(resolved),
  };

  if (argv.out) {
    safeWriteFile(argv.out as string, JSON.stringify(resultWithSource, null, 2));
  }

  return resultWithSource;
});
