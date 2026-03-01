import fs from 'fs';
import path from 'path';
import { safeWriteFile } from '@agent/core/secure-io';

export interface CostEstimateResult { totalCost: number; findings: any[]; }

function loadPricing() {
  const root = process.cwd();
  const langPath = path.resolve(root, 'knowledge/common/language-standards.json');
  return JSON.parse(fs.readFileSync(langPath, 'utf8')).pricing_defaults.cloud;
}

export function estimateCosts(adf: any, customPricing?: any, optimizationRules: any[] = []): CostEstimateResult {
  const pricing = customPricing || loadPricing();
  let totalMonthlyCost = 0;
  const findings: any[] = [];

  if (!adf.nodes || !Array.isArray(adf.nodes)) return { totalCost: 0, findings: [] };

  adf.nodes.forEach((node: any) => {
    // Logic uses standardized pricing units
    const unitCost = pricing.compute_unit || 0.02;
    const monthlyCost = unitCost * 24 * 30;
    totalMonthlyCost += monthlyCost;

    optimizationRules.forEach((rule) => {
      if (node.type === rule.target) {
        findings.push({ resource: node.id, action: rule.action, potential_savings: rule.savings ? monthlyCost * rule.savings : 0 });
      }
    });
  });

  return { totalCost: totalMonthlyCost, findings };
}
