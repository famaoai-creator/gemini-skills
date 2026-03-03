/**
 * Unit Economics Optimizer Core Library.
 * Analyzes LTV, CAC, and churn to ensure product profitability.
 */

export interface CustomerSegment {
  name: string;
  monthly_price: number;
  cac: number;
  monthly_churn_rate?: number; // Legacy support
  churnRate?: number;
  gross_margin?: number; // Legacy support
  grossMargin?: number;
  customer_count: number;
}

export interface SegmentAnalysis {
  name: string;
  monthlyRevenue: number;
  ltv: number;
  cac: number;
  ltvCacRatio: number;
  health: 'healthy' | 'at-risk' | 'unprofitable';
}

export function calculateLTV(segment: CustomerSegment): number {
  const churn = segment.churnRate || segment.monthly_churn_rate || 0.1;
  const margin = segment.grossMargin || segment.gross_margin || 0.8;
  const price = segment.monthly_price;
  
  if (churn === 0) return Infinity;
  // LTV = (ARPU * Gross Margin) / Churn
  return Math.round(((price * margin) / churn) * 100) / 100;
}

export function analyzeSegment(segment: CustomerSegment): SegmentAnalysis {
  const ltv = calculateLTV(segment);
  const ratio = ltv / segment.cac;
  
  let health: 'healthy' | 'at-risk' | 'unprofitable' = 'unprofitable';
  if (ratio >= 3) health = 'healthy';
  else if (ratio >= 1) health = 'at-risk';

  return {
    name: segment.name,
    monthlyRevenue: segment.monthly_price * segment.customer_count,
    ltv: Math.round(ltv),
    cac: segment.cac,
    ltvCacRatio: Math.round(ratio * 100) / 100,
    health
  };
}

export function processUnitEconomics(segments: CustomerSegment[]) {
  const analyses = segments.map(analyzeSegment);
  const totalMRR = analyses.reduce((sum, a) => sum + a.monthlyRevenue, 0);
  
  const recommendations: string[] = [];
  analyses.forEach(a => {
    if (a.health === 'unprofitable') {
      recommendations.push(`Segment "${a.name}" is losing money (LTV/CAC < 1). Increase pricing or reduce acquisition cost.`);
    }
  });

  return {
    portfolio: {
      totalMRR,
      totalARR: totalMRR * 12,
      segmentCount: segments.length
    },
    segments: analyses,
    recommendations
  };
}
