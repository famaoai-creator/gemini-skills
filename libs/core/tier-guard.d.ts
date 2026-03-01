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
import type { TierLevel, TierWeightMap, TierValidation, MarkerScanResult } from './types.js';
/** Numeric weight for each tier (higher = more sensitive). */
export declare const TIERS: TierWeightMap;
/**
 * Determine the knowledge tier of a file based on its path.
 *
 * @param filePath - Absolute or relative path to the knowledge file
 * @returns The detected tier level
 */
export declare function detectTier(filePath: string): TierLevel;
/**
 * Check whether data from `sourceTier` is allowed to flow into `targetTier` output.
 *
 * @param sourceTier - Tier of the source data
 * @param targetTier - Tier of the target output
 * @returns true if the flow is allowed (source sensitivity <= target sensitivity)
 */
export declare function canFlowTo(sourceTier: TierLevel, targetTier: TierLevel): boolean;
/**
 * Validate that a knowledge file can be injected into output at the given tier.
 *
 * @param knowledgePath - Path to the knowledge file
 * @param outputTier    - Target output tier
 * @returns Validation result indicating whether injection is allowed
 */
export declare function validateInjection(knowledgePath: string, outputTier: TierLevel): TierValidation;
/**
 * Scan text content for patterns that suggest sensitive / confidential data.
 *
 * @param content - Text to scan
 * @returns Object indicating whether markers were found and which patterns matched
 */
export declare function scanForConfidentialMarkers(content: string): MarkerScanResult;
//# sourceMappingURL=tier-guard.d.ts.map