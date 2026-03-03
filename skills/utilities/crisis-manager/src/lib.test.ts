import { describe, it, expect } from 'vitest';
import { analyzeLogLines, generateIncidentReport } from './lib';

describe('crisis-manager lib', () => {
  it('should count errors and extract patterns from sample logs', () => {
    const lines = [
      'INFO: Starting server',
      'ERROR: Cannot connect to database at localhost:5432',
      'WARN: Retrying connection',
      'FATAL: Database connection failed after 3 retries',
      'ERROR: ECONNREFUSED 127.0.0.1:5432',
    ];
    const analysis = analyzeLogLines(lines);
    expect(analysis.errorCount).toBe(2);
    expect(analysis.fatalCount).toBe(1);
    expect(analysis.warnCount).toBe(1);
    expect(analysis.topPatterns).toContain('ECONNREFUSED');
  });

  it('should generate a critical report when fatal errors exist', () => {
    const analysis = { errorCount: 2, fatalCount: 1, warnCount: 0, topPatterns: [] };
    const report = generateIncidentReport(analysis);
    expect(report.severity).toBe('critical');
    expect(report.summary).toContain('CRITICAL FAILURE');
  });

  it('should generate a medium report for minor errors', () => {
    const analysis = { errorCount: 1, fatalCount: 0, warnCount: 5, topPatterns: [] };
    const report = generateIncidentReport(analysis);
    expect(report.severity).toBe('medium');
  });

  it('should generate low severity for clean logs', () => {
    const analysis = { errorCount: 0, fatalCount: 0, warnCount: 0, topPatterns: [] };
    const report = generateIncidentReport(analysis);
    expect(report.severity).toBe('low');
  });
});
