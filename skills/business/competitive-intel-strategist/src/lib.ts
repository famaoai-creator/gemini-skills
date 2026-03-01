import fs from 'fs';
import path from 'path';
import { ProjectIdentity, StrategicAction } from '@agent/core/shared-business-types';

export interface Product extends ProjectIdentity {
  features?: string[]; pricing?: Record<string, number>; strengths?: string[]; weaknesses?: string[];
}

export interface CompetitiveInput { our_product: Product; competitors: Product[]; }

export interface GapAnalysis {
  gaps: { feature: string; offeredBy: string[] }[];
  advantages: { feature: string; unique: boolean }[];
}

export interface PricingAnalysis {
  tier: string; ourPrice: number; avgCompetitorPrice: number;
  priceDifferencePercent: number; position: 'below_market' | 'above_market' | 'competitive';
}

export interface CompetitiveResult {
  ourProduct: string; competitorCount: number; gapAnalysis: GapAnalysis;
  pricingAnalysis: PricingAnalysis[]; strategies: StrategicAction[];
}

export function analyzeGaps(ourProduct: Product, competitors: Product[]): GapAnalysis {
  const ourFeatures = new Set(ourProduct.features || []);
  const gaps: GapAnalysis['gaps'] = [];
  const advantages: GapAnalysis['advantages'] = [];
  const allCompFeatures = new Set<string>();
  for (const c of competitors) {
    for (const f of c.features || []) {
      allCompFeatures.add(f);
      if (!ourFeatures.has(f) && !gaps.some(g => g.feature === f)) {
        gaps.push({ feature: f, offeredBy: competitors.filter(x => (x.features || []).includes(f)).map(x => x.name) });
      }
    }
  }
  for (const f of ourFeatures) { if (!allCompFeatures.has(f)) advantages.push({ feature: f, unique: true }); }
  return { gaps, advantages };
}

export function analyzePricing(ourProduct: Product, competitors: Product[]): PricingAnalysis[] {
  const ourPricing = ourProduct.pricing || {};
  const tiers = Object.keys(ourPricing);
  const analysis: PricingAnalysis[] = [];
  for (const tier of tiers) {
    const ourPrice = ourPricing[tier];
    const compPrices = competitors.filter(c => c.pricing && c.pricing[tier] !== undefined).map(c => c.pricing![tier]!);
    if (compPrices.length === 0) continue;
    const avgCompPrice = compPrices.reduce((s, p) => s + p, 0) / compPrices.length;
    const diff = Math.round(((ourPrice - avgCompPrice) / avgCompPrice) * 100);
    analysis.push({ tier, ourPrice, avgCompetitorPrice: Math.round(avgCompPrice), priceDifferencePercent: diff, position: diff < -10 ? 'below_market' : diff > 10 ? 'above_market' : 'competitive' });
  }
  return analysis;
}

export function processCompetitiveAnalysis(input: CompetitiveInput): CompetitiveResult {
  const gapAnalysis = analyzeGaps(input.our_product, input.competitors || []);
  const pricingAnalysis = analyzePricing(input.our_product, input.competitors || []);
  
  return {
    ourProduct: input.our_product.name,
    competitorCount: (input.competitors || []).length,
    gapAnalysis, pricingAnalysis,
    strategies: [{ area: 'Competitive', action: 'Strategies derived from automated gap and pricing analysis.', priority: 'medium' }]
  };
}
