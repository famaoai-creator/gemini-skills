#!/usr/bin/env node
/**
 * diagram-renderer/scripts/main.cjs
 * Official Implementation of Gemini Diagram ADF Protocol v1.
 * Pure Logic & Dynamic Layout Engine (Zero Hardcoded Content).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { runSkill } = require('@agent/core');
const { safeWriteFile, safeReadFile } = require('@agent/core/secure-io');
const { requireArgs } = require('@agent/core/validators');

/**
 * Loads external knowledge assets using Secure IO.
 */
function loadKnowledge() {
  const rootDir = process.cwd();
  const getPath = (f) => path.resolve(rootDir, `knowledge/skills/diagram-renderer/${f}`);
  return {
    registry: JSON.parse(safeReadFile(getPath('theme-registry.json'), 'utf8')),
    rules: JSON.parse(safeReadFile(getPath('design-rules.json'), 'utf8')).rules,
    styles: JSON.parse(safeReadFile(getPath('design-styles.json'), 'utf8')).styles,
    icons: JSON.parse(safeReadFile(path.resolve(rootDir, 'knowledge/skills/diagram-renderer/icon-map.json'), 'utf8'))
  };
}

/**
 * Injects designer-tuned 'init' directive with Extension Points.
 */
function applyDesignerStyle(mmd, adf, knowledge) {
  const themeKey = adf.theme || 'base';
  const themeConfig = knowledge.registry.themes[themeKey] || knowledge.registry.themes.base;
  const overrides = adf.overrides || {};
  const styleRule = themeKey === 'dark' ? knowledge.styles.tech_dark : knowledge.styles.professional_base;
  const globalCss = styleRule ? Object.values(styleRule).join(' ') : '';
  const customCss = overrides.custom_style || '';

  const init = {
    theme: themeConfig.theme,
    themeVariables: { ...themeConfig.variables, ...(overrides.theme_variables || {}) },
    flowchart: { ...themeConfig.flowchart },
    sequence: { ...themeConfig.sequence },
    gantt: { ...themeConfig.gantt },
    er: { useMaxWidth: false },
    class: { useMaxWidth: false },
    cssStyles: `${globalCss} ${customCss}`
  };
  return `%%{init: ${JSON.stringify(init)} }%%\n${mmd}`;
}

/**
 * Strategy: ADF Elements to Mermaid Flowchart
 */
function toFlowchart(elements, icons) {
  let mmd = `graph LR\n`;
  (elements.nodes || []).forEach((n) => {
    const id = n.id.replace(/[\.\-]/g, '_');
    const icon = icons[n.type] || icons.default || '';
    const label = `"${icon}<br/>${n.name.replace(/\n/g, '<br/>')}"`;
    mmd += n.shape === 'circle' ? `    ${id}((${label}))\n` : `    ${id}(${label})\n`;
  });
  (elements.edges || []).forEach((e) => {
    mmd += `    ${e.from.replace(/[\.\-]/g, '_')} --- ${e.to.replace(/[\.\-]/g, '_')}\n`;
  });
  return mmd;
}

/**
 * Strategy: ADF Elements to Mermaid Gantt
 */
function toGantt(title, elements) {
  let mmd = `gantt\n    title ${title || 'Roadmap'}\n    dateFormat  YYYY-MM-DD\n    axisFormat  %m/%d\n`;
  let currentSection = '';
  (elements.nodes || []).forEach((n) => {
    if (n.section && n.section !== currentSection) { mmd += `    section ${n.section}\n`; currentSection = n.section; }
    const start = n.start || (n.depends_on ? 'after ' + n.depends_on : '2026-03-01');
    mmd += `    ${n.name} :${n.id}, ${start}, ${n.duration || '1d'}\n`;
  });
  return mmd;
}

/**
 * Strategy: Direct Designer SVG (Dynamic Layout Engine)
 * Automatically arranges nodes in a circle around the first node.
 */
