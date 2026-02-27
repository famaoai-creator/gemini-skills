import { TierLevel, TierValidation, MarkerScanResult } from './types.js';

export function detectTier(filePath: string): TierLevel;
export function canFlowTo(source: TierLevel, target: TierLevel): boolean;
export function validateInjection(knowledgePath: string, outputTier: string): TierValidation;
export function scanForConfidentialMarkers(content: string): MarkerScanResult;
export function validateSovereignBoundary(content: string): { safe: boolean; detected: string[] };
export function validateWritePermission(filePath: string): { allowed: boolean; reason?: string };
export function validateReadPermission(filePath: string): { allowed: boolean; reason?: string };
