const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { logger } = require('../../scripts/lib/core.cjs');
const { runSkill } = require('../../scripts/lib/skill-wrapper.cjs');

const inputFilePath = process.argv[2];
const outputFormat = process.argv[3] || 'pptx';
const customTheme = process.argv.includes('--theme') ? process.argv[process.argv.indexOf('--theme') + 1] : null;
const isEditable = process.argv.includes('--editable-pptx');

if (!inputFilePath) {
  logger.error('Usage: node convert.cjs <input-file> [pptx|pdf|html] [--theme name] [--editable-pptx]');
  process.exit(1);
}

const inputFile = path.resolve(process.cwd(), inputFilePath);
const skillRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(skillRoot, '..');
const knowledgeThemesDir = path.join(projectRoot, 'knowledge', 'templates', 'themes');
const localThemesDir = path.join(skillRoot, 'assets', 'themes');

const outputFile = inputFile.replace(/\.(md|markdown)$/i, '') + '.' + outputFormat;

runSkill('ppt-artisan', () => {
    const themeSets = [];
    if (fs.existsSync(localThemesDir)) themeSets.push(localThemesDir);
    if (fs.existsSync(knowledgeThemesDir)) themeSets.push(knowledgeThemesDir);

    // Build Marp CLI command
    let command = `npx -y @marp-team/marp-cli "${inputFile}" -o "${outputFile}" --allow-local-files`;

    if (themeSets.length > 0) {
      command += ` --theme-set ${themeSets.map(d => `"${d}"`).join(' ')}`;
    }

    if (customTheme) {
      const themePath = path.join(knowledgeThemesDir, `${customTheme}.css`);
      if (fs.existsSync(themePath)) {
        command += ` --theme "${themePath}"`;
      } else {
        command += ` --theme ${customTheme}`;
      }
    }

    // Marp Native Editable PPTX Option
    if (isEditable && outputFormat === 'pptx') {
      command += ' --pptx-editable';
    }

    execSync(command, { stdio: 'inherit' });

    return { input: inputFile, output: outputFile, format: outputFormat };
});
