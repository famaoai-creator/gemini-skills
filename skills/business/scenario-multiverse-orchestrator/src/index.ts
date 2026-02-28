import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { runSkill } from '@agent/core';
import { safeWriteFile } from '@agent/core/secure-io';
import { projectScenario, compareScenarios, SCENARIO_TEMPLATES, BaseAssumptions } from './lib.js';

const argv = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    demandOption: true,
    description: 'Path to JSON file with base assumptions',
  })
  .option('scenarios', {
    alias: 's',
    type: 'number',
    default: 3,
    description: 'Number of scenarios to generate',
  })
  .option('out', {
    alias: 'o',
    type: 'string',
    description: 'Output file path',
  })
  .parseSync();

runSkill('scenario-multiverse-orchestrator', () => {
  const resolved = path.resolve(argv.input as string);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }

  const base = JSON.parse(fs.readFileSync(resolved, 'utf8')) as BaseAssumptions;
  const months = base.timeframe_months || 12;
  const numScenarios = Math.min(argv.scenarios as number, Object.keys(SCENARIO_TEMPLATES).length);

  const templateKeys = Object.keys(SCENARIO_TEMPLATES).slice(0, numScenarios);
  const scenarios = templateKeys.map((key) =>
    projectScenario(base, SCENARIO_TEMPLATES[key], months)
  );
  const comparison = compareScenarios(scenarios);

  const result = {
    company: base.name || 'Unknown',
    timeframeMonths: months,
    baselineMetrics: {
      currentMRR: base.mrr,
      monthlyBurn: base.monthlyBurn,
      cashOnHand: base.cashOnHand,
      headcount: base.current_headcount,
    },
    scenarios,
    comparison,
  };

  if (argv.out) {
    safeWriteFile(argv.out as string, JSON.stringify(result, null, 2));
  }

  return result;
});
