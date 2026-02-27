import * as fs from 'node:fs';
import * as path from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { runSkill } from '@agent/core';
import { safeWriteFile } from '@agent/core/secure-io';
import { getAllFiles } from '@agent/core/fs-utils';
import { scanForSuspicious, parsePackageJson, generateSBOM, detectDependencyConfusion } from './lib.js';

const argv = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    default: '.',
    description: 'Project directory to audit for supply chain',
  })
  .option('sbom', {
    type: 'boolean',
    default: false,
    description: 'Generate CycloneDX SBOM',
  })
  .option('internal-prefixes', {
    type: 'string',
    description: 'Comma-separated internal package name prefixes (for dependency confusion check)',
  })
  .option('out', {
    alias: 'o',
    type: 'string',
    description: 'Output path for report',
  })
  .help()
  .parseSync();

runSkill('supply-chain-sentinel', () => {
  const targetDir = path.resolve(argv.input as string);
  if (!fs.existsSync(targetDir)) throw new Error('Directory not found: ' + targetDir);

  const allFiles = getAllFiles(targetDir, { maxDepth: 3 });
  const malicious: any[] = [];
  let components: any[] = [];
  let sbom: any = null;
  let dependencyConfusion: any[] = [];

  const pkgPath = path.join(targetDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkgContent = fs.readFileSync(pkgPath, 'utf8');
    components = parsePackageJson(pkgContent);
    
    if (argv.sbom) {
      sbom = generateSBOM(pkgContent);
    }

    if (argv['internal-prefixes']) {
      const prefixes = (argv['internal-prefixes'] as string).split(',').map(p => p.trim());
      dependencyConfusion = detectDependencyConfusion(components, prefixes);
    }
  }

  for (const f of allFiles) {
    if (['.js', '.cjs', '.sh'].includes(path.extname(f))) {
      try {
        malicious.push(
          ...scanForSuspicious(fs.readFileSync(f, 'utf8'), path.relative(targetDir, f))
        );
      } catch {}
    }
  }

  const result = { 
    directory: targetDir, 
    components, 
    malicious,
    dependencyConfusion,
    sbom,
    governance: 'Aligned with IPA Supply Chain Security Guidelines'
  };

  if (argv.out) {
    safeWriteFile(argv.out as string, JSON.stringify(result, null, 2));
  }

  return result;
});
