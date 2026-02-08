const fs = require('fs');
const path = require('path');
const glob = require('glob');
const yaml = require('js-yaml');
const { runSkill } = require('../../scripts/lib/skill-wrapper.cjs');

const rootDir = process.argv[2] || '.';

// --- Knowledge Layer Paths ---
const KNOWLEDGE_DIR = path.join(__dirname, '../../knowledge');
const PATTERNS_FILE = path.join(KNOWLEDGE_DIR, 'schema/detection-patterns.yaml');
const COMMON_EXCLUDES_FILE = path.join(KNOWLEDGE_DIR, 'common/exclude-patterns.yaml');

// --- Load Configuration from Knowledge Layer ---

function loadConfig() {
  try {
    return yaml.load(fs.readFileSync(PATTERNS_FILE, 'utf8'));
  } catch (_e) {
    return {
      patterns: [
        { glob: '**/*.sql', type: 'sql' },
        { glob: '**/schema.prisma', type: 'prisma' },
        { glob: '**/openapi.yaml', type: 'openapi' }
      ],
      exclude: { directories: ['node_modules', 'dist', 'build'] },
      display: { max_content_length: 20000 }
    };
  }
}

function loadExcludes() {
  try {
    const common = yaml.load(fs.readFileSync(COMMON_EXCLUDES_FILE, 'utf8'));
    return common.directories || [];
  } catch (_e) {
    return ['node_modules', 'dist', 'build'];
  }
}

runSkill('schema-inspector', () => {
    const config = loadConfig();
    const commonExcludes = loadExcludes();

    const excludeDirs = [...new Set([
      ...(config.exclude?.directories || []),
      ...commonExcludes
    ])];

    const ignorePatterns = excludeDirs.map(d => `${d}/**`);
    if (config.exclude?.patterns) {
      ignorePatterns.push(...config.exclude.patterns);
    }

    const patterns = config.patterns.map(p => p.glob);
    const _displayConfig = config.display || { max_content_length: 20000 };

    const files = glob.sync(patterns, {
      cwd: rootDir,
      ignore: ignorePatterns,
      nodir: true
    });

    if (files.length === 0) {
        return { rootDir: path.resolve(rootDir), totalFiles: 0, filesByType: {}, files: [] };
    }

    // Group files by type
    const filesByType = {};
    files.forEach(file => {
      let fileType = 'unknown';
      for (const pattern of config.patterns) {
        const patternBase = pattern.glob.replace('**/', '').replace('*', '');
        if (file.includes(patternBase) || file.endsWith(patternBase.replace('*', ''))) {
          fileType = pattern.type;
          break;
        }
      }

      if (!filesByType[fileType]) filesByType[fileType] = [];
      filesByType[fileType].push(file);
    });

    return {
        rootDir: path.resolve(rootDir),
        totalFiles: files.length,
        filesByType,
        files
    };
});
