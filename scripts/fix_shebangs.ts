/**
 * scripts/fix_shebangs.ts
 * Ensures that #!/usr/bin/env node is at the very first line of script files.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { logger, safeReadFile, safeWriteFile } from '@agent/core';

const rootDir = process.cwd();

async function main() {
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
      const files = fs.readdirSync(scriptsPath).filter((f) => f.endsWith('.cjs') || f.endsWith('.js') || f.endsWith('.ts'));
      files.forEach((file) => {
        const filePath = path.join(scriptsPath, file);
        try {
          const content = safeReadFile(filePath, { encoding: 'utf8' }) as string;

          if (content.includes('#!/usr/bin/env node') && !content.startsWith('#!')) {
            logger.info(`  [${dir.name}] Fixing Shebang position: ${file}`);
            const lines = content.split('\n');
            const shebangIdx = lines.findIndex((l) => l.startsWith('#!'));
            const shebangLine = lines[shebangIdx];
            lines.splice(shebangIdx, 1);
            safeWriteFile(filePath, shebangLine + '\n' + lines.join('\n'));
          }
        } catch (err: any) {
          logger.error(`Failed to process ${file}: ${err.message}`);
        }
      });
    } catch (_) {}
  });

  logger.success('Shebang fix complete.');
}

if (require.main === module) {
  main().catch(err => {
    logger.error(`Shebang Fixer Failed: ${err.message}`);
    process.exit(1);
  });
}
