import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { runAsyncSkill } from '@agent/core';
import { validateFilePath } from '@agent/core/validators';
import { convertToPPTX } from './lib.js';

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
    description: 'Output PPTX file path',
  })
  .option('theme', {
    alias: 't',
    type: 'string',
    description: 'Path to custom CSS theme',
  })
  .parseSync();

runAsyncSkill('ppt-artisan', async () => {
  const inputPath = validateFilePath(argv.input as string, 'input markdown');
  const outputPath = path.resolve(argv.out as string);

  const markdownContent = fs.readFileSync(inputPath, 'utf8');
  const markdownArtifact = {
    title: path.basename(inputPath, '.md'),
    body: markdownContent,
    format: 'markdown' as const,
  };

  let themeArtifact;
  if (argv.theme) {
    const themePath = validateFilePath(argv.theme as string, 'theme css');
    const themeContent = fs.readFileSync(themePath, 'utf8');
    themeArtifact = {
      title: path.basename(themePath, '.css'),
      body: themeContent,
      format: 'text' as const,
    };
  }

  const result = await convertToPPTX({
    markdown: markdownArtifact,
    outputPath,
    theme: themeArtifact,
  });

  return result;
});
