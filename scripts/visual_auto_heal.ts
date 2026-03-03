/**
 * scripts/visual_auto_heal.ts
 * Integrates Sight with Repair logic. Captures screenshots on failure.
 */

import { logger } from '@agent/core/core';
import { safeExec } from '@agent/core/secure-io';
import * as pathResolver from '@agent/core/path-resolver';

// Use CJS require for non-migrated sensor
const visualSensor = require('../presence/sensors/visual-sensor.cjs');

async function autoHeal(command: string, args: string[] = []) {
  logger.info(`🛠️ Running repair command with visual monitoring: ${command} ${args.join(' ')}`);
  
  try {
    safeExec(command, args);
    logger.success('✅ Command succeeded. No visual evidence needed.');
  } catch (err: any) {
    logger.error(`❌ Command failed: ${err.message}. Capturing visual evidence...`);
    
    try {
      const artifact = await visualSensor.capture('screen');
      logger.info(`📸 Visual evidence stored: ${artifact.path}`);
      
      console.log('\n[SIGHT_ADVICE]: Visual state captured. Ready for multimodal analysis.\n');
    } catch (vErr: any) {
      logger.error(`Failed to capture visual evidence: ${vErr.message}`);
    }
    
    process.exit(1);
  }
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  if (!cmd) {
    console.log('Usage: node visual_auto_heal.js <command> [args...]');
    process.exit(1);
  }

  await autoHeal(cmd, args);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
