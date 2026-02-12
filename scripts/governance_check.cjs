#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * Global Governance Check Tool
 * Orchestrates all quality gates: Lint, Unit Tests, Health Check, and Performance.
 */

async function runStep(name, command) {
  process.stdout.write(chalk.cyan(`[Governance] Running ${name}... `));
  const start = Date.now();
  try {
    execSync(command, { stdio: 'ignore', cwd: path.resolve(__dirname, '..') });
    const duration = ((Date.now() - start) / 1000).toFixed(1);
    console.log(chalk.green(`PASSED (${duration}s)`));
    return { name, status: 'passed', duration };
  } catch (err) {
    console.log(chalk.red('FAILED'));
    return { name, status: 'failed', error: err.message };
  }
}

async function main() {
  console.log(chalk.bold('\n=== Gemini Ecosystem Governance Check ===\n'));

  const results = [];
  results.push(await runStep('Static Analysis (Lint)', 'npm run lint'));
  results.push(await runStep('Type Check', 'npm run typecheck'));
  results.push(await runStep('Unit Tests', 'npm run test:unit'));
  results.push(await runStep('Ecosystem Health', 'node scripts/check_skills_health.cjs'));
  results.push(await runStep('Performance Regression', 'node scripts/check_performance.cjs --fail-on-regression'));

  const failed = results.filter(r => r.status === 'failed');
  
  console.log('\n' + chalk.bold('--- Governance Summary ---'));
  results.forEach(r => {
    const icon = r.status === 'passed' ? '✅' : '❌';
    console.log(`${icon} ${r.name.padEnd(25)} : ${r.status.toUpperCase()}`);
  });

  const reportPath = path.resolve(__dirname, '../work/governance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    overall_status: failed.length === 0 ? 'compliant' : 'non-compliant',
    results
  }, null, 2));

  if (failed.length > 0) {
    console.log(chalk.red(`\n[!] Governance check failed with ${failed.length} issues.`));
    process.exit(1);
  } else {
    console.log(chalk.green('\n[SUCCESS] Ecosystem is fully compliant with all quality gates.'));
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
