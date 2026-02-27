import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { runSkill } from '@agent/core';
import { safeWriteFile } from '@agent/core/secure-io';
import { 
  translateContent, 
  extractKeyPoints, 
  generateOutput, 
  AUDIENCE_PROFILES, 
  CommunicationResult 
} from './lib.js';

const argv = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    demandOption: true,
    description: 'Path to technical document or JSON report',
  })
  .option('audience', {
    alias: 'a',
    type: 'string',
    default: 'executive',
    choices: ['executive', 'board', 'marketing', 'sales', 'all-hands'],
    description: 'Target audience',
  })
  .option('format', {
    alias: 'f',
    type: 'string',
    default: 'summary',
    choices: ['summary', 'email', 'presentation', 'memo'],
    description: 'Output format',
  })
  .option('out', {
    alias: 'o',
    type: 'string',
    description: 'Output file path',
  })
  .parseSync();

runSkill('stakeholder-communicator', () => {
  const resolved = path.resolve(argv.input as string);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }

  const raw = fs.readFileSync(resolved, 'utf8');
  let content = raw;

  try {
    const json = JSON.parse(raw);
    content = JSON.stringify(json, null, 2);
    if (json.data) {
      content = JSON.stringify(json.data, null, 2);
    }
  } catch (_e) {
    /* plain text */
  }

  const { translations } = translateContent(content);
  const keyPoints = extractKeyPoints(content);
  const output = generateOutput(content, argv.audience as string, argv.format as string, keyPoints, translations);

  const result: CommunicationResult = {
    source: path.basename(resolved),
    audience: argv.audience as string,
    format: argv.format as string,
    audienceProfile: AUDIENCE_PROFILES[argv.audience as string],
    translationsApplied: translations,
    keyPoints,
    output,
  };

  if (argv.out) {
    const outPath = argv.out as string;
    if (outPath.endsWith('.md')) {
      const md = [
        `# ${output.headline}`,
        '',
        output.summary,
        '',
        '## Key Points',
        ...keyPoints.map((p) => `- ${p.value}`),
        '',
      ].join('
');
      safeWriteFile(outPath, md);
    } else {
      safeWriteFile(outPath, JSON.stringify(result, null, 2));
    }
  }

  return result;
});
