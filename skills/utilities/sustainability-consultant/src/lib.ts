import * as fs from 'node:fs';
import * as path from 'node:path';
import * as pathResolver from '@agent/core/path-resolver';

export interface EnergyUsage {
  totalKwh: number;
  co2Kg: number;
  efficiency_score: number;
  recommendations: string[];
}

function loadThresholds() {
  const pathRules = pathResolver.knowledge('skills/common/governance-thresholds.json');
  if (!fs.existsSync(pathRules)) {
    return {
      sustainability: {
        base_score: 100,
        emissions_factor: 0.5
      }
    };
  }
  try {
    return JSON.parse(fs.readFileSync(pathRules, 'utf8'));
  } catch (_e) {
    return { sustainability: { base_score: 100, emissions_factor: 0.5 } };
  }
}

export function assessInfraEnergy(dir: string): EnergyUsage {
  const thresholds = loadThresholds().sustainability;
  let totalKwh = 0;
  let score = thresholds.base_score;
  const recommendations: string[] = [];
  const exists = (p: string) => fs.existsSync(path.join(dir, p));

  if (exists('docker-compose.yml')) totalKwh += 50;
  if (exists('k8s')) totalKwh += 200;
  
  return {
    totalKwh,
    co2Kg: Math.round(totalKwh * thresholds.emissions_factor * 10) / 10,
    efficiency_score: score,
    recommendations: ['Calculated using ecosystem sustainability factors.']
  };
}
