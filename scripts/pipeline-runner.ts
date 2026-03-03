/**
 * scripts/pipeline-runner.ts
 * Executes YAML-defined orchestration pipelines.
 */

import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { runSkill } from '@agent/core';
import { resolveSkillScript } from '@agent/core/orchestrator';

const rootDir = process.cwd();

// ---------------------------------------------------------------------------
// Parse CLI arguments with yargs
// ---------------------------------------------------------------------------
const argv = yargs(hideBin(process.argv))
  .option('pipeline', {
    alias: 'p',
    type: 'string',
    demandOption: true,
    description: 'Name of the pipeline to run (matches pipelines/<name>.yml)',
  })
  .option('dir', {
    type: 'string',
    description: 'Directory variable for {{dir}} placeholders',
  })
  .option('input', {
    alias: 'i',
    type: 'string',
    description: 'Input file variable for {{input}} placeholders',
  })
  .strict(false)
  .help()
  .parseSync();

function interpolate(template: string, vars: Record<string, any>): string {
  if (typeof template !== 'string') return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
    if (vars[key] === undefined) {
      throw new Error(`Pipeline variable "{{${key}}}" has no value. Pass --${key} <value> on the command line.`);
    }
    return String(vars[key]);
  });
}

function buildVars(parsedArgv: Record<string, any>): Record<string, any> {
  const vars: Record<string, any> = {
    out_dir: 'active/shared',
    scratch_dir: 'scratch',
    mission_dir: 'active/missions/default',
    src_dir: 'src',
  };
  for (const [key, val] of Object.entries(parsedArgv)) {
    if (key === '_' || key === '$0' || key === 'pipeline' || key === 'p' || key.length === 1) continue;
    if (val !== undefined && val !== null) {
      vars[key] = val;
    }
  }
  return vars;
}

function executeStep(step: any, vars: Record<string, any>): any {
  const skillName = step.skill;
  const scriptPath = resolveSkillScript(skillName);
  const args = step.args ? interpolate(step.args, vars) : '';
  const cwd = step.cwd ? path.resolve(interpolate(step.cwd, vars)) : rootDir;

  const cmd = `node "${scriptPath}" ${args}`;
  const startTime = Date.now();

  try {
    const stdout = execSync(cmd, { encoding: 'utf8', cwd, timeout: 120000, stdio: 'pipe' });
    const duration_ms = Date.now() - startTime;

    let data;
    try {
      data = JSON.parse(stdout);
    } catch {
      data = { raw: stdout.trim() };
    }

    return { skill: skillName, output: step.output || null, status: 'success', data, duration_ms };
  } catch (err: any) {
    const duration_ms = Date.now() - startTime;

    let errorData = null;
    if (err.stdout) {
      try { errorData = JSON.parse(err.stdout); } catch {}
    }

    return {
      skill: skillName,
      output: step.output || null,
      status: 'error',
      data: errorData,
      error: err.stderr ? err.stderr.trim().split('\n')[0] : err.message.split('\n')[0],
      duration_ms,
    };
  }
}

runSkill('pipeline-runner', () => {
  const pipelineName = argv.pipeline;
  const pipelineFile = path.join(rootDir, 'pipelines', `${pipelineName}.yml`);

  if (!fs.existsSync(pipelineFile)) {
    const pipelinesDir = path.join(rootDir, 'pipelines');
    const available = fs.existsSync(pipelinesDir)
      ? fs.readdirSync(pipelinesDir).filter((f) => f.endsWith('.yml')).map((f) => f.replace('.yml', ''))
      : [];
    throw new Error(`Pipeline "${pipelineName}" not found at ${pipelineFile}. Available: ${available.join(', ')}`);
  }

  const pipelineDef: any = yaml.load(fs.readFileSync(pipelineFile, 'utf8'));

  if (!pipelineDef || !Array.isArray(pipelineDef.steps)) {
    throw new Error(`Invalid pipeline definition: "${pipelineFile}" must contain a "steps" array`);
  }

  const vars = buildVars(argv);
  const pipelineStart = Date.now();
  const stepResults = [];

  for (const step of pipelineDef.steps) {
    const result = executeStep(step, vars);
    stepResults.push(result);
  }

  const totalDuration_ms = Date.now() - pipelineStart;

  return {
    pipeline: pipelineDef.name || pipelineName,
    description: pipelineDef.description || null,
    steps: stepResults,
    summary: {
      total: pipelineDef.steps.length,
      succeeded: stepResults.filter((s) => s.status === 'success').length,
      failed: stepResults.filter((s) => s.status === 'error').length,
    },
    totalDuration_ms,
  };
});
