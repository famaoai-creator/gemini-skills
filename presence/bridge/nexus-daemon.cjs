#!/usr/bin/env node
/**
 * Nexus Daemon v1.0
 * Background stimuli watcher that triggers physical terminal intervention.
 /**
  * Flow: Watch stimuli.jsonl -> Detect PENDING -> Find Idle iTerm2 Session -> Inject Intervention Command.
  */

 const { logger, safeReadFile, pathResolver, requireRole } = require('../../scripts/system-prelude.cjs');
 const terminalBridge = require('../../libs/core/terminal-bridge.cjs');
 const fs = require('fs');

requireRole('Ecosystem Architect');

const STIMULI_PATH = pathResolver.rootResolve('presence/bridge/stimuli.jsonl');
const CHECK_INTERVAL_MS = 5000; // Watch every 5 seconds

const processedInLoop = new Set(); // Prevent duplicate injections in the same daemon session

async function nexusLoop() {
  logger.info('🛡️ Nexus Daemon active. Watching for sensory stimuli...');

  while (true) {
    if (fs.existsSync(STIMULI_PATH)) {
      try {
        const content = safeReadFile(STIMULI_PATH, { encoding: 'utf8' });
        const pending = content.trim().split('\n')
          .map(line => JSON.parse(line))
          .filter(s => s.status === 'PENDING' && !processedInLoop.has(s.timestamp));

        if (pending.length > 0) {
          const stimulus = pending[0]; // Process oldest first
          logger.info(`📡 Stimulus detected: [${stimulus.source_channel}] ${stimulus.payload.substring(0, 30)}...`);

          const session = terminalBridge.findIdleSession();
          if (session) {
            logger.info(`🚀 Terminal is IDLE. Injecting physical intervention...`);
            
            // Standard Intervention Protocol
            const cmd = `[INTERRUPTION] TS:${stimulus.timestamp} Source:${stimulus.source_channel} Payload:${stimulus.payload}`;
            
            const success = terminalBridge.injectAndExecute(session.winId, session.sessionId, cmd);
            if (success) {
              processedInLoop.add(stimulus.timestamp);
              logger.success(`✅ Intervention command sent to Terminal Win:${session.winId} Session:${session.sessionId}`);
            }
          } else {
            logger.info('⏳ Terminal is busy or not found. Waiting for next heartbeat...');
          }
        }
      } catch (err) {
        logger.error(`Loop Error: ${err.message}`);
      }
    }

    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL_MS));
  }
}

nexusLoop().catch(err => {
  logger.error(`Nexus Daemon crashed: ${err.message}`);
  process.exit(1);
});
