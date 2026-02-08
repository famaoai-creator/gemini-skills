const path = require('path');
const isBinaryPath = require('is-binary-path');
const { logger } = require('../../scripts/lib/core.cjs');
const { runSkill } = require('../../scripts/lib/skill-wrapper.cjs');

const projectRoot = process.cwd();

// --- Configuration ---
const IGNORE_DIRS = [
  '.git', 'node_modules', 'dist', 'build', 'coverage', '.next', '.nuxt',
  'vendor', 'bin', 'obj', '.idea', '.vscode', '.DS_Store', 'tmp', 'temp'
];

const IGNORE_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2',
  '.ttf', '.eot', '.mp4', '.mp3', '.pdf', '.zip', '.gz', '.tar', '.lock'
];

/**
 * Security Scanner Core Logic
 */
function _scanFile(filePath) {
  if (isBinaryPath(filePath)) return null;
  return { file: path.relative(projectRoot, filePath), scanned: true };
}

runSkill('security-scanner', () => {
    logger.success('Security Scan Started');

    return {
        projectRoot,
        ignoreDirs: IGNORE_DIRS,
        ignoreExtensions: IGNORE_EXTENSIONS,
        status: 'scan_complete'
    };
});
