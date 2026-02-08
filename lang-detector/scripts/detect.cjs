#!/usr/bin/env node
const fs = require('fs');
const LanguageDetect = require('languagedetect');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { runSkill } = require('../../scripts/lib/skill-wrapper.cjs');
const { validateFilePath } = require('../../scripts/lib/validators.cjs');

const lngDetector = new LanguageDetect();
const argv = yargs(hideBin(process.argv))
    .option('input', { alias: 'i', type: 'string', demandOption: true })
    .argv;

runSkill('lang-detector', () => {
    const inputPath = validateFilePath(argv.input, 'input');
    const content = fs.readFileSync(inputPath, 'utf8');
    const results = lngDetector.detect(content, 1);

    if (results.length > 0) {
        return { language: results[0][0], confidence: results[0][1] };
    } else {
        return { language: 'unknown', confidence: 0 };
    }
});
