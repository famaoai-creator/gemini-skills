/**
 * Shared Business & Project Objects for Skill Synergy
 * These interfaces provide a common language for skills to exchange data.
 */
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
/**
 * Basic identity and strategic intent of a project/company.
 */
export interface ProjectIdentity {
    name: string;
    vision?: string;
    domain?: string;
    stage?: 'idea' | 'seed' | 'series-a' | 'series-b' | 'growth' | 'ipo';
}
/**
 * Common financial indicators used by modeling and optimization skills.
 */
export interface FinancialMetrics {
    mrr?: number;
    annualRevenue?: number;
    monthlyBurn?: number;
    cashOnHand?: number;
    growthRate?: number;
    churnRate?: number;
    grossMargin?: number;
    cac?: number;
    ltv?: number;
}
/**
 * Technical foundation info detected or used by engineering/talent skills.
 */
export interface TechStackInfo {
    languages: string[];
    frameworks: string[];
    tools: string[];
    infrastructure?: string[];
    database?: string[];
}
/**
 * Unified risk entry for reporting and audit skills.
 */
export interface RiskEntry {
    category: string;
    severity: Severity;
    risk: string;
    impact?: string;
    mitigation?: string;
}
/**
 * Strategic recommendation/action item.
 */
export interface StrategicAction {
    action: string;
    priority: Priority;
    area?: string;
    expectedImpact?: string;
}
/**
 * Represents a pointer to a large data artifact stored on disk.
 * Used in ADF to maintain audit trails without bloating JSON payloads.
 */
export interface ArtifactPointer {
    path: string;
    hash: string;
    format: string;
    size_bytes: number;
    metadata?: Record<string, any>;
}
/**
 * Content container for reporting and document generation.
 */
export interface DocumentArtifact {
    title: string;
    body: string;
    pointer?: ArtifactPointer;
    metadata?: Record<string, any>;
    format: 'markdown' | 'html' | 'text';
}
//# sourceMappingURL=shared-business-types.d.ts.map