const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { program } = require('commander');
const chalk = require('chalk');

program
  .argument('<input>', 'Input diagram file (e.g., diagram.mmd)')
  .argument('<output>', 'Output image file (e.g., diagram.png)')
  .option('-b, --background <color>', 'Background color', 'transparent')
  .action((input, output, options) => {
    renderDiagram(input, output, options.background);
  });

program.parse();

function renderDiagram(input, output, background) {
    console.log(chalk.cyan(`Rendering diagram: ${input} -> ${output}`));

    if (!fs.existsSync(input)) {
        console.error(chalk.red(`Error: Input file not found: ${input}`));
        process.exit(1);
    }

    const ext = path.extname(input).toLowerCase();

    if (ext === '.mmd' || ext === '.mermaid') {
        renderMermaid(input, output, background);
    } else {
        console.error(chalk.red(`Unsupported diagram format: ${ext}. Use .mmd for Mermaid.`));
        process.exit(1);
    }
}

function renderMermaid(input, output, background) {
    try {
        // Try local npx first, then global
        console.log(chalk.gray('Executing mmdc (Mermaid CLI)...'));
        execSync(`npx -y @mermaid-js/mermaid-cli -i "${input}" -o "${output}" -b "${background}"`, { stdio: 'inherit' });
        console.log(chalk.green(`\n✔ Success! Image saved to: ${output}`));
    } catch (e) {
        console.error(chalk.red(`\n✘ Failed to render Mermaid diagram: ${e.message}`));
        process.exit(1);
    }
}
