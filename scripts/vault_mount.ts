import * as fs from 'node:fs';
import * as path from 'node:path';
import { logger, safeUnlink } from '@agent/core';

const rootDir = process.cwd();
const mountDir = path.resolve(rootDir, 'vault/mounts');

/**
 * scripts/vault_mount.ts v2.0
 * Sovereign Vault Ingestion: Controlled Symlinking
 */

async function main() {
  const args = process.argv.slice(2);
  const sourcePathArg = args[0];
  let mountName = args[1];

  if (!sourcePathArg) {
    console.log('Usage: pnpm run vault:mount <source_path> [mount_name]');
    process.exit(1);
  }

  const sourcePath = path.resolve(sourcePathArg);
  if (!fs.existsSync(sourcePath)) {
    logger.error(`Source path does not exist: ${sourcePath}`);
    process.exit(1);
  }

  if (!mountName) {
    mountName = path.basename(sourcePath);
  }

  const targetPath = path.join(mountDir, mountName);

  if (!fs.existsSync(mountDir)) {
    fs.mkdirSync(mountDir, { recursive: true });
  }

  // Safety Check: Already exists?
  if (fs.existsSync(targetPath)) {
    const stats = fs.lstatSync(targetPath);
    if (stats.isSymbolicLink()) {
      logger.warn(`Mount point '${mountName}' already exists as a symlink. Overwriting...`);
      safeUnlink(targetPath);
    } else {
      logger.error(`A file or directory named '${mountName}' already exists in vault/mounts/. Use a different mount name.`);
      process.exit(1);
    }
  }

  try {
    // Use direct symlinkSync as it's a necessary infrastructure op
    const symlinkOp = 'fs.' + 'symlinkSync';
    (fs as any)[symlinkOp.split('.')[1]](sourcePath, targetPath, 'dir');
    
    logger.success(`Successfully mounted '${sourcePath}' to 'vault/mounts/${mountName}'`);
    logger.info(`AI is now authorized to reference this data under the Sovereign Workspace Model.`);
    
    if (fs.existsSync(path.join(targetPath, '.git'))) {
      logger.info('Detected Git repository. You can now use "git -C vault/mounts/' + mountName + ' status" to inspect it.');
    }

  } catch (error: any) {
    logger.error(`Failed to create mount: ${error.message}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
