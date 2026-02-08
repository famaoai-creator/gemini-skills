#!/usr/bin/env node
const fs = require('fs');
const Mustache = require('mustache');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { runSkill } = require('../../scripts/lib/skill-wrapper.cjs');
const { validateFilePath, readJsonFile } = require('../../scripts/lib/validators.cjs');

const argv = yargs(hideBin(process.argv))
    .option('template', { alias: 't', type: 'string', demandOption: true })
    .option('data', { alias: 'd', type: 'string', demandOption: true })
    .option('out', { alias: 'o', type: 'string' })
    .argv;

runSkill('template-renderer', () => {
    const templatePath = validateFilePath(argv.template, 'template');
    const template = fs.readFileSync(templatePath, 'utf8');
    const data = readJsonFile(argv.data, 'template data');

    const output = Mustache.render(template, data);

    if (argv.out) {
        fs.writeFileSync(argv.out, output);
        return { output: argv.out, size: output.length };
    } else {
        return { content: output };
    }
});
