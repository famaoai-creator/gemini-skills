import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';
import * as classifier from '@agent/core/classifier';

/**
 * Intent Classifier Core Library.
 */

export interface IntentRules {
  resultKey: string;
  categories: Record<string, string[]>;
}

/**
 * Loads intent classification rules from a YAML file.
 */
export function loadRules(filePath: string): IntentRules {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Intent rules file not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.load(content) as IntentRules;
}

/**
 * Classifies the intent of a text file based on keywords.
 */
export function classifyIntent(filePath: string, rules: IntentRules) {
  return classifier.classifyFile(filePath, rules.categories, {
    resultKey: rules.resultKey,
  });
}
