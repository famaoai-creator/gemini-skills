#!/usr/bin/env node
/**
 * diagram-renderer/scripts/main.cjs
 * Official Implementation of Gemini Diagram ADF Protocol v1.
 * Bypasses direct DSL learning for AI by providing a high-level data interface.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { runSkill } = require('@agent/core');
const { safeWriteFile } = require('@agent/core/secure-io');
const { requireArgs } = require('@agent/core/validators');

/**
 * Loads external knowledge assets.
 */
function loadKnowledge() {
  const rootDir = process.cwd();
  const getPath = (f) => path.resolve(rootDir, `knowledge/skills/diagram-renderer/${f}`);
  return {
    registry: JSON.parse(fs.readFileSync(getPath('theme-registry.json'), 'utf8')),
    rules: JSON.parse(fs.readFileSync(getPath('design-rules.json'), 'utf8')).rules,
    styles: JSON.parse(fs.readFileSync(getPath('design-styles.json'), 'utf8')).styles,
    icons: JSON.parse(fs.readFileSync(getPath('icon-map.json'), 'utf8'))
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
  const customCss = overrides.customStyle || '';

  const init = {
    theme: themeConfig.theme,
    themeVariables: { ...themeConfig.variables, ...(overrides.themeVariables || {}) },
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
    if (n.section && n.section !== currentSection) {
      mmd += `    section ${n.section}\n`;
      currentSection = n.section;
    }
    mmd += `    ${n.name} :${n.id}, ${n.start || 'after ' + (n.dependsOn || '')}, ${n.duration || '1d'}\n`;
  });
  return mmd;
}

/**
 * Strategy: Direct Designer Org SVG (Protocol-Aware)
 */
function renderDirectOrg(adf, knowledge) {
  const theme = knowledge.registry.themes[adf.theme || 'base'] || knowledge.registry.themes.base;
  const nodes = [
    { id: 'ace', x: 600, y: 500, r: 100, color: adf.overrides?.themeVariables?.primaryColor || theme.variables.primaryColor, label: 'ACE Engine', sub: '(Orchestrator)' },
    { id: 'arch', x: 600, y: 150, r: 80, color: '#1f6feb', label: 'Architect', sub: '(Engineering)' },
    { id: 'biz', x: 250, y: 750, r: 80, color: '#238636', label: 'Strategic Sales', sub: '(Business)' },
    { id: 'auditor', x: 950, y: 750, r: 80, color: '#d29922', label: 'Quality Auditor', sub: '(Governance)' }
  ];
  let svg = `<svg width="1200" height="1000" viewBox="0 0 1200 1000" xmlns="http://www.w3.org/2000/svg"><defs><filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="5" /><feOffset dx="2" dy="4" /><feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs><rect width="100%" height="100%" fill="#ffffff" />`;
  nodes.forEach(n => { if (n.id !== 'ace') svg += `<line x1="600" y1="500" x2="${n.x}" y2="${n.y}" stroke="#e0e0e0" stroke-width="3" stroke-dasharray="5,5" />`; });
  nodes.forEach(n => { svg += `<g filter="url(#sh)"><circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${n.color}" /><text x="${n.x}" y="${n.y - 5}" text-anchor="middle" fill="#ffffff" font-family="${theme.variables.fontFamily}" font-weight="bold" font-size="20">${n.label}</text><text x="${n.x}" y="${n.y + 20}" text-anchor="middle" fill="#ffffff" font-family="${theme.variables.fontFamily}" font-size="14" opacity="0.8">${n.sub}</text></g>`; });
  return svg + '</svg>';
}

runSkill('diagram-renderer', () => {
  const argv = requireArgs(['input', 'out']);
  const inputPath = path.resolve(argv.input);
  const outputPath = path.resolve(argv.out);
  const mmdPath = outputPath.replace(/\.[^.]+$/, '.mmd');

  if (!fs.existsSync(inputPath)) throw new Error(`Input not found: ${inputPath}`);
  const adf = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  // 1. Protocol Guard
  if (adf.protocol !== 'gemini-diagram-v1') {
    throw new Error('Unsupported protocol. Expected gemini-diagram-v1.');
  }

  // 2. Load Intel
  const knowledge = loadKnowledge();
  const rule = knowledge.rules[adf.intent] || {};
  const mergedAdf = { ...rule, ...adf };

  // 3. Select Strategy
  if (mergedAdf.type === 'designer_org') {
    fs.writeFileSync(outputPath, renderDirectOrg(mergedAdf, knowledge));
    return { status: 'success', mode: 'designer' };
  }

  let mmdContent = adf.elements.diagram || '';
  if (!mmdContent) {
    mmdContent = mergedAdf.type === 'gantt' 
      ? toGantt(adf.title, adf.elements) 
      : toFlowchart(adf.elements, knowledge.icons);
  }

  // 4. Designer Polish
  mmdContent = mmdContent.replace(/\\n/g, '\n');
  if (!mmdContent.includes('%%{init:')) {
    mmdContent = applyDesignerStyle(mmdContent, mergedAdf, knowledge);
  }

  const width = adf.overrides?.width || knowledge.registry.defaults.width;
  const height = adf.overrides?.height || knowledge.registry.defaults.height;
  safeWriteFile(mmdPath, mmdContent);

  // 5. Render & Post-Process
  try {
    execSync(`npx -y @mermaid-js/mermaid-cli -i "${mmdPath}" -o "${outputPath}" --width ${width} --height ${height}`, { stdio: 'inherit' });
    let svg = fs.readFileSync(outputPath, 'utf8');
    svg = svg.replace(/width="[^"]*"/, `width="${width}"`).replace(/height="[^"]*"/, `height="${height}"`);
    const viewBox = `viewBox="0 0 ${width} ${height}"`;
    fs.writeFileSync(outputPath, svg.includes('viewBox="') ? svg.replace(/viewBox="[^"]*"/, viewBox) : svg.replace('<svg ', `<svg ${viewBox} `));
  } catch (err) {
    throw new Error(`Rendering failed: ${err.message}`);
  }

  return { status: 'success', protocol: adf.protocol, finalArtifact: outputPath };
});
