/**
 * scripts/validate_skills.ts
 * Validates skill metadata and structural integrity.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { logger } from '@agent/core/core';

const rootDir = process.cwd();
const REQUIRED_FIELDS = ['name', 'description', 'status'];
const VALID_STATUSES = ['implemented', 'planned', 'conceptual', 'unstable'];

async function main() {
  let errors = 0;
  let checked = 0;

  const skillsRootDir = path.join(rootDir, 'skills');
  if (!fs.existsSync(skillsRootDir)) return;

  const categories = fs.readdirSync(skillsRootDir).filter(f => fs.lstatSync(path.join(skillsRootDir, f)).isDirectory());

  for (const cat of categories) {
    const catPath = path.join(skillsRootDir, cat);
    const skillDirs = fs.readdirSync(catPath).filter(f => fs.lstatSync(path.join(catPath, f)).isDirectory());

    for (const dir of skillDirs) {
      const skillFullDir = path.join(catPath, dir);
      const skillMdPath = path.join(skillFullDir, 'SKILL.md');
      if (!fs.existsSync(skillMdPath)) continue;

      checked++;
      const content = fs.readFileSync(skillMdPath, 'utf8');
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);

      if (!fmMatch) {
        logger.error(`${cat}/${dir}: No YAML frontmatter found`);
        errors++;
        continue;
      }

      const frontmatter = fmMatch[1];
      for (const field of REQUIRED_FIELDS) {
        if (!new RegExp(`^${field}:`, 'm').test(frontmatter)) {
          logger.error(`${cat}/${dir}: Missing required field "${field}"`);
          errors++;
        }
      }

      const statusMatch = frontmatter.match(/^status:\s*(.+)$/m);
      if (statusMatch && !VALID_STATUSES.includes(statusMatch[1].trim())) {
        logger.error(`${cat}/${dir}: Invalid status "${statusMatch[1].trim()}"`);
        errors++;
      }

      // Basic structure check
      if (!fs.existsSync(path.join(skillFullDir, 'package.json'))) {
        logger.error(`${cat}/${dir}: Missing package.json`);
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
}

main().catch(err => {
  logger.error(err.message);
  process.exit(1);
});
