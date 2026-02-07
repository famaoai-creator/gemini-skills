const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const inputFilePath = process.argv[2];
const outputFormat = process.argv[3] || 'pptx';
const customTheme = process.argv.includes('--theme') ? process.argv[process.argv.indexOf('--theme') + 1] : null;

if (!inputFilePath) {
  console.error('Error: Input file is required.');
  process.exit(1);
}

const inputFile = path.resolve(process.cwd(), inputFilePath);
const skillRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(skillRoot, '..');
const knowledgeThemesDir = path.join(projectRoot, 'knowledge', 'templates', 'themes');
const localThemesDir = path.join(skillRoot, 'assets', 'themes');

const outputFile = inputFile.replace(/\.(md|markdown)$/i, '') + '.' + outputFormat;

console.log(`Converting '${inputFile}' to ${outputFormat.toUpperCase()}...`);

const themeSets = [];
if (fs.existsSync(localThemesDir)) themeSets.push(localThemesDir);
if (fs.existsSync(knowledgeThemesDir)) themeSets.push(knowledgeThemesDir);

let command = `npx -y @marp-team/marp-cli "${inputFile}" -o "${outputFile}" --allow-local-files`;

if (themeSets.length > 0) {
  command += ` --theme-set ${themeSets.map(d => `"${d}"`).join(' ')}`;
}

// If a custom theme is provided, we can also try passing it via direct CSS file link if name matching fails
if (customTheme) {
  const themePath = path.join(knowledgeThemesDir, `${customTheme}.css`);
  if (fs.existsSync(themePath)) {
    command += ` --theme "${themePath}"`;
  } else {
    command += ` --theme ${customTheme}`;
  }
}

try {
  execSync(command, { stdio: 'inherit' });
  console.log(`\n✅ Success! Created: ${outputFile}`);
} catch (error) {
  console.error('\n❌ Conversion failed.');
  process.exit(1);
}
