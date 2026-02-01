const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');
const hcl = require('hcl2-parser');

program
  .argument('[dir]', 'Directory containing Terraform files', '.')
  .option('-f, --format <type>', 'Output format (mermaid, plantuml)', 'mermaid')
  .action((dir, options) => {
    generateDiagram(dir, options.format);
  });

program.parse();

function generateDiagram(dir, format) {
    console.log(chalk.cyan(`Analyzing Terraform files in: ${dir}`));

    const resources = [];
    const relationships = [];

    // 1. Parse Terraform files
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.tf'));
    
    if (files.length === 0) {
        console.log(chalk.yellow('No .tf files found.'));
        return;
    }

        files.forEach(file => {
            try {
                const content = fs.readFileSync(path.join(dir, file), 'utf8');
                let parsed = null;
                try {
                    parsed = hcl.parseToObject(content);
                } catch (e) {
                    // Ignore HCL parse error and fallback to regex
                }
                
                if (parsed && parsed.resource) {
                    Object.entries(parsed.resource).forEach(([type, instances]) => {
                        Object.entries(instances).forEach(([name, config]) => {
                            const id = `${type}.${name}`;
                            resources.push({ id, type, name, config: config[0] || {} });
                        });
                    });
                } else {
                    // Fallback: Regex Parsing
                    const resRegex = /resource\s+"([\w_]+)"\s+"([\w_]+)"\s+\{/g;
                    let match;
                    while ((match = resRegex.exec(content)) !== null) {
                        const type = match[1];
                        const name = match[2];
                        const id = `${type}.${name}`;
                        // Simple hack: store content as config string for relationship mapping
                        resources.push({ id, type, name, config: content }); 
                    }
                }
            } catch (e) {
                console.error(chalk.red(`Failed to parse ${file}: ${e.message}`));
            }
        });
    
        // 2. Infer Relationships
        resources.forEach(res => {
            const configStr = typeof res.config === 'string' ? res.config : JSON.stringify(res.config);
            resources.forEach(target => {
                if (res.id !== target.id) {
                    // Match "target_type.target_name"
                    if (configStr.includes(`${target.type}.${target.name}`)) {
                        relationships.push({ from: res.id, to: target.id });
                    }
                }
            });
        });
        // 3. Generate Output
    if (format === 'mermaid') {
        generateMermaid(resources, relationships);
    } else {
        console.log(chalk.red('Only Mermaid format is currently supported in this MVP.'));
    }
}

function generateMermaid(resources, relationships) {
    console.log(chalk.green('\n--- Generating Mermaid Diagram ---\n'));
    
    let mmdCode = 'graph TD\n';
    
    // Nodes
    resources.forEach(r => {
        let icon = '📄';
        if (r.type.startsWith('aws_')) icon = '☁️';
        if (r.type.startsWith('google_')) icon = '🇬';
        if (r.type.startsWith('azurerm_')) icon = '🔷';
        
        const safeId = r.id.replace(/[^a-zA-Z0-9]/g, '_');
        mmdCode += `    ${safeId}["${icon} ${r.type}<br><b>${r.name}</b>"]
`;
    });

    // Edges
    relationships.forEach(rel => {
        const safeFrom = rel.from.replace(/[^a-zA-Z0-9]/g, '_');
        const safeTo = rel.to.replace(/[^a-zA-Z0-9]/g, '_');
        mmdCode += `    ${safeFrom} --> ${safeTo}\n`;
    });

    // 1. Output code to console
    console.log(mmdCode);

    // 2. Save .mmd file
    const mmdFile = 'terraform_architecture.mmd';
    fs.writeFileSync(mmdFile, mmdCode);
    
    console.log(chalk.green('-----------------------\n'));
    console.log(`✔ Mermaid code saved to: ${chalk.bold(mmdFile)}`);
    console.log(chalk.gray('\nTo render this as an image, use the diagram-renderer skill:'));
    console.log(chalk.cyan(`node scripts/render.cjs ${mmdFile} terraform_architecture.png`));
}
