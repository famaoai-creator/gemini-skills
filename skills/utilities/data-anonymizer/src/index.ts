import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { runSkill } from '@agent/core';
import { safeWriteFile } from '@agent/core/secure-io';
import { anonymize } from './lib.js';

const argv = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    demandOption: true,
    description: 'Path to input JSON file',
  })
  .option('out', {
    alias: 'o',
    type: 'string',
    description: 'Output file path',
  })
  .parseSync();

runSkill('data-anonymizer', () => {
  const inputPath = path.resolve(argv.input as string);

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const rawData = fs.readFileSync(inputPath, 'utf8');
  const jsonData = JSON.parse(rawData);

  const anonymizedData = anonymize(jsonData);

  if (argv.out) {
    const outputPath = path.resolve(argv.out as string);
    safeWriteFile(outputPath, JSON.stringify(anonymizedData, null, 2));
    return {
      status: 'success',
      output: outputPath,
      message: 'Sensitive data masked successfully.',
    };
  }

  return { status: 'success', data: anonymizedData };
});
