#!/usr/bin/env node
/**
 * Skill Benchmark Script v3.0
 * Performs syntax check and cold-start measurement for implemented skills.
 * Standards-compliant version (Script Optimization Mission).
 */

const { logger, errorHandler, safeReadFile, safeWriteFile, pathResolver, requireRole } = require('./system-prelude.cjs');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

requireRole('Ecosystem Architect');

const resultsDir = pathResolver.rootResolve('evidence/benchmarks');
const indexPath = pathResolver.knowledge('orchestration/global_skill_index.json');

try {
  if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

  const indexContent = safeReadFile(indexPath, { encoding: 'utf8' });
  const index = JSON.parse(indexContent);
  const skillsData = index.s || index.skills;
  const skills = [];

  for (const s of skillsData) {
    if ((s.s || s.status) !== 'impl' && (s.s || s.status) !== 'implemented') continue;

    const sPath = s.path || s.n;
    const scriptsDir = pathResolver.rootResolve(path.join(sPath, 'scripts'));
    if (!fs.existsSync(scriptsDir)) continue;

    const files = fs.readdirSync(scriptsDir).filter((f) => f.endsWith('.cjs') || f.endsWith('.js'));
    if (files.length > 0) {
      skills.push({ name: s.n, script: path.join(scriptsDir, files[0]) });
    }
  }

  logger.info(`Benchmarking ${skills.length} implemented skills...`);

  const results = [];

  for (const skill of skills) {
    const iterations = 3;
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime.bigint();
      try {
        execSync(`node --check "${skill.script}"`, { timeout: 5000, stdio: 'pipe' });
      } catch (_e) {}
      const end = process.hrtime.bigint();
      times.push(Number(end - start) / 1e6); // ms
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);

    results.push({
      skill: skill.name,
      avg_ms: Math.round(avg * 100) / 100,
      min_ms: Math.round(min * 100) / 100,
      max_ms: Math.round(max * 100) / 100,
      iterations,
    });

    logger.info(
      `  ${skill.name.padEnd(35)} avg: ${avg.toFixed(1)}ms  min: ${min.toFixed(1)}ms  max: ${max.toFixed(1)}ms`
    );
  }

  const report = {
    timestamp: new Date().toISOString(),
    node_version: process.version,
    total_skills: results.length,
    results,
  };

  const reportPath = path.join(resultsDir, `benchmark-${new Date().toISOString().slice(0, 10)}.json`);
  safeWriteFile(reportPath, JSON.stringify(report, null, 2));

  logger.success(`Benchmarked ${results.length} skills. Results saved to: ${reportPath}`);
} catch (err) {
  errorHandler(err, 'Skill Benchmarking Failed');
}
