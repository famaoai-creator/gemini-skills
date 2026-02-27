import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { runAsyncSkill } from '@agent/core';
import { safeWriteFile } from '@agent/core/secure-io';
import { transcribeAudio } from './lib.js';

const argv = yargs(hideBin(process.argv))
  .option('file', {
    alias: 'f',
    type: 'string',
    demandOption: true,
    description: 'Path to audio/video file',
  })
  .option('key', {
    alias: 'k',
    type: 'string',
    description: 'OpenAI API Key',
  })
  .option('out', {
    alias: 'o',
    type: 'string',
    description: 'Output file path',
  })
  .parseSync();

const apiKey = (argv.key as string) || process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('Error: OpenAI API Key required via --key or OPENAI_API_KEY env var.');
  process.exit(1);
}

runAsyncSkill('audio-transcriber', async () => {
  const filePath = path.resolve(argv.file as string);
  const result = await transcribeAudio(filePath, { apiKey });

  if (argv.out) {
    safeWriteFile(argv.out as string, result.text);
    return { output: argv.out, textLength: result.text.length };
  }

  return result;
});
