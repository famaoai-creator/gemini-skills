/**
 * scripts/benchmark.ts
 * Cold-start measurement for implemented skills.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import { logger, safeReadFile, safeWriteFile } from '@agent/core';
import * as pathResolver from '@agent/core/path-resolver';

const resultsDir = path.join(process.cwd(), 'evidence/benchmarks');
const indexPath = pathResolver.knowledge('orchestration/global_skill_index.json');

async function main() {
  if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

  const indexContent = safeReadFile(indexPath, { encoding: 'utf8' }) as string;
  const index = JSON.parse(indexContent);
  const skillsData = index.s || index.skills || [];
  const skills: any[] = [];

  for (const s of skillsData) {
    if ((s.s || s.status) !== 'impl' && (s.s || s.status) !== 'implemented') continue;
    const sPath = s.path || s.n;
    const distDir = path.join(process.cwd(), sPath, 'dist');
    if (fs.existsSync(distDir)) {
      const files = fs.readdirSync(distDir).filter(f => f.endsWith('.js'));
      if (files.length > 0) skills.push({ name: s.n, script: path.join(distDir, files[0]) });
    }
  }

  logger.info(`Benchmarking ${skills.length} skills...`);
  const results: any[] = [];

  for (const skill of skills) {
    const times: number[] = [];
    for (let i = 0; i < 3; i++) {
      const start = process.hrtime.bigint();
      try { execSync(`node --check "${skill.script}"`, { stdio: 'ignore' }); } catch (_) {}
      times.push(Number(process.hrtime.bigint() - start) / 1e6);
    }
    const avg = times.reduce((a, b) => a + b, 0) / 3;
    results.push({ skill: skill.name, avg_ms: Math.round(avg * 100) / 100 });
    console.log(`  ${skill.name.padEnd(35)} avg: ${avg.toFixed(1)}ms`);
  }

  const reportPath = path.join(resultsDir, `benchmark-${new Date().toISOString().slice(0, 10)}.json`);
  safeWriteFile(reportPath, JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2));
  logger.success(`Benchmark complete: ${reportPath}`);
}

main().catch(err => {
  logger.error(err.message);
  process.exit(1);
});
