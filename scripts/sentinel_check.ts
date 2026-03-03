import { execSync } from 'node:child_process';
import { safeWriteFile } from '@agent/core';

/**
 * Sentinel Check Utility
 * Autonomously bundles security, quality, and documentation drift checks.
 */

interface CheckDef {
  name: string;
  cmd: string;
}

async function runSentinel(): Promise<void> {
  console.log('--- Sentinel Analysis Starting ---');

  const checks: CheckDef[] = [
    { name: 'Security', cmd: 'node dist/scripts/cli.js run security-scanner -- --dir .' },
    { name: 'Health', cmd: 'node dist/scripts/cli.js run project-health-check -- --dir .' },
    {
      name: 'Stale TODOs',
      cmd: 'grep -rE "TODO|FIXME" . --exclude-dir={node_modules,.git} | head -n 5',
    },
  ];

  const results: Record<string, string> = {};

  checks.forEach((check) => {
    try {
      console.log(`[Sentinel] Running ${check.name}...`);
      const output = execSync(check.cmd).toString();
      results[check.name] = output;
    } catch (e: any) {
      results[check.name] = `Failed: ${e.message}`;
    }
  });

  const outPath = 'active/shared/sentinel-report.json';
  safeWriteFile(outPath, JSON.stringify(results, null, 2));
  console.log(`--- Sentinel Analysis Complete. Report saved to ${outPath} ---`);
}

runSentinel().catch(err => {
  console.error(err);
  process.exit(1);
});
