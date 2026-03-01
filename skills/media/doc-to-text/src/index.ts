import path from 'path';
import fs from 'fs';
import { runAsyncSkill } from '@agent/core';
import { createStandardYargs } from '@agent/core/cli-utils';
import { extractText } from './lib.js';

const parser = createStandardYargs()
  .positional('file', {
    type: 'string',
    description: 'Path to the document file to extract text from'
  });

runAsyncSkill('doc-to-text', async () => {
  const argv = parser.parseSync();
  const filePath = path.resolve((argv._[0] as string) || (argv.file as string));
  
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error(`Valid file path required. Provided: ${filePath}`);
  }

  const result = await extractText(filePath);

  return {
    status: 'success',
    file: path.basename(filePath),
    format: result.format,
    content: result.content,
    metadata: result.metadata
  };
});
