/**
 * Boilerplate Genie Core Library.
 */

export interface ProjectDef {
  name: string;
  type: 'express' | 'react' | 'cli';
}

export function generateBoilerplate(def: ProjectDef): Record<string, string> {
  const files: Record<string, string> = {};
  
  if (def.type === 'express') {
    files['package.json'] = JSON.stringify({ name: def.name, dependencies: { express: '^4.18.0' } }, null, 2);
    files['index.js'] = 'const express = require("express");\nconst app = express();\napp.listen(3000);';
  } else if (def.type === 'cli') {
    files['package.json'] = JSON.stringify({ name: def.name, bin: './index.js' }, null, 2);
    files['index.js'] = '#!/usr/bin/env node\nconsole.log("Hello CLI");';
  }

  return files;
}
