import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { runSkill } from '@agent/core';
import { safeWriteFile } from '@agent/core/secure-io';
import { generatePnL, analyzeRunway, generateScenarios, FinancialAssumptions } from './lib.js';

const argv = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    demandOption: true,
    description: 'Path to JSON file with financial assumptions',
  })
  .option('years', {
    alias: 'y',
    type: 'number',
    default: 3,
    description: 'Number of years to project',
  })
  .option('out', {
    alias: 'o',
    type: 'string',
    description: 'Output file path',
  })
  .parseSync();

runSkill('financial-modeling-maestro', () => {
  const resolved = path.resolve(argv.input as string);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }

  const assumptions = JSON.parse(fs.readFileSync(resolved, 'utf8')) as FinancialAssumptions;
  const years = argv.years as number;

  const projections = generatePnL(assumptions, years);
  const runway = analyzeRunway(projections.monthly);
  const scenarios = generateScenarios(assumptions, years);

  const result = {
    source: path.basename(resolved),
    projectionYears: years,
    yearlyProjections: projections.yearly,
    runway,
    scenarios: {
      base: { yearly: scenarios.base.yearly },
      optimistic: { yearly: scenarios.optimistic.yearly },
      pessimistic: { yearly: scenarios.pessimistic.yearly },
    },
    recommendations: [] as string[],
  };

  if (runway.breakevenMonth) {
    result.recommendations.push(`Breakeven expected at month ${runway.breakevenMonth}`);
  } else if (!runway.sustainable) {
    result.recommendations.push(
      `Cash runs out at month ${runway.runwayMonths} - consider reducing burn or raising funding`
    );
  }

  const lastYear = projections.yearly[projections.yearly.length - 1];
  if (lastYear && lastYear.annualProfit < 0) {
    result.recommendations.push(
      'Final year still unprofitable - review cost structure or growth strategy'
    );
  }

  if (argv.out) {
    safeWriteFile(argv.out as string, JSON.stringify(result, null, 2));
  }

  return result;
});
