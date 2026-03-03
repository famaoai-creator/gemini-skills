/**
 * Refactoring Engine Core Library.
 * Statically analyzes source code for common code smells.
 */

export type SmellSeverity = 'high' | 'medium' | 'low';
export type SmellType =
  | 'long-function'
  | 'deep-nesting'
  | 'magic-number'
  | 'console-log'
  | 'missing-error-handling';

export interface CodeSmell {
  type: SmellType;
  line: number;
  severity: SmellSeverity;
  message: string;
  context?: string;
}

export interface AnalysisSummary {
  total: number;
  byType: Record<string, number>;
}

export interface EngineResult {
  file: string;
  smells: CodeSmell[];
  summary: AnalysisSummary;
}

export const THRESHOLDS = {
  maxFunctionLength: 30,
  maxNestingDepth: 4,
};

export function analyzeCode(content: string, filePath: string): EngineResult {
  const smells: CodeSmell[] = [];
  const lines = content.split('\n');

  let currentFunctionLines = 0;
  let inFunction = false;

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // 1. Detect deep nesting (heuristic based on indentation)
    const indentation = line.match(/^\s*/)?.[0].length || 0;
    const depth = indentation / 2;
    if (depth > THRESHOLDS.maxNestingDepth) {
      smells.push({
        type: 'deep-nesting',
        line: lineNum,
        severity: 'medium',
        message: `Deep nesting detected (level ${depth}). Consider extracting sub-logic.`,
        context: trimmed
      });
    }

    // 2. Detect magic numbers (any number with 3+ digits not in a safe context)
    if (/\b\d{3,}\b/.test(line) && !line.includes('const') && !line.includes('PORT')) {
      smells.push({
        type: 'magic-number',
        line: lineNum,
        severity: 'low',
        message: 'Potential magic number detected. Use named constants instead.',
        context: trimmed
      });
    }

    // 3. Detect console.log
    if (trimmed.includes('console.log(')) {
      smells.push({
        type: 'console-log',
        line: lineNum,
        severity: 'low',
        message: 'Debug log detected. Remove before production.',
        context: trimmed
      });
    }

    // Function length tracking (simple heuristic)
    if (trimmed.includes('function') || trimmed.includes('=> {')) {
      inFunction = true;
      currentFunctionLines = 0;
    }
    if (inFunction) {
      currentFunctionLines++;
      if (currentFunctionLines > THRESHOLDS.maxFunctionLength) {
        smells.push({
          type: 'long-function',
          line: lineNum,
          severity: 'medium',
          message: `Function too long (${currentFunctionLines} lines). Refactor into smaller units.`,
        });
        inFunction = false; // Reset to avoid duplicate noise
      }
    }
    if (trimmed === '}') inFunction = false;
  });

  const byType: Record<string, number> = {};
  smells.forEach(s => {
    byType[s.type] = (byType[s.type] || 0) + 1;
  });

  return {
    file: filePath,
    smells,
    summary: {
      total: smells.length,
      byType
    }
  };
}
