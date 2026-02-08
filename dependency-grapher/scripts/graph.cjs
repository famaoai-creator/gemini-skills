#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { runSkill } = require('../../scripts/lib/skill-wrapper.cjs');

const argv = yargs(hideBin(process.argv))
    .option('dir', { alias: 'd', type: 'string', demandOption: true })
    .option('out', { alias: 'o', type: 'string' })
    .argv;

runSkill('dependency-grapher', () => {
    const pkgPath = path.join(argv.dir, 'package.json');
    if (!fs.existsSync(pkgPath)) {
        throw new Error("No package.json found in directory");
    }

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    let mermaid = 'graph TD\n';

    mermaid += `    Root[${pkg.name}]\n`;

    if (pkg.dependencies) {
        Object.keys(pkg.dependencies).forEach(dep => {
            mermaid += `    Root --> ${dep.replace(/@|\/|\./g, '_')}[${dep}]\n`;
        });
    }

    if (argv.out) {
        fs.writeFileSync(argv.out, mermaid);
        return { output: argv.out, nodeCount: Object.keys(pkg.dependencies || {}).length + 1 };
    } else {
        return { content: mermaid, nodeCount: Object.keys(pkg.dependencies || {}).length + 1 };
    }
});
