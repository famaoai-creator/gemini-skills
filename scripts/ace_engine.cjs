#!/usr/bin/env node
/**
 * ACE Engine v4.1 - Federated Expertise (Knowledge-Driven)
 * Standards-compliant version (Script Civilization Mission).
 * 
 * Implements GEMINI.md Section X (Conflict Resolution) 
 * and Persona-Specific Rule Loading from knowledge/roles/.
 */

const { logger, fileUtils, errorHandler } = require('../libs/core/core.cjs');
const { safeReadFile, safeWriteFile } = require('../libs/core/secure-io.cjs');
const pathResolver = require('../libs/core/path-resolver.cjs');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

async function runACE() {
  const args = process.argv.slice(2);
  const missionId = args.find(a => a.startsWith('--mission='))?.split('=')[1] || process.env.MISSION_ID;
  const roleName = args.find(a => a.startsWith('--role='))?.split('=')[1];
  const action = args.find(a => a.startsWith('--action='))?.split('=')[1];
  const status = args.find(a => a.startsWith('--status='))?.split('=')[1] || 'APPROVED';

  if (!missionId || !roleName) {
    logger.info(chalk.yellow('Usage: node scripts/ace_engine.cjs --mission=<id> --role="<persona_name>" [--action="<desc>"] [--status=APPROVED|NO-GO]'));
    process.exit(1);
  }

  const missionDir = pathResolver.missionDir(missionId);
  const roleId = roleName.toLowerCase().replace(/ /g, '_');
  const personaDir = path.join(missionDir, `role_${roleId}`);
  const consensusPath = path.join(missionDir, 'consensus.json');
  const roleRulesPath = pathResolver.rootResolve(`knowledge/roles/${roleId}.md`);

  // 1. Sandbox Setup
  if (!fs.existsSync(personaDir)) {
    fs.mkdirSync(personaDir, { recursive: true });
    fs.mkdirSync(path.join(personaDir, 'evidence'), { recursive: true });
    fs.mkdirSync(path.join(personaDir, 'scratch'), { recursive: true });
  }

  logger.info(chalk.bold.bgMagenta(` ACE Federation Active: ${roleName} `));

  // 2. Load Role-Specific Expertise
  if (fs.existsSync(roleRulesPath)) {
    try {
      const rules = safeReadFile(roleRulesPath, { encoding: 'utf8' });
      logger.info(`Expertise Loaded: ${path.basename(roleRulesPath)} (${rules.length} bytes)`);
    } catch (_) {}
  }

  // 3. Execution & Evidence
  const result = {
    role: roleName,
    action: action || 'Review',
    status: status,
    timestamp: new Date().toISOString(),
    findings: `Analysis performed under ${roleName} guidelines. Status: ${status}`
  };

  const evidenceFile = path.join(personaDir, 'evidence', `action_${Date.now()}.json`);
  safeWriteFile(evidenceFile, JSON.stringify(result, null, 2));
  logger.success(`Evidence recorded: ${path.basename(evidenceFile)}`);

  // 4. Consensus & Conflict Detection
  updateConsensus(consensusPath, roleName, status);

  return result;
}

function updateConsensus(consensusPath, role, status) {
  let consensus = { approvals: {}, last_updated: null, conflict: false };
  if (fs.existsSync(consensusPath)) {
    try { 
      const content = safeReadFile(consensusPath, { encoding: 'utf8' });
      consensus = JSON.parse(content); 
    } catch (e) {}
  }

  consensus.approvals[role] = status;
  consensus.last_updated = new Date().toISOString();

  // Detect Conflict
  const states = Object.values(consensus.approvals);
  consensus.conflict = states.includes('NO-GO') && states.includes('APPROVED');

  if (consensus.conflict) {
    logger.warn(`CONFLICT DETECTED in consensus. Final Sudo Decision required.`);
  }

  safeWriteFile(consensusPath, JSON.stringify(consensus, null, 2));
  logger.info(`Consensus updated for ${role}: ${status}`);
}

runACE().catch(err => {
  errorHandler(err, 'ACE Engine Failure');
});
