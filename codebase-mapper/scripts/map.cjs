const fs = require('fs');
const path = require('path');

const rootDir = process.argv[2] || '.';
const maxDepth = parseInt(process.argv[3] || '3', 10);
const ignorePatterns = ['node_modules', '.git', 'dist', 'build', 'coverage', '.DS_Store'];

function generateTree(dir, depth = 0, prefix = '') {
    if (depth > maxDepth) return;

    const name = path.basename(dir);
    if (ignorePatterns.includes(name)) return;

    let stats;
    try {
        stats = fs.statSync(dir);
    } catch (e) { return; }

    if (!stats.isDirectory()) {
        console.log(`${prefix}├── ${name}`);
        return;
    }

    console.log(`${prefix}├── ${name}/`);
    
    const entries = fs.readdirSync(dir);
    entries.forEach((entry, index) => {
        const isLast = index === entries.length - 1;
        const nextPrefix = prefix + (isLast ? '    ' : '│   ');
        generateTree(path.join(dir, entry), depth + 1, prefix + '│   ');
    });
}

console.log(`Codebase Map for: ${path.resolve(rootDir)}`);
console.log(`(Max Depth: ${maxDepth}, Ignoring: ${ignorePatterns.join(', ')})`);
generateTree(rootDir);
