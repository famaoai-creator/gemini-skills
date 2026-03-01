#!/usr/bin/env node
/**
 * Path Normalization Script v3.0
 * Standardizes hardcoded 'work/' paths to pathResolver.shared() calls.
 * Standards-compliant version (Script Optimization Mission).
 */

const { logger, errorHandler, safeReadFile, safeWriteFile, pathResolver, requireRole } = require('./system-prelude.cjs');
const fs = require('fs');
const path = require('path');

requireRole('Ecosystem Architect');

const filesToFix = [
  'skills/utilities/browser-navigator/scripts/navigate.cjs',
  'skills/audit/security-scanner/scripts/scan.cjs',
  'skills/ux/voice-command-listener/scripts/listen.cjs',
  'skills/media/layout-architect/scripts/extract_theme.cjs',
  'skills/connector/google-workspace-integrator/scripts/integrate.cjs',
];

function main() {
  filesToFix.forEach((relPath) => {
    const absPath = pathResolver.rootResolve(relPath);
    if (!fs.existsSync(absPath)) return;

    try {
      let content = safeReadFile(absPath, { encoding: 'utf8' });

      if (!content.includes('path-resolver.cjs')) {
        const importMatch = content.match(/const .* = require\(['"]path['"]\);/);
        if (importMatch) {
          const depth = relPath.split('/').length - 1;
          const prefix = '../'.repeat(depth);
          content = content.replace(
            importMatch[0],
            `${importMatch[0]}\nconst pathResolver = require('${prefix}scripts/lib/path-resolver.cjs');`
          );
        }
      }

      content = content.replace(
        /path\.join\((.*), ['"]work\/(.*)['"]\)/g,
        "path.join($1, pathResolver.shared('$2'))"
      );
      content = content.replace(
        /path\.resolve\((.*), ['"]work\/(.*)['"]\)/g,
        "path.resolve($1, pathResolver.shared('$2'))"
      );
      content = content.replace(/['"]work\/(.*?)['"]/g, "pathResolver.shared('$1')");

      safeWriteFile(absPath, content);
      logger.info(`[Fixed] ${relPath}`);
    } catch (err) {
      logger.error(`Failed to process ${relPath}: ${err.message}`);
    }
  });

  logger.success('Work path normalization complete.');
}

try {
  main();
} catch (err) {
  errorHandler(err, 'Work Path Fixer Failed');
}
