/**
 * scripts/bootstrap.ts
 * Environment-agnostic bootstrap script to establish reference to @agent/core.
 * Manually constructs symbolic links to ensure core utilities are available.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const rootDir = process.cwd();
const targetDir = path.join(rootDir, 'node_modules', '@agent');
const coreSource = path.join(rootDir, 'libs', 'core');
const coreLink = path.join(targetDir, 'core');

console.log('[Bootstrap] Setting up @agent/core linkage...');

try {
  // Ensure node_modules/@agent exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Remove existing link or file for reconstruction
  if (fs.existsSync(coreLink)) {
    const stats = fs.lstatSync(coreLink);
    if (stats.isSymbolicLink() || stats.isFile()) {
      fs.unlinkSync(coreLink);
    } else if (stats.isDirectory()) {
      fs.rmSync(coreLink, { recursive: true, force: true });
    }
  }

  // Create symbolic link using relative path
  const relativeSource = path.relative(targetDir, coreSource);
  fs.symlinkSync(relativeSource, coreLink, 'dir');

  console.log(`[Bootstrap] Success: @agent/core -> ${relativeSource}`);
} catch (err: any) {
  console.error(`[Bootstrap] Failed to create link: ${err.message}`);
  process.exit(1);
}
