/**
 * TypeScript version of the Knowledge Tier Guard.
 *
 * Prevents confidential / personal data from leaking into lower-tier outputs.
 *
 * Tier hierarchy (higher number = more sensitive):
 *   personal (3) > confidential (2) > public (1)
 *
 * Data from a higher tier must never appear in a lower-tier output.
 *
 * Usage:
 *   import { validateInjection, detectTier } from '../../scripts/lib/tier-guard.js';
 *   const result = validateInjection('/knowledge/personal/notes.md', 'public');
 *   if (!result.allowed) throw new Error(result.reason);
 */

import * as path from 'node:path';
import type { TierLevel, TierWeightMap, TierValidation, MarkerScanResult } from './types.js';

/** Numeric weight for each tier (higher = more sensitive). */
export const TIERS: TierWeightMap = {
  personal: 3,
  confidential: 2,
  public: 1,
};

const KNOWLEDGE_ROOT: string = path.resolve(__dirname, '../../knowledge');

const TIER_PATHS: Record<TierLevel, string> = {
  personal: path.join(KNOWLEDGE_ROOT, 'personal'),
  confidential: path.join(KNOWLEDGE_ROOT, 'confidential'),
  public: KNOWLEDGE_ROOT,
};

/**
 * Determine the knowledge tier of a file based on its path.
 *
 * @param filePath - Absolute or relative path to the knowledge file
 * @returns The detected tier level
 */
export function detectTier(filePath: string): TierLevel {
  const resolved = path.resolve(filePath);
  if (resolved.startsWith(path.resolve(TIER_PATHS.personal))) return 'personal';
  if (resolved.startsWith(path.resolve(TIER_PATHS.confidential))) return 'confidential';
  return 'public';
}

/**
 * Check whether data from `sourceTier` is allowed to flow into `targetTier` output.
 *
 * @param sourceTier - Tier of the source data
 * @param targetTier - Tier of the target output
 * @returns true if the flow is allowed (source sensitivity <= target sensitivity)
 */
export function canFlowTo(sourceTier: TierLevel, targetTier: TierLevel): boolean {
  return TIERS[sourceTier] <= TIERS[targetTier];
}

/**
 * Validate that a knowledge file can be injected into output at the given tier.
 *
 * @param knowledgePath - Path to the knowledge file
 * @param outputTier    - Target output tier
 * @returns Validation result indicating whether injection is allowed
 */
export function validateInjection(knowledgePath: string, outputTier: TierLevel): TierValidation {
  const sourceTier = detectTier(knowledgePath);
  const allowed = canFlowTo(sourceTier, outputTier);
  const result: TierValidation = { allowed, sourceTier, outputTier };

  if (!allowed) {
    result.reason = `Cannot inject ${sourceTier}-tier data into ${outputTier}-tier output`;
  }

  return result;
}

/**
 * Scan text content for patterns that suggest sensitive / confidential data.
 *
 * @param content - Text to scan
 * @returns Object indicating whether markers were found and which patterns matched
 */
export function scanForConfidentialMarkers(content: string): MarkerScanResult {
  const MARKERS: RegExp[] = [
    /CONFIDENTIAL/i,
    /SECRET/i,
    /PRIVATE/i,
    /API[_-]?KEY/i,
    /PASSWORD/i,
    /TOKEN/i,
    /Bearer\s+[A-Za-z0-9\-._~+/]+=*/,
  ];

  const found: string[] = [];
  for (const pattern of MARKERS) {
    if (pattern.test(content)) {
      found.push(pattern.source);
    }
  }

  return { hasMarkers: found.length > 0, markers: found };
}
