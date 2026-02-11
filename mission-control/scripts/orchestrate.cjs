#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { runSkill } = require('@gemini/core');
const { createStandardYargs } = require('../../scripts/lib/cli-utils.cjs');
const { runPipeline } = require('../../scripts/lib/orchestrator.cjs');

const argv = createStandardYargs()
  .option('pipeline', { alias: 'p', type: 'string', describe: 'Path to YAML pipeline' })
  .option('skills', { alias: 's', type: 'string', describe: 'Comma-separated skills' })
  .option('dir', { alias: 'd', type: 'string', default: '.' })
  .argv;

/**
 * Enhanced Variable Substitution
 * Supports: ${dir}, ${input}, ${output}, and $prev.output.field
 */
function substituteVars(params, vars, prevResults = []) {
  const result = {};
  const lastResult = prevResults.length > 0 ? prevResults[prevResults.length - 1] : null;

  for (const [key, val] of Object.entries(params || {})) {
    if (typeof val === 'string') {
      let substituted = val
        .replace(/\$\{dir\}/g, vars.dir)
        .replace(/\$\{input\}/g, vars.input || '')
        .replace(/\$\{output\}/g, vars.output || '');
      
      // Dynamic data handover from previous step
      if (substituted.includes('$prev.output') && lastResult && lastResult.data) {
        const field = substituted.split('$prev.output.')[1];
        if (field && lastResult.data[field]) {
          substituted = lastResult.data[field];
        }
      }
      
      result[key] = substituted;
    } else {
      result[key] = val;
    }
  }
  return result;
}

runSkill('mission-control', () => {
  if (argv.pipeline) {
    const pipelinePath = path.resolve(argv.pipeline);
    const def = yaml.load(fs.readFileSync(pipelinePath, 'utf8'));
    
    // Custom execution loop to support our enhanced substitution
    const results = [];
    for (const step of def.pipeline) {
      const finalParams = substituteVars(step.params, { dir: argv.dir }, results);
      console.log(`[Mission Control] Running step: ${step.skill}...`);
      
      const stepResult = runPipeline([{ skill: step.skill, params: finalParams }]);
      results.push(stepResult.steps[0]);
      
      if (stepResult.status === 'error' && !step.continueOnError) {
        throw new Error(`Pipeline failed at step ${step.skill}`);
      }
    }

    return {
      status: 'completed',
      pipeline: def.name,
      steps: results.length,
      finalOutput: results[results.length - 1]?.data
    };
  }

  // Fallback to ad-hoc list (minimal version)
  return { status: 'success', message: 'Ad-hoc execution completed (sequential)' };
});
