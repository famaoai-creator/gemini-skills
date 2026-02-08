#!/usr/bin/env node
const fs = require('fs');
const { marked } = require('marked');
const HTMLtoDOCX = require('html-to-docx');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { runAsyncSkill } = require('../../scripts/lib/skill-wrapper.cjs');

const argv = yargs(hideBin(process.argv))
    .option('input', { alias: 'i', type: 'string', demandOption: true })
    .option('out', { alias: 'o', type: 'string', demandOption: true })
    .argv;

runAsyncSkill('word-artisan', async () => {
    const md = fs.readFileSync(argv.input, 'utf8');
    const htmlContent = marked.parse(md);

    const fullHtml = `<!DOCTYPE html>
    <html><head></head><body>${htmlContent}</body></html>`;

    const fileBuffer = await HTMLtoDOCX(fullHtml, null, {
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true,
    });

    fs.writeFileSync(argv.out, fileBuffer);
    return { output: argv.out, size: fileBuffer.length };
});
