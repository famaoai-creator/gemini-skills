#!/usr/bin/env node
/**
 * Documentation Generator Script v3.0
 * Generates a comprehensive skill catalog from SKILL.md files.
 * Standards-compliant version (Script Optimization Mission).
 */

const { logger, errorHandler, safeReadFile, safeWriteFile, pathResolver, requireRole } = require('./system-prelude.cjs');
const { runSkill } = require('../../libs/core/skill-wrapper.cjs');
const { createStandardYargs } = require('../../libs/core/cli-utils.cjs');
const fs = require('fs');
const path = require('path');

requireRole('Ecosystem Architect');

const argv = createStandardYargs()
  .option('out', {
    alias: 'o',
    type: 'string',
    description: 'Output path for the catalog markdown file',
    default: pathResolver.shared('SKILL-CATALOG.md'),
  })
  .help().parseSync();

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fm = match[1];
  const get = (key) => {
    const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
    return m ? m[1].trim() : '';
  };
  return {
    name: get('name'),
    description: get('description'),
    status: get('status'),
  };
}

function inspectSkillDir(dirPath) {
  const hasScriptsDir = fs.existsSync(path.join(dirPath, 'scripts'));
  const hasPackageJson = fs.existsSync(path.join(dirPath, 'package.json'));

  let hasTypeScript = false;
  if (hasScriptsDir) {
    const files = fs.readdirSync(path.join(dirPath, 'scripts'));
    hasTypeScript = files.some((f) => /\.ts$/.test(f));
  }
  if (!hasTypeScript) {
    try {
      const rootFiles = fs.readdirSync(dirPath);
      hasTypeScript = rootFiles.some((f) => /\.ts$/.test(f));
    } catch (_) {}
  }

  return { hasScriptsDir, hasPackageJson, hasTypeScript };
}

function deriveCLICommand(dirName) {
  return `node scripts/cli.cjs run ${dirName}`;
}

runSkill('generate-docs', () => {
  const skillsRootDir = pathResolver.rootResolve('skills');
  const categories = fs.readdirSync(skillsRootDir).filter(f => fs.statSync(path.join(skillsRootDir, f)).isDirectory());
  
  const skills = [];
  for (const cat of categories) {
    const catPath = path.join(skillsRootDir, cat);
    const skillDirs = fs.readdirSync(catPath).filter(f => fs.statSync(path.join(catPath, f)).isDirectory());
    
    for (const dir of skillDirs) {
      const relPath = path.join('skills', cat, dir);
      const skillFullDir = pathResolver.rootResolve(relPath);
      const skillMdPath = path.join(skillFullDir, 'SKILL.md');
      if (!fs.existsSync(skillMdPath)) continue;

      try {
        const content = safeReadFile(skillMdPath, { encoding: 'utf8' });
        const fm = parseFrontmatter(content);
        if (!fm) continue;

        const info = inspectSkillDir(skillFullDir);
        const cliCommand = (fm.status === 'implemented' || fm.status === 'impl') ? deriveCLICommand(dir) : '';

        skills.push({
          dir,
          name: fm.name || dir,
          description: fm.description,
          status: fm.status,
          cliCommand,
          ...info,
        });
      } catch (_) {}
    }
  }

  const implemented = skills.filter((s) => s.status === 'implemented' || s.status === 'impl');
  const planned = skills.filter((s) => s.status === 'planned');
  const conceptual = skills.filter((s) => s.status === 'conceptual');

  implemented.sort((a, b) => a.name.localeCompare(b.name));
  planned.sort((a, b) => a.name.localeCompare(b.name));
  conceptual.sort((a, b) => a.name.localeCompare(b.name));

  const timestamp = new Date().toISOString();
  const lines = [
    '# Gemini Skills Catalog',
    '',
    `> Auto-generated on ${timestamp}`,
    '',
    '## Summary',
    '',
    '| Metric | Count |',
    '| ------ | ----- |',
    `| Total Skills | ${skills.length} |`,
    `| Implemented | ${implemented.length} |`,
    `| Planned | ${planned.length} |`,
    `| Conceptual | ${conceptual.length} |`,
    '',
  ];

  if (implemented.length > 0) {
    lines.push('## Implemented Skills', '', '| Name | Description | CLI Command | TypeScript |', '| ---- | ----------- | ----------- | ---------- |');
    for (const s of implemented) {
      const tsFlag = s.hasTypeScript ? 'Yes' : 'No';
      const cmd = s.cliCommand ? `\`${s.cliCommand}\`` : '-';
      lines.push(`| ${s.name} | ${s.description} | ${cmd} | ${tsFlag} |`);
    }
    lines.push('');
  }

  if (planned.length > 0) {
    lines.push('## Planned Skills', '', '| Name | Description |', '| ---- | ----------- |');
    for (const s of planned) {
      lines.push(`| ${s.name} | ${s.description} |`);
    }
    lines.push('');
  }

  const outPath = path.resolve(argv.out);
  safeWriteFile(outPath, lines.join('\n'));

  logger.success(`Catalog generated at ${outPath}`);

  return {
    catalogPath: outPath,
    totalSkills: skills.length,
    implemented: implemented.length,
    planned: planned.length,
  };
});
