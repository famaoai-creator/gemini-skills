import * as fs from 'node:fs';
import * as path from 'node:path';
import { loadProjectStandards } from './config-loader.js';

const standards = loadProjectStandards();

export interface WalkOptions {
  maxDepth?: number;
  currentDepth?: number;
}

/**
 * Recursively walk through a directory and yield file paths.
 */
export function* walk(dir: string, options: WalkOptions = {}): Generator<string> {
  const { maxDepth = Infinity, currentDepth = 0 } = options;
  if (currentDepth > maxDepth) return;

  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (_e) {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (standards.ignore_dirs.includes(entry.name)) continue;
      yield* walk(fullPath, { ...options, currentDepth: currentDepth + 1 });
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (standards.ignore_extensions.includes(ext)) continue;
      yield fullPath;
    }
  }
}

/**
 * Get all files in a directory as an array.
 */
export function getAllFiles(dir: string, options: WalkOptions = {}): string[] {
  return Array.from(walk(dir, options));
}

/**
 * Asynchronously walk through a directory and yield file paths.
 */
export async function* walkAsync(dir: string, options: WalkOptions = {}): AsyncGenerator<string> {
  const { maxDepth = Infinity, currentDepth = 0 } = options;
  if (currentDepth > maxDepth) return;

  let entries;
  try {
    entries = await fs.promises.readdir(dir, { withFileTypes: true });
  } catch (_e) {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (standards.ignore_dirs.includes(entry.name)) continue;
      yield* walkAsync(fullPath, { ...options, currentDepth: currentDepth + 1 });
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (standards.ignore_extensions.includes(ext)) continue;
      yield fullPath;
    }
  }
}

/**
 * Get all files asynchronously.
 */
export async function getAllFilesAsync(dir: string, options: WalkOptions = {}): Promise<string[]> {
  const files: string[] = [];
  for await (const file of walkAsync(dir, options)) {
    files.push(file);
  }
  return files;
}

/**
 * Map an array through an async function with limited concurrency.
 */
export async function mapAsync<T, R>(items: T[], concurrency: number, taskFn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  const queue = [...items];
  const total = items.length;
  
  const runners = Array(Math.min(concurrency, items.length))
    .fill(null)
    .map(async () => {
      while (queue.length > 0) {
        const item = queue.shift()!;
        const index = total - queue.length - 1;
        results[index] = await taskFn(item);
      }
    });
  await Promise.all(runners);
  return results;
}
