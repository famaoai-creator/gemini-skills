import '@agent/core/secure-io'; // Enforce security boundaries
import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { runAsyncSkill } from '@agent/core';
import { validateFilePath } from '@agent/core/validators';
import { composePDF } from './lib.js';


const argv = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    demandOption: true,
    description: 'Path to input Markdown file',
  })
  .option('out', {
    alias: 'o',
    type: 'string',
    demandOption: true,
    description: 'Output PDF file path',
  })
  .parseSync();

runAsyncSkill('pdf-composer', async () => {
  const inputPath = validateFilePath(argv.input as string, 'input markdown');
  const outputPath = path.resolve(argv.out as string);

  const mdContent = fs.readFileSync(inputPath, 'utf8');

  const result = await composePDF(
    { title: path.basename(inputPath), body: mdContent, format: 'markdown' },
    {
      outputPath,
    }
  );

  return result;
});
