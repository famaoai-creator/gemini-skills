/**
 * Type definitions for the sensitivity-detector skill.
 *
 * The sensitivity-detector scans text content for personally identifiable
 * information (PII) such as email addresses, IPv4 addresses, Japanese phone
 * numbers, and credit card numbers using regular-expression matching.
 *
 * Usage:
 *   import type { DetectorResult, DetectorConfig } from './types/detector.js';
 */

import type { SkillOutput } from '../../../scripts/lib/types.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** CLI arguments accepted by the sensitivity-detector skill. */
export interface DetectorConfig {
  /** Path to the file to scan for PII patterns. */
  input: string;
}

// ---------------------------------------------------------------------------
// PII Pattern Types
// ---------------------------------------------------------------------------

/**
 * Category of PII pattern detected in the input content.
 *
 * - email       - RFC-style email addresses
 * - ipv4        - IPv4 addresses (dotted-quad notation)
 * - phone_jp    - Japanese domestic phone numbers (hyphen-separated)
 * - credit_card - 16-digit credit-card numbers (with optional separators)
 */
export type PIICategory = 'email' | 'ipv4' | 'phone_jp' | 'credit_card';

// ---------------------------------------------------------------------------
// Findings
// ---------------------------------------------------------------------------

/**
 * Map of each detected PII category to the number of occurrences found.
 * Only categories with at least one match are present in the record.
 */
export type PIIFindings = Partial<Record<PIICategory, number>>;

// ---------------------------------------------------------------------------
// Skill Result
// ---------------------------------------------------------------------------

/** Full result data returned by the sensitivity-detector skill. */
export interface DetectorResult {
  /** Whether any PII pattern was detected in the scanned content. */
  hasPII: boolean;
  /**
   * Per-category match counts. Empty object when no PII is found;
   * otherwise contains only categories that had at least one match.
   */
  findings: PIIFindings;
}

// ---------------------------------------------------------------------------
// Skill Output Envelope
// ---------------------------------------------------------------------------

/** Standard skill-wrapper envelope typed for the sensitivity-detector result. */
export type SensitivityDetectorOutput = SkillOutput<DetectorResult>;
