#!/usr/bin/env node
/**
 * Visual Capture Utility
 * Manual trigger for giving the agent 'sight'.
 */

const { logger, requireRole } = require('./system-prelude.cjs');
const visualSensor = require('../presence/sensors/visual-sensor.cjs');

requireRole('Ecosystem Architect');

async function main() {
  const target = process.argv[2] || 'screen';
  
  try {
    const artifact = await visualSensor.capture(target);
    console.log(JSON.stringify(artifact, null, 2));
  } catch (err) {
    process.exit(1);
  }
}

main();
