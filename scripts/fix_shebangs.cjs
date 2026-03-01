#!/usr/bin/env node
/**
 * Shebang Fixer Script v3.0
 * Ensures that #!/usr/bin/env node is at the very first line of script files.
 * Standards-compliant version (Script Optimization Mission).
 */

const { logger, errorHandler, safeReadFile, safeWriteFile, pathResolver, requireRole } = require('./system-prelude.cjs');
const fs = require('fs');
const path = require('path');

requireRole('Ecosystem Architect');

const rootDir = pathResolver.rootDir();

function main() {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const skillDirs = entries.filter(
    (e) =>
      e.isDirectory() &&
      !e.name.startsWith('.') &&
      !['node_modules', 'scripts', 'knowledge', 'work', 'templates', 'active', 'vault'].includes(e.name)
  );

  skillDirs.forEach((dir) => {
    const scriptsPath = path.join(rootDir, dir.name, 'scripts');
    if (!fs.existsSync(scriptsPath)) return;

    try {
      const files = fs.readdirSync(scriptsPath).filter((f) => f.endsWith('.cjs') || f.endsWith('.js'));
      files.forEach((file) => {
        const filePath = path.join(scriptsPath, file);
        try {
          const content = safeReadFile(filePath, { encoding: 'utf8' });

          if (content.includes('#!/usr/bin/env node') && !content.startsWith('#!')) {
            logger.info(`  [${dir.name}] Fixing Shebang position: ${file}`);
            const lines = content.split('\n');
            const shebangIdx = lines.findIndex((l) => l.startsWith('#!'));
            const shebangLine = lines[shebangIdx];
            lines.splice(shebangIdx, 1);
            safeWriteFile(filePath, shebangLine + '\n' + lines.join('\n'));
          }
        } catch (err) {
          logger.error(`Failed to process ${file}: ${err.message}`);
        }
      });
    } catch (_) {}
  });

  logger.success('Shebang fix complete.');
}

try {
  main();
} catch (err) {
  errorHandler(err, 'Shebang Fixer Failed');
}
