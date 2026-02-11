#!/usr/bin/env node
/**
 * diagram-renderer/scripts/main.cjs
 * Standardized Data-Driven SVG Renderer
 */

const fs = require('fs');
const path = require('path');
const { runSkill } = require('@gemini/core');
const { requireArgs } = require('@gemini/core/validators');

runSkill('diagram-renderer', () => {
    // Reverting to Framework Standard: Using requireArgs
    const argv = requireArgs(['input', 'out']);
    
    const inputPath = path.resolve(argv.input);
    const outputPath = path.resolve(argv.out);
    const themePath = argv.theme ? path.resolve(argv.theme) : path.resolve(__dirname, '../../knowledge/templates/themes/aws-diagram-theme.json');

    if (!fs.existsSync(inputPath)) throw new Error(`Input ADF (JSON) not found: ${inputPath}`);

    // Load Data and Theme
    const adf = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    const theme = JSON.parse(fs.readFileSync(themePath, 'utf8'));

    // Render SVG
    let svg = `<svg width="1000" height="600" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="100%" height="100%" fill="${theme.styles.canvas.backgroundColor}" />`;
    
    adf.nodes.forEach((node, i) => {
        const x = 50 + (i * 200);
        const y = 100;
        const iconUrl = theme.icons[node.type] || theme.icons.default;
        const s = theme.styles.node;
        const ts = theme.styles.text;

        svg += `
        <g transform="translate(${x}, ${y})">
            <rect width="${s.width}" height="${s.height}" rx="${s.rx}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}" />
            <image href="${iconUrl}" x="${(s.width - 50)/2}" y="10" width="50" height="50" />
            <text x="${s.width/2}" y="90" text-anchor="middle" font-family="${ts.fontFamily}" font-size="${ts.titleSize}" font-weight="bold" fill="${ts.color}">${node.name}</text>
            <text x="${s.width/2}" y="105" text-anchor="middle" font-family="${ts.fontFamily}" font-size="${ts.subtitleSize}" fill="#666">${node.type}</text>
        </g>`;
    });

    svg += `</svg>`;
    
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, svg);

    return { 
        status: 'success', 
        input: argv.input,
        output: outputPath, 
        themeUsed: theme.theme_name 
    };
});
