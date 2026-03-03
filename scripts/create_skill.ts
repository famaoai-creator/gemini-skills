/**
 * scripts/create_skill.ts
 * Scaffolds a new skill from template.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import { logger } from '@agent/core/core';
import { safeReadFile, safeWriteFile } from '@agent/core';
import * as pathResolver from '@agent/core/path-resolver';

function parseArgs() {
  const args = process.argv.slice(2);
  const name = args.find((a) => !a.startsWith('--'));
  const descIdx = args.indexOf('--description');
  const description = descIdx !== -1 ? args[descIdx + 1] : '';
  const templateIdx = args.indexOf('--template');
  const template = templateIdx !== -1 ? args[templateIdx + 1] : 'ts';
  const catIdx = args.indexOf('--category');
  const category = catIdx !== -1 ? args[catIdx + 1] : 'utilities';
  return { name, description, template, category };
}

function copyTemplate(templateDir: string, targetDir: string, replacements: Record<string, string>) {
  if (!fs.existsSync(templateDir)) {
    logger.error(`Template directory not found: ${templateDir}`);
    process.exit(1);
  }

  function walk(src: string, dest: string) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        walk(srcPath, destPath);
      } else {
        try {
          let content = safeReadFile(srcPath, { encoding: 'utf8' }) as string;
          for (const [key, val] of Object.entries(replacements)) {
            content = content.replace(new RegExp(key.replace(/[{}]/g, '\$&'), 'g'), val);
          }
          safeWriteFile(destPath, content);
        } catch (err: any) {
          logger.error(`Failed to copy ${srcPath}: ${err.message}`);
        }
      }
    }
  }

  walk(templateDir, targetDir);
}

async function main() {
  const { name, description, template, category } = parseArgs();

  if (!name) {
    console.log('Usage: node create_skill.js <skill-name> [options]');
    process.exit(0);
  }

  const targetDir = path.join(process.cwd(), 'skills', category, name);
  if (fs.existsSync(targetDir)) {
    logger.error(`Skill "${name}" already exists in category "${category}"`);
    process.exit(1);
  }

  const templateDir = path.join(process.cwd(), 'templates', `skill-template-${template}`);
  const replacements = {
    '{{SKILL_NAME}}': name,
    '{{DESCRIPTION}}': description || `${name} skill`,
    '{{DATE}}': new Date().toISOString().split('T')[0],
  };

  logger.info(`Creating skill "${name}" in category "${category}" from ${template} template...`);
  copyTemplate(templateDir, targetDir, replacements);

  logger.success(`Skill "${name}" created at ${targetDir}`);
}

main().catch(err => {
  logger.error(err.message);
  process.exit(1);
});
