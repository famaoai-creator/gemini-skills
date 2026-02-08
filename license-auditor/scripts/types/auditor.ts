/**
 * Type definitions for the license-auditor skill.
 *
 * The license-auditor scans a project's dependencies (from package.json and
 * node_modules) and classifies each dependency's license as permissive,
 * restrictive, or unknown.
 *
 * Usage:
 *   import type { AuditResult, AuditConfig } from './types/auditor.js';
 */

import type { SkillOutput } from '../../../scripts/lib/types.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** CLI arguments accepted by the license-auditor skill. */
export interface AuditConfig {
  /** Project directory to audit. */
  dir: string;
  /** Optional output file path for the JSON report. */
  out?: string;
}

// ---------------------------------------------------------------------------
// Risk Classification
// ---------------------------------------------------------------------------

/** License risk classification level. */
export type LicenseRisk = 'permissive' | 'restrictive' | 'unknown';

// ---------------------------------------------------------------------------
// Data Shapes
// ---------------------------------------------------------------------------

/** License information for a single package dependency. */
export interface PackageLicense {
  /** Package name (e.g. "express"). */
  name: string;
  /** Version range specified in package.json (e.g. "^4.18.0"). */
  version: string;
  /** SPDX license identifier or "UNKNOWN". */
  license: string;
  /** Computed risk classification for this license. */
  risk: LicenseRisk;
}

/** Aggregate summary counts by risk classification. */
export interface AuditSummary {
  /** Total number of dependencies audited. */
  total: number;
  /** Number of dependencies with permissive licenses. */
  permissive: number;
  /** Number of dependencies with restrictive licenses. */
  restrictive: number;
  /** Number of dependencies whose license could not be determined. */
  unknown: number;
}

/** Content of a LICENSE file found in the project root. */
export interface LicenseFileInfo {
  /** File name (e.g. "LICENSE", "LICENSE.md"). */
  name: string;
  /** First 2000 characters of the license file content. */
  content: string;
}

/** Full result data returned by the license-auditor skill. */
export interface AuditResult {
  /** Absolute path to the audited directory. */
  directory: string;
  /** SPDX license identifier from the project's own package.json. */
  projectLicense: string;
  /** Per-dependency license information. */
  packages: PackageLicense[];
  /** Aggregate counts by risk level. */
  summary: AuditSummary;
  /** LICENSE file content, if found in the project root. */
  licenseFile: LicenseFileInfo | null;
  /** Path where the JSON report was written (present when --out is used). */
  outputPath?: string;
}

// ---------------------------------------------------------------------------
// Skill Output Envelope
// ---------------------------------------------------------------------------

/** Standard skill-wrapper envelope typed for the license-auditor result. */
export type LicenseAuditorOutput = SkillOutput<AuditResult>;
