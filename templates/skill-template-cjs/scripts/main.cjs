#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { runSkill } = require('../../scripts/lib/skill-wrapper.cjs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
    .option('input', { alias: 'i', type: 'string', demandOption: true, description: 'Input file' })
    .option('out', { alias: 'o', type: 'string', description: 'Output file' })
    .argv;

runSkill('{{SKILL_NAME}}', () => {
    const _input = fs.readFileSync(path.resolve(argv.input), 'utf8');

    // TODO: Implement skill logic here
    const result = { input: argv.input, processed: true };

    if (argv.out) {
        fs.writeFileSync(argv.out, JSON.stringify(result, null, 2));
    }

    return result;
});
