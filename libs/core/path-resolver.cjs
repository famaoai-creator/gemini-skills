const path = require('path');
const fs = require('fs');

/**
 * Path Resolver Utility v4.0 (Protected VFS Edition)
 * Robust directory mapping with metadata for Deep Sandboxing.
 */

function findProjectRoot(startDir) {
  let current = startDir;
  while (current !== path.parse(current).root) {
    if (
      fs.existsSync(path.join(current, 'package.json')) &&
      fs.existsSync(path.join(current, 'skills'))
    ) {
      return current;
    }
    current = path.dirname(current);
  }
  return path.resolve(__dirname, '../..');
}

const rootDir = findProjectRoot(__dirname);
const ACTIVE_ROOT = path.join(rootDir, 'active');
const KNOWLEDGE_ROOT = path.join(rootDir, 'knowledge');
const SCRIPTS_ROOT = path.join(rootDir, 'scripts');
const VAULT_ROOT = path.join(rootDir, 'vault');
const INDEX_PATH = path.join(KNOWLEDGE_ROOT, 'orchestration/global_skill_index.json');

const pathResolver = {
  rootDir: () => rootDir,
  activeRoot: () => ACTIVE_ROOT,
  knowledgeRoot: () => KNOWLEDGE_ROOT,
  scriptsRoot: () => SCRIPTS_ROOT,
  vaultRoot: () => VAULT_ROOT,

  /**
   * Semantic Accessors with Protection Metadata
   */
  knowledge: (subPath = '') => path.join(KNOWLEDGE_ROOT, subPath),
  active: (subPath = '') => path.join(ACTIVE_ROOT, subPath),
  scripts: (subPath = '') => path.join(SCRIPTS_ROOT, subPath),
  vault: (subPath = '') => path.join(VAULT_ROOT, subPath),
  shared: (subPath = '') => path.join(ACTIVE_ROOT, 'shared', subPath),

  /**
   * Security Metadata Check
   * Determines if a path should be protected from direct 'fs' writes.
   */
  isProtected: (filePath) => {
    const resolved = path.resolve(filePath);
    // Knowledge and Vault are READONLY by default for scripts
    if (resolved.startsWith(KNOWLEDGE_ROOT)) return true;
    if (resolved.startsWith(VAULT_ROOT)) return true;
    // Scripts themselves should not be modified by scripts
    if (resolved.startsWith(SCRIPTS_ROOT) && !resolved.includes('active')) return true;
    return false;
  },

  skillDir: (skillName) => {
    if (!fs.existsSync(INDEX_PATH)) return path.join(rootDir, 'skills/utilities', skillName);
    const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
    const skill = (index.s || index.skills).find((s) => (s.n || s.name) === skillName);
    return skill && skill.path ? path.join(rootDir, skill.path) : path.join(rootDir, skillName);
  },

  missionDir: (missionId) => {
    const dir = path.join(ACTIVE_ROOT, 'missions', missionId);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
  },

  resolve: (logicalPath) => {
    if (!logicalPath) return rootDir;
    if (logicalPath.startsWith('skill://')) {
      const parts = logicalPath.slice(8).split('/');
      return path.join(pathResolver.skillDir(parts[0]), parts.slice(1).join('/'));
    }
    if (logicalPath.startsWith('active/shared/')) {
      return pathResolver.shared(logicalPath.replace('active/shared/', ''));
    }
    return path.isAbsolute(logicalPath) ? logicalPath : path.resolve(rootDir, logicalPath);
  },

  rootResolve: (relativePath) => {
    return path.isAbsolute(relativePath) ? relativePath : path.join(rootDir, relativePath);
  },
};

module.exports = pathResolver;
