import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import { performAudit, AuditConfig } from './lib';
import * as tierGuard from '@agent/core/tier-guard';
import * as fsUtils from '@agent/core/fs-utils';
import { safeReadFile } from '@agent/core/secure-io';

vi.mock('node:fs');
vi.mock('@agent/core/tier-guard', () => ({
  validateSovereignBoundary: vi.fn(),
  validateWritePermission: vi.fn(),
}));
vi.mock('@agent/core/fs-utils');
vi.mock('@agent/core/secure-io', () => ({
  safeReadFile: vi.fn(),
  safeWriteFile: vi.fn(),
}));

describe('knowledge-auditor lib', () => {
  const mockConfig: AuditConfig = {
    audit_name: 'Test Audit',
    exclusions: ['node_modules'],
    severity_mapping: { personal_leak: 'HIGH' },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(tierGuard.validateWritePermission).mockReturnValue({ allowed: true } as any);
  });

  it('should detect sovereignty violations', () => {
    vi.mocked(fsUtils.getAllFiles).mockReturnValue(['/root/test.md']);
    vi.mocked(safeReadFile).mockReturnValue('secret data');
    vi.mocked(tierGuard.validateSovereignBoundary).mockReturnValue({
      safe: false,
      detected: ['secret'],
    } as any);

    const result = performAudit('/root', mockConfig);
    expect(result.status).toBe('violation_detected');
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].issue).toContain('Personal/Confidential');
  });

  it('should pass for clean files', () => {
    vi.mocked(fsUtils.getAllFiles).mockReturnValue(['/root/clean.md']);
    vi.mocked(safeReadFile).mockReturnValue('public data');
    vi.mocked(tierGuard.validateSovereignBoundary).mockReturnValue({ safe: true, detected: [] } as any);

    const result = performAudit('/root', mockConfig);
    expect(result.status).toBe('clean');
    expect(result.violations).toHaveLength(0);
  });
});
