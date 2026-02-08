#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { classifyFile } = require('../../scripts/lib/classifier.cjs');
const { runSkill } = require('../../scripts/lib/skill-wrapper.cjs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
    .option('input', { alias: 'i', type: 'string', demandOption: true })
    .argv;

const rulesPath = path.join(__dirname, '../../knowledge/classifiers/domain-rules.yml');
const rulesData = yaml.load(fs.readFileSync(rulesPath, 'utf8'));
const DOMAINS = rulesData.categories;

runSkill('domain-classifier', () => {
    return classifyFile(argv.input, DOMAINS, { resultKey: rulesData.resultKey });
});
