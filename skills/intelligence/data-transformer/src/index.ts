import { runSkill } from '@agent/core';
import { createStandardYargs } from '@agent/core/cli-utils';
import { validateFilePath, requireArgs } from '@agent/core/validators';
import { safeWriteFile, safeReadFile } from '@agent/core/secure-io';
import { detectFormat, parseData, stringifyData, DataFormat } from './logic.js';

const argv = createStandardYargs()
  .option('input', {
    alias: 'i',
    type: 'string',
    demandOption: true,
    description: 'Input file path (.json, .yaml, .csv)',
  })
  .option('to', {
    alias: 'F',
    type: 'string',
    choices: ['json', 'yaml', 'csv'],
    demandOption: true,
    description: 'Target format',
  })
  .option('out', { alias: 'o', type: 'string', description: 'Output file path (optional)' })
  .parseSync();

if (require.main === module || (typeof process !== 'undefined' && process.env.VITEST !== 'true')) {
  runSkill('data-transformer', () => {
    requireArgs(argv as any, ['input', 'to']);
    const inputPath = validateFilePath(argv.input as string, 'input');
    const content = safeReadFile(inputPath, { encoding: 'utf8' }) as string;
    const inputFormat = detectFormat(inputPath);
    if (inputFormat === 'unknown') {
      throw new Error(`Unsupported or unknown format for input file: ${inputPath}`);
    }

    const data = parseData(content, inputFormat);
    const output = stringifyData(data, argv.to as DataFormat);

    if (argv.out) {
      safeWriteFile(argv.out as string, output);
      return {
        message: `Successfully transformed to ${argv.to}`,
        output: argv.out,
        format: argv.to,
        size: output.length,
      };
    } else {
      return {
        format: argv.to,
        content: output,
      };
    }
  });
}
