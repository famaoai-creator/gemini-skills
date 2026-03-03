/**
 * Business Impact Analyzer Core Library.
 * Translates engineering metrics into business and financial KPIs.
 */

export interface AnalysisInput {
  dora?: {
    deployment_frequency_per_week: number;
    lead_time_hours: number;
    change_failure_rate: number;
    mttr_hours: number;
  };
  quality?: {
    error_rate_per_1000: number;
    test_coverage: number;
    tech_debt_hours: number;
  };
  business?: {
    hourly_revenue: number;
    developer_hourly_cost: number;
    team_size: number;
  };
}

export function classifyDORA(dora: any) {
  const { deployment_frequency_per_week: df, lead_time_hours: lt } = dora;
  
  let level = 'low';
  if (df >= 7 && lt <= 1) level = 'elite';
  else if (df >= 1 && lt <= 24) level = 'high';
  else if (df >= 0.25 && lt <= 168) level = 'medium';

  return {
    metrics: {
      deployment_frequency: df >= 1 ? 'high' : 'low',
      lead_time: lt <= 24 ? 'high' : 'low'
    },
    overallLevel: level
  };
}

export function calculateBusinessImpact(dora: any, quality: any, business: any) {
  const hourlyRevenue = business.hourly_revenue || 0;
  const mttr = dora.mttr_hours || 0;
  const cfr = dora.change_failure_rate || 0;
  const df = dora.deployment_frequency_per_week || 0;

  // Annual impact of failures (Downtime)
  const annualFailures = df * 52 * cfr;
  const annualDowntimeHours = annualFailures * mttr;
  const revenueLoss = annualDowntimeHours * hourlyRevenue;

  // Efficiency impact (Tech Debt)
  const devCost = business.developer_hourly_cost || 80;
  const techDebtCost = (quality.tech_debt_hours || 0) * devCost;

  return {
    annualDowntimeHours: Math.round(annualDowntimeHours),
    annualRevenueLoss: Math.round(revenueLoss),
    techDebtFinancialLiability: Math.round(techDebtCost),
    annualImpact: Math.round(revenueLoss + techDebtCost)
  };
}

export function processImpactAnalysis(input: AnalysisInput) {
  const dora = input.dora || { deployment_frequency_per_week: 0, lead_time_hours: 0, change_failure_rate: 0, mttr_hours: 0 };
  const quality = input.quality || { error_rate_per_1000: 0, test_coverage: 0, tech_debt_hours: 0 };
  const business = input.business || { hourly_revenue: 0, developer_hourly_cost: 0, team_size: 0 };

  const doraClassification = classifyDORA(dora);
  const businessImpact = calculateBusinessImpact(dora, quality, business);

  return {
    doraClassification,
    businessImpact,
    recommendations: generateROIRecommendations(doraClassification, businessImpact)
  };
}

function generateROIRecommendations(dora: any, impact: any) {
  const recs = [];
  if (dora.overallLevel === 'low') recs.push('High ROI: Automate deployment pipeline to increase frequency.');
  if (impact.annualRevenueLoss > 100000) recs.push('Critical: Improve MTTR and stability to protect revenue.');
  return recs;
}
