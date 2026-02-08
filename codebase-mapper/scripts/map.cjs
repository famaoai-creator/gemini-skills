const fs = require('fs');
const path = require('path');
const { runSkill } = require('../../scripts/lib/skill-wrapper.cjs');

const rootDir = process.argv[2] || '.';
const maxDepth = parseInt(process.argv[3] || '3', 10);
const ignorePatterns = ['node_modules', '.git', 'dist', 'build', 'coverage', '.DS_Store'];

function generateTree(dir, depth = 0, prefix = '', lines = []) {
    if (depth > maxDepth) return lines;

    const name = path.basename(dir);
    if (ignorePatterns.includes(name)) return lines;

    let stats;
    try {
        stats = fs.statSync(dir);
    } catch (_e) { return lines; }

    if (!stats.isDirectory()) {
        lines.push(`${prefix}├── ${name}`);
        return lines;
    }

    lines.push(`${prefix}├── ${name}/`);

    const entries = fs.readdirSync(dir);
    entries.forEach((entry, index) => {
        const _isLast = index === entries.length - 1;
        generateTree(path.join(dir, entry), depth + 1, prefix + '│   ', lines);
    });

    return lines;
}

runSkill('codebase-mapper', () => {
    const lines = [];
    lines.push(`Codebase Map for: ${path.resolve(rootDir)}`);
    lines.push(`(Max Depth: ${maxDepth}, Ignoring: ${ignorePatterns.join(', ')})`);
    const tree = generateTree(rootDir, 0, '', []);
    lines.push(...tree);

    return { root: path.resolve(rootDir), maxDepth, tree: lines };
});
