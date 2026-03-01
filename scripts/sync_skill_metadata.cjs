#!/usr/bin/env node
/**
 * Metadata Ecosystem Sync v3.0
 * Synchronizes code (yargs), SKILL.md (SoT), and package.json (npm).
 * Standards-compliant version (Script Optimization Mission).
 */

const { logger, errorHandler, safeReadFile, safeWriteFile, pathResolver, requireRole } = require('./system-prelude.cjs');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const chalk = require('chalk');

requireRole('Ecosystem Architect');

const skillsRootDir = pathResolver.rootResolve('skills');

function extractArgsFromCode(scriptPath) {
  if (!fs.existsSync(scriptPath)) return [];
  try {
    const content = safeReadFile(scriptPath, { encoding: 'utf8' });
    const args = [];
    const optionRegex = /\.option\(['"]([^'"]+)['"],\s*\{([\s\S]*?)\}\)/g;
    let match;

    while ((match = optionRegex.exec(content)) !== null) {
      const body = match[2];
      const arg = { name: match[1] };
      const aliasMatch = body.match(/alias:\s*['"]([^'"]+)['"]/);
      const typeMatch = body.match(/type:\s*['"]([^'"]+)['"]/);
      const demandMatch = body.match(/demandOption:\s*true/);
      const descMatch = body.match(/desc(?:ribe|ription)?:\s*['"]([^'"]+)['"]/);

      if (aliasMatch) arg.short = aliasMatch[1];
      if (typeMatch) arg.type = typeMatch[1];
      if (demandMatch) arg.required = true;
      if (descMatch) arg.description = descMatch[1];
      args.push(arg);
    }
    return args;
  } catch (_) {
    return [];
  }
}

function syncSkill(cat, dir) {
  const skillFullDir = path.join(skillsRootDir, cat, dir);
  const skillMdPath = path.join(skillFullDir, 'SKILL.md');
  const pkgPath = path.join(skillFullDir, 'package.json');
  const scriptsDir = path.join(skillFullDir, 'scripts');

  if (!fs.existsSync(skillMdPath)) return;

  try {
    let mainScript = path.join(scriptsDir, 'main.cjs');
    if (!fs.existsSync(mainScript) && fs.existsSync(scriptsDir)) {
      const files = fs.readdirSync(scriptsDir).filter((f) => f.endsWith('.cjs'));
      if (files.length > 0) mainScript = path.join(scriptsDir, files[0]);
    }

    const codeArgs = extractArgsFromCode(mainScript);
    const originalContent = safeReadFile(skillMdPath, { encoding: 'utf8' });
    const fmMatch = originalContent.match(/^---\n([\s\S]*?)\n---/m);

    if (fmMatch) {
      const fm = yaml.load(fmMatch[1]);
      if (codeArgs.length > 0) fm.arguments = codeArgs;
      fm.category = cat.charAt(0).toUpperCase() + cat.slice(1);
      fm.last_updated = new Date().toISOString().split('T')[0];

      const newFm = `---\n${yaml.dump(fm)}---`;
      const newMdContent = originalContent.replace(/^---\n[\s\S]*?\n---/m, newFm);

      if (newMdContent !== originalContent) {
        safeWriteFile(skillMdPath, newMdContent);
        logger.info(`  [${dir}] Updated SKILL.md`);
      }

      if (fs.existsSync(pkgPath)) {
        const pkgContent = safeReadFile(pkgPath, { encoding: 'utf8' });
        const pkg = JSON.parse(pkgContent);
        if (pkg.description !== fm.description) {
          pkg.description = fm.description;
          safeWriteFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
          logger.info(`  [${dir}] Updated package.json description`);
        }
      }
    }
  } catch (err) {
    logger.error(`  [${dir}] Sync failed: ${err.message}`);
  }
}

try {
  logger.info('🔄 Synchronizing Ecosystem Metadata...');
  const categories = fs.readdirSync(skillsRootDir).filter((f) => fs.lstatSync(path.join(skillsRootDir, f)).isDirectory());
  categories.forEach((cat) => {
    const catPath = path.join(skillsRootDir, cat);
    const skillDirs = fs.readdirSync(catPath).filter((f) => fs.lstatSync(path.join(catPath, f)).isDirectory());
    skillDirs.forEach((dir) => syncSkill(cat, dir));
  });
  logger.success('✨ All skill metadata is now consistent across MD, JS, and JSON.');
} catch (err) {
  errorHandler(err, 'Metadata Sync Failed');
}
