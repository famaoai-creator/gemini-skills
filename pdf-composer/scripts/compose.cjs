#!/usr/bin/env node
const markdownpdf = require('markdown-pdf');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { runAsyncSkill } = require('../../scripts/lib/skill-wrapper.cjs');
const { validateFilePath } = require('../../scripts/lib/validators.cjs');

const argv = yargs(hideBin(process.argv))
    .option('input', { alias: 'i', type: 'string', demandOption: true })
    .option('out', { alias: 'o', type: 'string', demandOption: true })
    .argv;

runAsyncSkill('pdf-composer', async () => {
    validateFilePath(argv.input, 'input markdown');

    await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('PDF generation timed out after 30s')), 30000);
        markdownpdf()
            .from(argv.input)
            .to(argv.out, (err) => {
                clearTimeout(timeout);
                if (err) reject(err);
                else resolve();
            });
    });

    return { output: argv.out };
});
