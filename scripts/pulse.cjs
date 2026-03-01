#!/usr/bin/env node
/**
 * Ecosystem Pulse Monitor v3.0
 * Analyzes the Governance Ledger to report real-time health and integrity.
 * Standards-compliant version (Script Optimization Mission).
 */

const { logger, errorHandler, safeReadFile, pathResolver } = require('./system-prelude.cjs');
const chalk = require('chalk');
const ledger = require('../libs/core/ledger.cjs');
const fs = require('fs');

const LEDGER_PATH = pathResolver.rootResolve('active/audit/governance-ledger.jsonl');

function analyzePulse() {
  if (!fs.existsSync(LEDGER_PATH)) {
    return { status: 'UNKNOWN', message: 'No ledger found. Start using skills to generate pulse.', color: chalk.dim };
  }

  try {
    const content = safeReadFile(LEDGER_PATH, { encoding: 'utf8' });
    const lines = content.trim().split('\n');
    const entries = lines.map(l => JSON.parse(l));
    const recent = entries.slice(-50);

    const total = recent.length;
    const errors = recent.filter(e => e.payload && e.payload.status === 'error').length;
    const errorRate = total > 0 ? (errors / total) * 100 : 0;

    const isChainValid = ledger.verifyIntegrity();

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
      recentErrors: recent
        .filter(e => e.payload && e.payload.status === 'error')
        .slice(-3)
        .map(e => e.payload.skill)
    };
  } catch (err) {
    logger.error(`Pulse Analysis Failed: ${err.message}`);
    return { status: 'ERROR', message: err.message, color: chalk.red };
  }
}

if (require.main === module) {
  const p = analyzePulse();
  
  if (p.status === 'ERROR') process.exit(1);

  logger.info(chalk.bold(`ECOSYSTEM PULSE: ${p.color(p.status)}`));
  logger.info(chalk.dim('━'.repeat(30)));
  logger.info(`  Integrity : ${p.isChainValid ? chalk.green('SECURE') : chalk.bgRed('CORRUPTED')}`);
  logger.info(`  Error Rate: ${p.errorRate}% (Recent 50 events)`);
  logger.info(`  Total Logs: ${p.totalEvents} entries`);
  
  if (p.recentErrors && p.recentErrors.length > 0) {
    logger.info(chalk.yellow(`  Recent Failures: ${p.recentErrors.join(', ')}`));
  }
}

module.exports = { analyzePulse };
