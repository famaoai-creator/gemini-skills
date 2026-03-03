#!/usr/bin/env node
/**
 * ppt-artisan/scripts/convert.cjs
 * Universal PowerPoint Generator using Marp CLI.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { runAsyncSkill } = require('@agent/core');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const parser = yargs(hideBin(process.argv))
  .option('input', { alias: 'i', type: 'string', required: true, description: 'Input Markdown file' })
  .option('out', { alias: 'o', type: 'string', required: true, description: 'Output PPTX/PDF file' })
  .option('format', { type: 'string', default: 'pptx', choices: ['pptx', 'pdf'] });

runAsyncSkill('ppt-artisan', async () => {
  const argv = parser.parseSync();
  const inputPath = path.resolve(argv.input);
  const outputPath = path.resolve(argv.out);

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  // Use local marp if possible, fallback to npx
  const localMarp = path.resolve(__dirname, '../node_modules/.bin/marp');
  const marpCmd = fs.existsSync(localMarp) ? `"${localMarp}"` : 'npx -y @marp-team/marp-cli';

  // Build command
  const flags = argv.format === 'pptx' ? '--pptx --pptx-editable' : '--pdf';
  const cmd = `${marpCmd} "${inputPath}" ${flags} -o "${outputPath}" --allow-local-files`;

  console.log(`[PPT-ARTISAN] Converting ${path.basename(inputPath)} to ${argv.format.toUpperCase()}...`);
  
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    throw new Error(`Marp conversion failed: ${err.message}`);
  }

  return { 
    status: 'success', 
    file: path.basename(outputPath), 
    format: argv.format,
    path: outputPath 
  };
});
