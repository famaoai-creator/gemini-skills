import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { analyzeCodeComplexity, detectTechDebt, checkInfrastructure, generateRoadmap } from './lib';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

describe('strategic-roadmap-planner lib', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'roadmap-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should analyze code complexity correctly', () => {
    fs.writeFileSync(path.join(tmpDir, 'a.ts'), 'line1\nline2\nline3');
    fs.writeFileSync(path.join(tmpDir, 'b.js'), 'line1\nline2\nline3');
    
    const stats = analyzeCodeComplexity(tmpDir);
    expect(stats.totalFiles).toBe(2);
    expect(stats.totalLines).toBe(6);
    expect(stats.avgFileSize).toBe(3);
  });

  it('should detect tech debt from comments', () => {
    fs.writeFileSync(path.join(tmpDir, 'debt.ts'), '// TODO: fix later\n// HACK: temporary');
    const debt = detectTechDebt(tmpDir);
    expect(debt.totalTodos).toBe(1);
    expect(debt.totalHacks).toBe(1);
    expect(debt.debtScore).toBeGreaterThan(0);
  });

  it('should check infrastructure state', () => {
    fs.mkdirSync(path.join(tmpDir, 'tests'));
    fs.writeFileSync(path.join(tmpDir, 'README.md'), '# test');
    const infra = checkInfrastructure(tmpDir);
    expect(infra.hasTests).toBe(true);
    expect(infra.hasDocumentation).toBe(true);
    expect(infra.hasCICD).toBe(false);
  });

  it('should generate strategic roadmap based on inputs', () => {
    const complexity = { totalFiles: 10, totalLines: 1000, avgFileSize: 100, largeFiles: [], languages: {} };
    const debt = { totalTodos: 5, totalHacks: 2, totalFixmes: 0, debtScore: 20, hotspots: [] };
    const velocity = { commitsLast4Weeks: 20, commitsLastWeek: 5, avgPerWeek: 5 };
    const infra = { hasCICD: true, hasTests: true, hasLinting: true, hasTypeChecking: true, hasDocumentation: true, hasContainerization: true };
    
    const result = generateRoadmap(complexity, debt, velocity, infra, 3);
    expect(result.phases).toHaveLength(3);
    expect(result.priorities).toHaveLength(0); // Healthy state
  });

  it('should elevate priority when velocity is stalled despite low debt', () => {
    const complexity = { totalFiles: 10, totalLines: 1000, avgFileSize: 100, largeFiles: [], languages: {} };
    const debt = { totalTodos: 0, totalHacks: 0, totalFixmes: 0, debtScore: 0, hotspots: [] };
    const velocity = { commitsLast4Weeks: 0, commitsLastWeek: 0, avgPerWeek: 0 };
    const infra = { hasCICD: true, hasTests: true, hasLinting: true, hasTypeChecking: true, hasDocumentation: true, hasContainerization: true };
    
    const result = generateRoadmap(complexity, debt, velocity, infra, 3);
    expect(result.priorities.some(p => p.priority === 'critical' && p.area === 'Process Optimization')).toBe(true);
  });
});
