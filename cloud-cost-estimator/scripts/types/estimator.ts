/**
 * Type definitions for the cloud-cost-estimator skill.
 *
 * The cloud-cost-estimator reads a YAML or JSON configuration file that
 * defines cloud services, looks up approximate on-demand pricing per
 * provider, and produces per-service and aggregate cost projections with
 * optimization recommendations.
 *
 * Usage:
 *   import type { EstimatorResult, EstimatorConfig } from './types/estimator.js';
 */

import type { SkillOutput } from '../../../scripts/lib/types.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** CLI arguments accepted by the cloud-cost-estimator skill. */
export interface EstimatorConfig {
  /** Path to a YAML or JSON config file defining cloud services. */
  input: string;
}

// ---------------------------------------------------------------------------
// Provider & Service Types
// ---------------------------------------------------------------------------

/** Supported cloud providers. */
export type CloudProvider = 'aws' | 'azure' | 'gcp';

/** Supported cloud service types. */
export type ServiceType =
  | 'compute'
  | 'database'
  | 'storage'
  | 'cache'
  | 'loadbalancer'
  | 'cdn'
  | 'serverless'
  | 'queue';

/** Supported instance size tiers. */
export type ServiceSize = 'small' | 'medium' | 'large' | 'xlarge';

// ---------------------------------------------------------------------------
// Service Cost
// ---------------------------------------------------------------------------

/** Estimated cost for a single cloud service entry. */
export interface ServiceCost {
  /** Human-readable name of the service. */
  name: string;
  /** Normalized service type category. */
  type: ServiceType;
  /** Cloud provider for this service. */
  provider: CloudProvider;
  /** Instance size tier. */
  size: ServiceSize;
  /** Number of instances of this service. */
  count: number;
  /** Estimated monthly cost in USD (on-demand pricing). */
  monthlyCost: number;
}

// ---------------------------------------------------------------------------
// Skill Result
// ---------------------------------------------------------------------------

/** Full result data returned by the cloud-cost-estimator skill. */
export interface EstimatorResult {
  /** File name of the parsed configuration file. */
  source: string;
  /** Per-service cost breakdown. */
  services: ServiceCost[];
  /** Total estimated monthly cost across all services (USD). */
  totalMonthlyCost: number;
  /** Total estimated yearly cost across all services (USD). */
  totalYearlyCost: number;
  /** Cost optimization recommendations. */
  recommendations: string[];
}

// ---------------------------------------------------------------------------
// Skill Output Envelope
// ---------------------------------------------------------------------------

/** Standard skill-wrapper envelope typed for the cloud-cost-estimator result. */
export type CloudCostEstimatorOutput = SkillOutput<EstimatorResult>;
