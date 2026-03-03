/**
 * scripts/visual_capture.ts
 * Manual trigger for giving the agent 'sight'.
 */

import { logger } from '@agent/core/core';

// Use CJS require for non-migrated sensor
const visualSensor = require('../presence/sensors/visual-sensor.cjs');

async function main() {
  const target = process.argv[2] || 'screen';
  
  try {
    const artifact = await visualSensor.capture(target);
    console.log(JSON.stringify(artifact, null, 2));
  } catch (err: any) {
    logger.error(`Capture failed: ${err.message}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
