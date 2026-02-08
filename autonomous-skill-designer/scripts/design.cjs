#!/usr/bin/env node
const fs = require('fs'); const path = require('path');
const yargs = require('yargs/yargs'); const { hideBin } = require('yargs/helpers');
const { runSkill } = require('../../scripts/lib/skill-wrapper.cjs');
const argv = yargs(hideBin(process.argv))
  .option('input', { alias: 'i', type: 'string', demandOption: true, description: 'Path to JSON problem description' })
  .option('out', { alias: 'o', type: 'string', description: 'Output file path' })
  .help().argv;

function analyzeGap(problem, existingSkills) {
  const lower = (problem.description || '').toLowerCase();
  const covered = existingSkills.filter(s => lower.includes(s.name.replace(/-/g, ' ')) || lower.includes(s.name));
  const gap = covered.length === 0;
  return { gap, coveredBy: covered.map(s => s.name), needsNewSkill: gap };
}

function designSkill(problem) {
  const name = (problem.name || 'custom-skill').replace(/\s+/g, '-').toLowerCase();
  const skillMd = [
    '---', `name: ${name}`, `description: ${problem.description || 'Custom generated skill'}`, 'status: planned',
    'arguments:', '  - name: input', '    short: i', '    type: string', '    required: true', '    description: Input file path',
    '  - name: out', '    short: o', '    type: string', '    description: Output file path', '---',
    '', `# ${name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`, '',
    problem.description || '', '', '## Capabilities', '', ...(problem.capabilities || ['Analyze input', 'Generate report']).map((c, i) => `### ${i + 1}. ${c}`),
    '', '## Usage', ...(problem.useCases || [`Use ${name} to solve the problem described above.`]).map(u => `- "${u}"`), '',
  ].join('\n');

  const scriptTemplate = `#!/usr/bin/env node
const fs = require('fs'); const path = require('path');
const yargs = require('yargs/yargs'); const { hideBin } = require('yargs/helpers');
const { runSkill } = require('../../scripts/lib/skill-wrapper.cjs');
const argv = yargs(hideBin(process.argv))
  .option('input', { alias: 'i', type: 'string', demandOption: true, description: 'Input file' })
  .option('out', { alias: 'o', type: 'string', description: 'Output file' })
  .help().argv;
runSkill('${name}', () => {
  const resolved = path.resolve(argv.input);
  if (!fs.existsSync(resolved)) throw new Error('File not found: ' + resolved);
  const content = fs.readFileSync(resolved, 'utf8');
  const result = { source: path.basename(resolved), processed: true, lines: content.split('\\n').length };
  if (argv.out) fs.writeFileSync(argv.out, JSON.stringify(result, null, 2));
  return result;
});
`;
  return { name, skillMd, scriptTemplate, packageJson: JSON.stringify({ name, version: '1.0.0', private: true }, null, 2) };
}

function getExistingSkills(dir) {
  try {
    const indexPath = path.join(dir, 'global_skill_index.json');
    if (fs.existsSync(indexPath)) return JSON.parse(fs.readFileSync(indexPath, 'utf8')).skills || [];
  } catch(_e){}
  return [];
}

runSkill('autonomous-skill-designer', () => {
  const resolved = path.resolve(argv.input);
  if (!fs.existsSync(resolved)) throw new Error(`File not found: ${resolved}`);
  const problem = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  const existing = getExistingSkills(path.resolve('.'));
  const gap = analyzeGap(problem, existing);
  const design = designSkill(problem);
  const result = {
    source: path.basename(resolved), gapAnalysis: gap, design: { name: design.name, hasSkillMd: true, hasScript: true, hasPackageJson: true },
    generatedFiles: { 'SKILL.md': design.skillMd, [`scripts/${design.name.split('-').pop()}.cjs`]: design.scriptTemplate, 'package.json': design.packageJson },
    recommendations: gap.needsNewSkill ? [`New skill "${design.name}" designed. Review and deploy.`] : [`Existing skills may cover this: ${gap.coveredBy.join(', ')}`],
  };
  if (argv.out) fs.writeFileSync(argv.out, JSON.stringify(result, null, 2));
  return result;
});
