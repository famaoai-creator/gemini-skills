#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { logger, fileUtils } = require('../../libs/core/core.cjs');

const rootDir = path.resolve(__dirname, '..');
const pluginRegistryPath = path.join(rootDir, 'knowledge/orchestration/plugin-registry.json');

function loadRegistry() {
  if (fs.existsSync(pluginRegistryPath)) {
    return JSON.parse(fs.readFileSync(pluginRegistryPath, 'utf8'));
  }
  return { plugins: [], last_updated: null };
}

function saveRegistry(registry) {
  registry.last_updated = new Date().toISOString();
  fileUtils.writeJson(pluginRegistryPath, registry);
}

function regenerateIndex() {
  try {
    execSync('node scripts/generate_skill_index.cjs', { cwd: rootDir, stdio: 'pipe' });
    logger.info('Global skill index regenerated.');
  } catch (e) {
    logger.warn('Failed to regenerate index: ' + e.message);
  }
}

function registerLocal(skillDir, category = 'utilities') {
  const registry = loadRegistry();
  const absDir = path.resolve(skillDir);
  const skillMd = path.join(absDir, 'SKILL.md');

  if (!fs.existsSync(skillMd)) {
    logger.error(`No SKILL.md found in ${absDir}`);
    process.exit(1);
  }

  const content = fs.readFileSync(skillMd, 'utf8');
  const nameMatch = content.match(/^name:\s*(.+)$/m);
  const name = nameMatch ? nameMatch[1].trim() : path.basename(absDir);

  if (registry.plugins.find((p) => p.name === name)) {
    logger.warn(`Plugin "${name}" is already registered`);
    return;
  }

  // Namespace Integration: Create symlink in skills/{category}/
  const targetNamespaceDir = path.join(rootDir, 'skills', category);
  if (!fs.existsSync(targetNamespaceDir)) {
    fs.mkdirSync(targetNamespaceDir, { recursive: true });
  }

  const linkPath = path.join(targetNamespaceDir, name);
  if (fs.existsSync(linkPath)) {
    logger.warn(`Path ${linkPath} already occupied. Skipping symlink creation.`);
  } else {
    try {
      fs.symlinkSync(absDir, linkPath, 'dir');
      logger.success(`Linked ${name} into Namespace: ${category}`);
    } catch (e) {
      logger.error(`Failed to create symlink: ${e.message}`);
    }
  }

  registry.plugins.push({
    name,
    category,
    path: absDir,
    installed_at: new Date().toISOString(),
    type: 'local',
  });

  saveRegistry(registry);
  regenerateIndex();
  logger.success(`Local skill "${name}" fully integrated into ecosystem.`);
}

function uninstallPlugin(name) {
  const registry = loadRegistry();
  const idx = registry.plugins.findIndex((p) => p.name === name);

  if (idx === -1) {
    logger.error(`Plugin "${name}" not found`);
    process.exit(1);
  }

  const plugin = registry.plugins[idx];

  // Remove symlink from Namespace
  if (plugin.category) {
    const linkPath = path.join(rootDir, 'skills', plugin.category, plugin.name);
    if (fs.existsSync(linkPath) && fs.lstatSync(linkPath).isSymbolicLink()) {
      fs.unlinkSync(linkPath);
      logger.info(`Removed symlink from skills/${plugin.category}`);
    }
  }

  registry.plugins.splice(idx, 1);
  saveRegistry(registry);
  regenerateIndex();
  logger.success(`Plugin "${name}" removed`);
}

function listPlugins() {
  const registry = loadRegistry();
  if (registry.plugins.length === 0) {
    console.log('No plugins installed.');
    return;
  }

  console.log(`\n${registry.plugins.length} registered plugins:\n`);
  for (const p of registry.plugins) {
    console.log(`  ${p.name.padEnd(30)} [${p.category || 'N/A'}] ${p.type}`);
    console.log(`    ${' '.repeat(30)} ${p.path || p.package}`);
  }
}

// CLI
const args = process.argv.slice(2);
const command = args[0];
const target = args[1];
const category = args.includes('--category') ? args[args.indexOf('--category') + 1] : 'utilities';

switch (command) {
  case 'register':
    if (!target) {
      logger.error('Usage: plugin-manager register <skill-dir> [--category <name>]');
      process.exit(1);
    }
    registerLocal(target, category);
    break;
  case 'uninstall':
  case 'remove':
    if (!target) {
      logger.error('Usage: plugin-manager uninstall <name>');
      process.exit(1);
    }
    uninstallPlugin(target);
    break;
  case 'list':
    listPlugins();
    break;
  default:
    console.log(`
Plugin Manager v2.0 - Hierarchical Namespace Integration

Usage:
  node scripts/plugin-manager.cjs register <skill-dir> [--category <name>]
  node scripts/plugin-manager.cjs uninstall <name>
  node scripts/plugin-manager.cjs list
`);
}
