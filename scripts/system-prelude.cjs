/**
 * System Prelude v2.0 (Deep Sandbox & Audit Edition)
 * Consolidated library loader and execution guard for system scripts.
 */

const { logger, fileUtils, errorHandler } = require('../libs/core/core.cjs');
const pathResolver = require('../libs/core/path-resolver.cjs');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

// --- 0. Presence Intelligence: Sensing the environment ---
let sensoryContext = '';
try {
  const presence = require('./presence-controller.cjs');
  sensoryContext = presence.getSensoryContext() || '';
  if (sensoryContext) {
    // Note: We don't log to console here to avoid cluttering human output, 
    // but the Agent will 'feel' it in the context.
  }
} catch (_) {
  // Silent fail for presence during bootstrap
}

// --- 1. Audit Hook: Auto-logging all system script executions ---
const mid = process.env.MISSION_ID || 'SYSTEM';
const scriptName = process.argv[1] ? path.basename(process.argv[1]) : 'eval';
const LEDGER_PATH = pathResolver.rootResolve('active/audit/governance-ledger.jsonl');

function logToLedger(payload) {
  try {
    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      mid,
      actor: fileUtils.getCurrentRole(),
      action: 'system_script_exec',
      script: scriptName,
      payload
    }) + '\n';
    // Use original fs to avoid sandbox recursion during logging
    fs.appendFileSync(LEDGER_PATH, entry);
  } catch (_) {}
}

logToLedger({ status: 'started', args: process.argv.slice(2) });

// --- 2. Deep Sandboxing: Monkey-patching 'fs' to prevent unauthorized writes ---
const SUDO_KEY = process.env.GEMINI_SUDO_KEY || 'SOVEREIGN_BYPASS_' + Date.now();
process.env.GEMINI_SUDO_KEY = SUDO_KEY; // Pass to children

const originalWrite = fs.writeFileSync;
const originalAppend = fs.appendFileSync;
const originalUnlink = fs.unlinkSync;

fs.writeFileSync = (filePath, data, options) => {
  // If options contains our secret sudo key, allow write
  if (options && options.__sudo === SUDO_KEY) {
    const { __sudo, ...realOptions } = options;
    return originalWrite(filePath, data, realOptions);
  }

  if (pathResolver.isProtected(filePath)) {
    const err = new Error(`DEEP SANDBOX VIOLATION: Direct 'fs.writeFileSync' denied for protected path: ${filePath}. Use 'secure-io' instead.`);
    logger.error(err.message);
    logToLedger({ status: 'violation', type: 'write', path: filePath });
    throw err;
  }
  return originalWrite(filePath, data, options);
};

fs.appendFileSync = (filePath, data, options) => {
  if (options && options.__sudo === SUDO_KEY) {
    const { __sudo, ...realOptions } = options;
    return originalAppend(filePath, data, realOptions);
  }

  if (pathResolver.isProtected(filePath)) {
    const err = new Error(`DEEP SANDBOX VIOLATION: Direct 'fs.appendFileSync' denied for protected path: ${filePath}.`);
    logger.error(err.message);
    logToLedger({ status: 'violation', type: 'append', path: filePath });
    throw err;
  }
  return originalAppend(filePath, data, options);
};

// --- 3. Secure-IO Wrapper (Re-importing with SUDO) ---
const secureIo = require('../libs/core/secure-io.cjs');

/**
 * Authorize secure-io to bypass the deep sandbox
 */
const authorizedIo = {
  ...secureIo,
  safeReadFile: (p, opt) => secureIo.safeReadFile(p, opt),
  safeWriteFile: (p, data, opt) => {
    const sudoOpt = typeof opt === 'string' ? { encoding: opt } : { ...opt };
    sudoOpt.__sudo = SUDO_KEY;
    return secureIo.safeWriteFile(p, data, sudoOpt);
  },
  safeAppendFileSync: (p, data, opt) => {
    const sudoOpt = typeof opt === 'string' ? { encoding: opt } : { ...opt };
    sudoOpt.__sudo = SUDO_KEY;
    return secureIo.safeAppendFileSync(p, data, sudoOpt);
  }
};

/**
 * Execution Guard: Requires a specific role to run the script.
 * @param {string} roleName - Required role (e.g., 'Ecosystem Architect')
 */
function requireRole(roleName) {
  const currentRole = fileUtils.getCurrentRole();
  if (currentRole !== roleName) {
    logger.error(`Access Denied: This script requires '${roleName}' privileges. Current role: ${currentRole}`);
    logToLedger({ status: 'access_denied', required: roleName });
    process.exit(1);
  }
}

// Ensure cleanup on exit
process.on('exit', (code) => {
  logToLedger({ status: 'exited', code });
});

module.exports = {
  logger,
  fileUtils,
  errorHandler,
  safeReadFile: authorizedIo.safeReadFile,
  safeWriteFile: authorizedIo.safeWriteFile,
  safeAppendFileSync: authorizedIo.safeAppendFileSync,
  safeExec: secureIo.safeExec,
  safeSpawn: secureIo.safeSpawn,
  pathResolver,
  chalk,
  requireRole,
};
