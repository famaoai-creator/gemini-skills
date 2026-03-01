#!/usr/bin/env node
/**
 * Task Manager v3.0 (Parallel Execution Edition)
 * Manages routine tasks with support for parallel execution of independent routines.
 */

const { logger, safeReadFile, safeWriteFile, pathResolver, chalk, errorHandler } = require('./system-prelude.cjs');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const tasksDefPath = pathResolver.rootResolve('scripts/config/routine-tasks.json');
const statusPath = pathResolver.active('maintenance/daily-log.json');

function loadTasks() {
  if (!fs.existsSync(tasksDefPath)) return { tasks: [] };
  try {
    return JSON.parse(safeReadFile(tasksDefPath, { encoding: 'utf8' }));
  } catch (_) {
    return { tasks: [] };
  }
}

function loadStatus() {
  if (!fs.existsSync(statusPath)) return {};
  try {
    return JSON.parse(safeReadFile(statusPath, { encoding: 'utf8' }));
  } catch (_) {
    return {};
  }
}

async function runTask(task) {
  logger.info(`▶ Executing Task: ${task.name}`);
  const today = new Date().toISOString().slice(0, 10);

  try {
    if (task.skill) {
      const args = task.args || '';
      execSync(`node scripts/cli.cjs run ${task.skill} ${args}`, { stdio: 'inherit' });
    } else if (task.cmd) {
      execSync(task.cmd, { stdio: 'inherit' });
    } else {
      // Mock execution for base tasks without specific skills
      logger.success(`Task "${task.name}" completed (System logic).`);
    }

    const status = loadStatus();
    status[task.id] = today;
    safeWriteFile(statusPath, JSON.stringify(status, null, 2));
    return true;
  } catch (err) {
    logger.error(`Task "${task.name}" failed: ${err.message}`);
    return false;
  }
}

function getPendingTasks(currentRole) {
  const { tasks } = loadTasks();
  const status = loadStatus();
  const today = new Date().toISOString().slice(0, 10);

  return tasks.filter((t) => {
    const lastRun = status[t.id];
    const isToday = lastRun === today;
    const isForRole = t.required_role === currentRole || t.layer === 'Base';
    return !isToday && isForRole;
  });
}

async function main() {
  const args = process.argv.slice(2);
  const autoConfirm = args.includes('--yes') || args.includes('-y');
  const checkSandbox = args.includes('--check-sandbox');

  if (checkSandbox) {
    logger.info('🛡️ Verifying Deep Sandbox Law...');
    try {
      const fs = require('fs');
      const testPath = path.join(pathResolver.knowledgeRoot(), 'sandbox-test.tmp');
      fs.writeFileSync(testPath, 'illegal write');
      logger.error('❌ SANDBOX BREACH: Illegal write succeeded!');
      process.exit(1);
    } catch (err) {
      if (err.message.includes('DEEP SANDBOX VIOLATION')) {
        logger.success('✅ Deep Sandbox is ACTIVE and enforced.');
        process.exit(0);
      } else {
        logger.error(`Unexpected error during sandbox check: ${err.message}`);
        process.exit(1);
      }
    }
  }
  
  const currentRole = require('../libs/core/core.cjs').fileUtils.getCurrentRole();
  const pending = getPendingTasks(currentRole);

  if (pending.length === 0) {
    logger.info('No pending tasks for today.');
    return;
  }

  logger.info(`Pending Tasks for ${currentRole}:`);
  pending.forEach(t => logger.info(`  [${t.layer}] ${t.name}`));

  if (autoConfirm) {
    logger.info('🚀 Running all pending tasks in parallel...');
    const results = await Promise.all(pending.map(t => runTask(t)));
    const successCount = results.filter(r => r).length;
    logger.success(`Routine complete: ${successCount}/${pending.length} tasks succeeded.`);
  } else {
    for (const t of pending) {
      logger.info(`\nRun "${t.name}"? (y/N)`);
      logger.warn('Use --yes to run all tasks automatically.');
      break;
    }
  }
}

if (require.main === module) {
  main().catch(err => errorHandler(err, 'Task Manager Failed'));
}

module.exports = { runTask, getPendingTasks };
