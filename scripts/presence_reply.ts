/**
 * scripts/presence_reply.ts
 * Convenience tool for the Agent to resolve sensory stimuli and send replies.
 */

import { logger } from '@agent/core/core';
import { resolveStimulus } from './presence-controller.js';

async function main() {
  const args = process.argv.slice(2);
  const timestamp = args[0];
  const response = args.slice(1).join(' ');

  if (!timestamp || !response) {
    console.log('Usage: node presence_reply.js <timestamp> <response text>');
    process.exit(1);
  }

  logger.info(`📝 Resolving stimulus from ${timestamp}...`);
  try {
    await resolveStimulus(timestamp, response);
    logger.success('✅ Stimulus resolved and reply routed.');
  } catch (err: any) {
    logger.error(`Failed to reply: ${err.message}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
