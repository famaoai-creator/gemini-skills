const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { program } = require('commander');
const { runSkill } = require('../../scripts/lib/skill-wrapper.cjs');

let inputArg, outputArg, bgOption;

program
  .argument('<input>', 'Input diagram file (e.g., diagram.mmd)')
  .argument('<output>', 'Output image file (e.g., diagram.png)')
  .option('-b, --background <color>', 'Background color', 'transparent')
  .action((input, output, options) => {
    inputArg = input;
    outputArg = output;
    bgOption = options.background;
  });

program.parse();

runSkill('diagram-renderer', () => {
    const input = inputArg;
    const output = outputArg;
    const background = bgOption;

    if (!fs.existsSync(input)) {
        throw new Error(`Input file not found: ${input}`);
    }

    const ext = path.extname(input).toLowerCase();

    if (ext !== '.mmd' && ext !== '.mermaid') {
        throw new Error(`Unsupported diagram format: ${ext}. Use .mmd for Mermaid.`);
    }

    // Render Mermaid
    execSync(`npx -y @mermaid-js/mermaid-cli -i "${input}" -o "${output}" -b "${background}"`, { stdio: 'inherit' });

    return { input, output, format: 'mermaid', background };
});
