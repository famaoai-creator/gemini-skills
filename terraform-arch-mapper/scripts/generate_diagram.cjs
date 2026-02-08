const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const hcl = require('hcl2-parser');
const { runSkill } = require('../../scripts/lib/skill-wrapper.cjs');

let dirArg = '.';
let formatArg = 'mermaid';

program
  .argument('[dir]', 'Directory containing Terraform files', '.')
  .option('-f, --format <type>', 'Output format (mermaid, plantuml)', 'mermaid')
  .action((dir, options) => {
    dirArg = dir;
    formatArg = options.format;
  });

program.parse();

runSkill('terraform-arch-mapper', () => {
    const dir = dirArg;
    const format = formatArg;

    const resources = [];
    const relationships = [];

    // 1. Parse Terraform files
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.tf'));

    if (files.length === 0) {
        return { dir, resources: [], relationships: [], mermaid: '' };
    }

    files.forEach(file => {
        try {
            const content = fs.readFileSync(path.join(dir, file), 'utf8');
            let parsed = null;
            try {
                parsed = hcl.parseToObject(content);
            } catch (_e) {
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
                    resources.push({ id, type, name, config: content });
                }
            }
        } catch (_e) {
            // Skip files that fail to parse
        }
    });

    // 2. Infer Relationships
    resources.forEach(res => {
        const configStr = typeof res.config === 'string' ? res.config : JSON.stringify(res.config);
        resources.forEach(target => {
            if (res.id !== target.id) {
                if (configStr.includes(`${target.type}.${target.name}`)) {
                    relationships.push({ from: res.id, to: target.id });
                }
            }
        });
    });

    // 3. Generate Mermaid Output
    if (format !== 'mermaid') {
        throw new Error('Only Mermaid format is currently supported in this MVP.');
    }

    let mmdCode = 'graph TD\n';

    resources.forEach(r => {
        let icon = '📄';
        if (r.type.startsWith('aws_')) icon = '☁️';
        if (r.type.startsWith('google_')) icon = '🇬';
        if (r.type.startsWith('azurerm_')) icon = '🔷';

        const safeId = r.id.replace(/[^a-zA-Z0-9]/g, '_');
        mmdCode += `    ${safeId}["${icon} ${r.type}<br><b>${r.name}</b>"]\n`;
    });

    relationships.forEach(rel => {
        const safeFrom = rel.from.replace(/[^a-zA-Z0-9]/g, '_');
        const safeTo = rel.to.replace(/[^a-zA-Z0-9]/g, '_');
        mmdCode += `    ${safeFrom} --> ${safeTo}\n`;
    });

    // Save .mmd file
    const mmdFile = 'terraform_architecture.mmd';
    fs.writeFileSync(mmdFile, mmdCode);

    return { dir, resourceCount: resources.length, relationshipCount: relationships.length, output: mmdFile, mermaid: mmdCode };
});
