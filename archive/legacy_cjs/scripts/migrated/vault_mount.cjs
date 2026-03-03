/**
 * scripts/vault_mount.cjs
 * Sovereign Vault Ingestion: Controlled Symlinking
 * 
 * Usage: node scripts/vault_mount.cjs <source_path> [mount_name]
 */
const fs = require('fs');
const path = require('path');
const { logger } = require('../libs/core/core.cjs');

const rootDir = path.resolve(__dirname, '..');
const mountDir = path.resolve(rootDir, 'vault/mounts');

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

  // Safety Check: Already exists?
  if (fs.existsSync(targetPath)) {
    const stats = fs.lstatSync(targetPath);
    if (stats.isSymbolicLink()) {
      logger.warn(`Mount point '${mountName}' already exists as a symlink. Overwriting...`);
      fs.unlinkSync(targetPath);
    } else {
      logger.error(`A file or directory named '${mountName}' already exists in vault/mounts/. Use a different mount name.`);
      process.exit(1);
    }
  }

  try {
    // Create symlink (Using directory junction on Windows if needed, but here assuming Unix)
    fs.symlinkSync(sourcePath, targetPath, 'dir');
    
    logger.success(`Successfully mounted '${sourcePath}' to 'vault/mounts/${mountName}'`);
    logger.info(`AI is now authorized to reference this data under the Sovereign Workspace Model.`);
    
    // Check if it's a git repo to suggest next steps
    if (fs.existsSync(path.join(targetPath, '.git'))) {
      logger.info('Detected Git repository. You can now use "git -C vault/mounts/' + mountName + ' status" to inspect it.');
    }

  } catch (error) {
    logger.error(`Failed to create mount: ${error.message}`);
    process.exit(1);
  }
}

main();
