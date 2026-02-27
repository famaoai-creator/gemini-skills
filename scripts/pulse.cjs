#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ledger = require('../libs/core/ledger.cjs');

/**
 * Ecosystem Pulse Monitor v1.0
 * Analyzes the Governance Ledger to report real-time health and integrity.
 */

const rootDir = path.resolve(__dirname, '..');
const LEDGER_PATH = path.join(rootDir, 'active/audit/governance-ledger.jsonl');

function analyzePulse() {
  if (!fs.existsSync(LEDGER_PATH)) {
    return { status: 'UNKNOWN', message: 'No ledger found. Start using skills to generate pulse.' };
  }

  const lines = fs.readFileSync(LEDGER_PATH, 'utf8').trim().split('
');
  const entries = lines.map(l => JSON.parse(l));
  const recent = entries.slice(-50); // Analyze last 50 events

  const total = recent.length;
  const errors = recent.filter(e => e.payload.status === 'error').length;
  const errorRate = (errors / total) * 100;

  // 1. Integrity Check
  const isChainValid = ledger.verifyIntegrity();

  // 2. Health Status
  let status = 'HEALTHY';
  let color = chalk.green;
  
  if (errorRate > 20) { status = 'DEGRADED'; color = chalk.yellow; }
  if (errorRate > 50 || !isChainValid) { status = 'CRITICAL'; color = chalk.red; }

  return {
    status,
    color,
    errorRate: errorRate.toFixed(1),
    totalEvents: entries.length,
    isChainValid,
    recentErrors: recent.filter(e => e.payload.status === 'error').slice(-3).map(e => e.payload.skill)
  };
}

if (require.main === module) {
  const p = analyzePulse();
  
  console.log(chalk.bold(`
💓 ECOSYSTEM PULSE: ${p.color(p.status)}`));
  console.log(chalk.dim('━'.repeat(30)));
  console.log(`  Integrity : ${p.isChainValid ? chalk.green('SECURE') : chalk.bgRed('CORRUPTED')}`);
  console.log(`  Error Rate: ${p.errorRate}% (Recent 50 events)`);
  console.log(`  Total Logs: ${p.totalEvents} entries`);
  
  if (p.recentErrors.length > 0) {
    console.log(chalk.yellow(`
  Recent Failures: ${p.recentErrors.join(', ')}`));
  }
  
  console.log('');
}

module.exports = { analyzePulse };
