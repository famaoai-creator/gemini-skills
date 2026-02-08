const fs = require('fs');
const path = require('path');
const { logger } = require('./lib/core.cjs');

const rootDir = path.resolve(__dirname, '..');
const REQUIRED_FIELDS = ['name', 'description', 'status'];
const VALID_STATUSES = ['implemented', 'planned', 'conceptual'];

let errors = 0;
let checked = 0;

const SKIP_DIRS = new Set([
  'node_modules', 'knowledge', 'scripts', 'schemas', 'templates',
  'evidence', 'coverage', 'test-results', 'work', 'nonfunctional', 'dist', 'tests', '.github'
]);

const dirs = fs.readdirSync(rootDir).filter(f => {
  const fullPath = path.join(rootDir, f);
  return fs.statSync(fullPath).isDirectory() && !f.startsWith('.') && !SKIP_DIRS.has(f);
});

for (const dir of dirs) {
  const skillPath = path.join(rootDir, dir, 'SKILL.md');
  if (!fs.existsSync(skillPath)) continue;

  checked++;
  const content = fs.readFileSync(skillPath, 'utf8');

  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    logger.error(`${dir}: No YAML frontmatter found`);
    errors++;
    continue;
  }

  const frontmatter = fmMatch[1];
  for (const field of REQUIRED_FIELDS) {
    const regex = new RegExp(`^${field}:`, 'm');
    if (!regex.test(frontmatter)) {
      logger.error(`${dir}: Missing required field "${field}"`);
      errors++;
    }
  }

  const statusMatch = frontmatter.match(/^status:\s*(.+)$/m);
  if (statusMatch) {
    const status = statusMatch[1].trim();
    if (!VALID_STATUSES.includes(status)) {
      logger.error(`${dir}: Invalid status "${status}". Must be one of: ${VALID_STATUSES.join(', ')}`);
      errors++;
    }
  }
}

logger.info(`Checked ${checked} skills`);
if (errors > 0) {
  logger.error(`Found ${errors} validation errors`);
  process.exit(1);
} else {
  logger.success('All skills have valid metadata');
}
