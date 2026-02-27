import * as fs from 'node:fs';
import * as path from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { runAsyncSkill } from '@agent/core';
import { safeWriteFile } from '@agent/core/secure-io';
import { getAllFiles } from '@agent/core/fs-utils';
import { scanForSuspicious, parsePackageJson, generateSBOM, detectDependencyConfusion, checkVulnerability } from './lib.js';

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
  .option('scan', {
    type: 'boolean',
    default: false,
    description: 'Query vulnerability database (OSV) for dependencies',
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

runAsyncSkill('supply-chain-sentinel', async () => {
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
    
    // Vulnerability Scanning (OSV API)
    if (argv.scan) {
      console.error(`[Sentinel] Scanning ${components.length} components for vulnerabilities...`);
      for (const comp of components) {
        const vulns = await checkVulnerability(comp.name, comp.version);
        if (vulns.length > 0) {
          comp.vulnerabilities = vulns;
        }
      }
    }

    if (argv.sbom) {
      sbom = generateSBOM(pkgContent);
      if (argv.scan) {
        // Enrich SBOM with vulnerability info
        sbom.components = components.map(c => ({
          name: c.name,
          version: c.version,
          type: 'library',
          purl: `pkg:npm/${c.name}@${c.version}`,
          externalReferences: (c.vulnerabilities || []).map((v: any) => ({
            url: `https://osv.dev/vulnerability/${v.id}`,
            type: 'vulnerability'
          }))
        }));
      }
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
    components: components.filter(c => c.vulnerabilities), // Show only high-risk ones in summary
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
