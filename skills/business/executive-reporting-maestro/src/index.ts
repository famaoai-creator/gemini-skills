import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { runSkill } from '@agent/core';
import { safeWriteFile } from '@agent/core/secure-io';
import { processReport, generateMarkdown, SkillResult } from './lib.js';

const argv = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    demandOption: true,
    description: 'Path to a directory of JSON result files or a single JSON file',
  })
  .option('title', {
    alias: 't',
    type: 'string',
    default: 'Executive Status Report',
    description: 'Report title',
  })
  .option('out', {
    alias: 'o',
    type: 'string',
    description: 'Output file path (JSON or .md)',
  })
  .parseSync();

function loadResults(inputPath: string): SkillResult[] {
  const results: SkillResult[] = [];
  const stat = fs.statSync(inputPath);

  if (stat.isFile()) {
    const content = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    if (Array.isArray(content)) {
      results.push(...content);
    } else {
      results.push(content as SkillResult);
    }
  } else if (stat.isDirectory()) {
    const files = fs.readdirSync(inputPath).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(inputPath, file), 'utf8'));
        results.push(content as SkillResult);
      } catch (_e) {
        /* skip invalid JSON */
      }
    }
  }

  return results;
}

runSkill('executive-reporting-maestro', () => {
  const resolved = path.resolve(argv.input as string);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Path not found: ${resolved}`);
  }

  const results = loadResults(resolved);
  if (results.length === 0) {
    throw new Error('No valid JSON results found in the input path');
  }

  const report = processReport(argv.title as string, results);

  if (argv.out) {
    const outPath = argv.out as string;
    if (outPath.endsWith('.md')) {
      safeWriteFile(outPath, generateMarkdown(report));
    } else {
      safeWriteFile(outPath, JSON.stringify(report, null, 2));
    }
  }

  return report;
});
