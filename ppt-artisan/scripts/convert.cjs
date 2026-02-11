#!/usr/bin/env node
/**
 * ppt-artisan/scripts/convert.cjs
 * Standardized PPT Artisan with Framework Args.
 */

const { runSkillAsync } = require('@gemini/core');
const { requireArgs } = require('@gemini/core/validators');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

runSkillAsync('ppt-artisan', async () => {
    const argv = requireArgs(['input', 'out']);
    
    const inputPath = path.resolve(argv.input);
    const outputPath = path.resolve(argv.out);
    
    let cmd = `npx -y @marp-team/marp-cli "${inputPath}" --pptx --pptx-editable -o "${outputPath}" --allow-local-files`;
    
    if (argv.theme) {
        cmd += ` --theme "${path.resolve(argv.theme)}"`;
    }

    console.log(`[PPT] Generating ${argv.out}...`);
    execSync(cmd, { stdio: 'inherit' });

    return { status: 'success', output: outputPath, theme: argv.theme || 'default' };
});