function renderDirectDesigner(adf, knowledge) {
  const defaults = knowledge.registry.defaults;
  const width = adf.overrides?.width || defaults.designer_width || 1200;
  const height = adf.overrides?.height || defaults.designer_height || 1000;
  const theme = knowledge.registry.themes[adf.theme || 'base'] || knowledge.registry.themes.base;
  const nodes = adf.elements.nodes || [];
  if (nodes.length === 0) return '';

  const cx = width / 2;
  const cy = height * 0.55; // Slightly lower than center for title
  const coreNode = nodes[0];
  const satellites = nodes.slice(1);
  const radius = Math.min(width, height) * 0.3;

  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><defs><filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="5" /><feOffset dx="2" dy="4" /><feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs><rect width="100%" height="100%" fill="#ffffff" />`;

  // Draw Dynamic Connections (Core to Satellites)
  satellites.forEach((n, i) => {
    const angle = (i * 2 * Math.PI) / satellites.length - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    svg += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#e0e0e0" stroke-width="3" stroke-dasharray="5,5" />`;
  });

  // Draw Nodes dynamically
  const drawNode = (n, x, y, r, color) => {
    const icon = knowledge.icons[n.type] || knowledge.icons.default || '';
    svg += `<g filter="url(#sh)"><circle cx="${x}" cy="${y}" r="${r}" fill="${color}" /><text x="${x}" y="${y - 5}" text-anchor="middle" fill="#ffffff" font-family="${theme.variables.fontFamily}" font-weight="bold" font-size="18">${icon} ${n.name.split('\\n')[0]}</text><text x="${x}" y="${y + 18}" text-anchor="middle" fill="#ffffff" font-family="${theme.variables.fontFamily}" font-size="12" opacity="0.8">${n.name.split('\\n')[1] || ''}</text></g>`;
  };

  // Core Node
  drawNode(coreNode, cx, cy, 100, adf.overrides?.theme_variables?.primaryColor || theme.variables.primaryColor);

  // Satellites
  satellites.forEach((n, i) => {
    const angle = (i * 2 * Math.PI) / satellites.length - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    drawNode(n, x, y, 80, theme.variables.tertiaryColor || '#1f6feb');
  });

  return svg + '</svg>';
}

runSkill('diagram-renderer', () => {
  const argv = requireArgs(['input', 'out']);
  const inputPath = path.resolve(argv.input);
  const outputPath = path.resolve(argv.out);
  const mmdPath = outputPath.replace(/\.[^.]+$/, '.mmd');

  if (!fs.existsSync(inputPath)) throw new Error(`Input not found: ${inputPath}`);
  const adf = JSON.parse(safeReadFile(inputPath, 'utf8'));
  if (adf.protocol !== 'gemini-diagram-v1') { throw new Error('Unsupported protocol.'); }

  const knowledge = loadKnowledge();
  const rule = knowledge.rules[adf.intent] || {};
  const mergedAdf = { ...rule, ...adf };

  if (mergedAdf.type === 'designer_org') {
    safeWriteFile(outputPath, renderDirectDesigner(mergedAdf, knowledge));
    return { status: 'success', mode: 'designer' };
  }

  let mmdContent = adf.elements.diagram || '';
  if (!mmdContent) {
    mmdContent = mergedAdf.type === 'gantt' ? toGantt(adf.title, adf.elements) : toFlowchart(adf.elements, knowledge.icons);
  }

  mmdContent = mmdContent.replace(/\\n/g, '\n');
  if (!mmdContent.includes('%%{init:')) { mmdContent = applyDesignerStyle(mmdContent, mergedAdf, knowledge); }

  const width = adf.overrides?.width || knowledge.registry.defaults.width;
  const height = adf.overrides?.height || knowledge.registry.defaults.height;
  safeWriteFile(mmdPath, mmdContent);

  try {
    execSync(`npx -y @mermaid-js/mermaid-cli -i "${mmdPath}" -o "${outputPath}" --width ${width} --height ${height}`, { stdio: 'inherit' });
    let svg = safeReadFile(outputPath, 'utf8');
    svg = svg.replace(/width="[^"]*"/, `width="${width}"`).replace(/height="[^"]*"/, `height="${height}"`);
    const viewBox = `viewBox="0 0 ${width} ${height}"`;
    safeWriteFile(outputPath, svg.includes('viewBox="') ? svg.replace(/viewBox="[^"]*"/, viewBox) : svg.replace('<svg ', `<svg ${viewBox} `));
  } catch (err) { throw new Error(`Rendering failed: ${err.message}`); }

  return { status: 'success', protocol: adf.protocol, finalArtifact: outputPath };
});
