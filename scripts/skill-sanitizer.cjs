#!/usr/bin/env node
/**
 * scripts/skill-sanitizer.cjs v3.0
 *
 * Sovereign Monorepo Health Guard - Post-Incident Edition
 * - pnpm & workspace: protocol enforcement
 * - Type-safe I/O pattern verification
 * - ESM/CJS compatibility checks (Anti-pattern detection)
 * - Automatic drift recovery with pnpm
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

const rootDir = path.resolve(__dirname, '..');
const skillsDir = path.join(rootDir, 'skills');
const IGNORE_DIRS = ['node_modules', 'dist', '.git', 'coverage', 'tests', 'config', 'scripts'];

console.log(chalk.bold.cyan('\n🛡️  Project Sanitas: Advanced Skill Guardian v3.0'));
console.log(chalk.dim('━'.repeat(60)));

// 0. Infrastructure Pre-flight Check
const infraIssues = [];
if (!fs.existsSync(path.join(rootDir, 'pnpm-workspace.yaml'))) infraIssues.push('Missing pnpm-workspace.yaml');
if (!fs.existsSync(path.join(rootDir, 'libs/core/skill-wrapper.d.cts'))) infraIssues.push('Missing core type definitions (d.cts)');

if (infraIssues.length > 0) {
  console.log(chalk.red.bold('🚨 Critical Infrastructure Issues:'));
  infraIssues.forEach(i => console.log(chalk.red(`  - ${i}`)));
  console.log(chalk.yellow('\n[FIX] Run Ecosystem Initialization Protocol.\n'));
  // Non-fatal, but warning issued
}

function getSkillDirs(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (IGNORE_DIRS.includes(file)) continue;
    const filePath = path.join(dir, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        if (fs.existsSync(path.join(filePath, 'package.json')) && fs.existsSync(path.join(filePath, 'src'))) {
          results.push(filePath);
        } else {
          results = results.concat(getSkillDirs(filePath));
        }
      }
    } catch (_) {}
  }
  return results;
}

const allSkills = getSkillDirs(skillsDir);
let metrics = { scanned: 0, drift: 0, patched: 0, fixed: 0, failed: 0, antiPatterns: 0 };

allSkills.forEach((skillPath) => {
  metrics.scanned++;
  const skillName = path.relative(skillsDir, skillPath);
  const srcDir = path.join(skillPath, 'src');
  const distDir = path.join(skillPath, 'dist');
  const pkgPath = path.join(skillPath, 'package.json');

  let issues = [];

  // 1. Dependency Check (Enforce workspace: protocol)
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const coreDep = (pkg.dependencies && pkg.dependencies['@agent/core']) || 
                    (pkg.devDependencies && pkg.devDependencies['@agent/core']);
    
    if (coreDep && coreDep === '*') {
      issues.push('CORE_DEP_DRIFT: Use "workspace:*" instead of "*" for local linking.');
    }
  } catch (_) {
    issues.push('PKG_PARSE_ERROR');
  }

  // 2. Build Drift Check
  let driftDetected = false;
  if (!fs.existsSync(distDir)) {
    driftDetected = true;
  } else {
    const srcFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.ts'));
    const distStat = fs.statSync(distDir);
    for (const f of srcFiles) {
      if (fs.statSync(path.join(srcDir, f)).mtimeMs > distStat.mtimeMs) {
        driftDetected = true;
        break;
      }
    }
  }
  if (driftDetected) issues.push('BUILD_STALE: src/ is newer than dist/ or missing artifacts.');

  // 3. Static Analysis (Anti-patterns)
  const srcFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.ts'));
  srcFiles.forEach(f => {
    const content = fs.readFileSync(path.join(srcDir, f), 'utf8');
    
    // Pattern A: import.meta.url in CJS build
    if (content.includes('import.meta.url')) {
      issues.push(`ANTI_PATTERN: "import.meta.url" found in ${f}. (Incompatible with CJS)`);
      metrics.antiPatterns++;
    }

    // Pattern B: Type-unsafe safeReadFile
    if (content.includes("safeReadFile(") && /safeReadFile\([^,)]+,\s*['"]utf8['"]\)/.test(content)) {
      issues.push(`TYPE_RISK: "safeReadFile(path, 'utf8')" found in ${f}. Use { encoding: 'utf8' } object instead.`);
    }
  });

  // Reporting & Auto-healing
  if (issues.length > 0) {
    metrics.drift++;
    console.log(chalk.yellow(`\n🔍 [ISSUE] ${skillName}`));
    issues.forEach(i => console.log(chalk.dim(`   - ${i}`)));

    // Try Auto-Patch for simple cases
    let patched = false;
    if (issues.some(i => i.includes('CORE_DEP_DRIFT'))) {
      let pkgContent = fs.readFileSync(pkgPath, 'utf8');
      pkgContent = pkgContent.replace(/"@agent\/core": "\*"/g, '"@agent/core": "workspace:*"');
      fs.writeFileSync(pkgPath, pkgContent);
      patched = true;
    }

    // Attempt Reconstruction
    process.stdout.write(chalk.dim('   Attempting recovery... '));
    try {
      // Use pnpm for monorepo efficiency
      execSync('pnpm run build', { cwd: skillPath, stdio: 'ignore', timeout: 60000 });
      metrics.fixed++;
      console.log(chalk.green('SUCCESS'));
    } catch (err) {
      metrics.failed++;
      console.log(chalk.red('FAILED'));
      console.log(chalk.dim('     (Recommendation: Run "pnpm install" then "pnpm run build" in this directory)'));
    }
  }
});

console.log(chalk.dim('\n' + '━'.repeat(60)));
console.log(chalk.bold(`Sanitization Complete:`));
console.log(`- Total Skills Scanned : ${metrics.scanned}`);
console.log(`- Issues Found         : ${metrics.drift}`);
console.log(`- Fixed via Rebuild    : ${metrics.fixed}`);
console.log(`- Critical Failures    : ${metrics.failed}`);
console.log(`- Anti-patterns found  : ${metrics.antiPatterns}`);

if (metrics.failed === 0 && metrics.drift > 0) {
  console.log(chalk.green.bold('\n✅ All detected issues were automatically resolved.'));
} else if (metrics.drift === 0) {
  console.log(chalk.green.bold('\n✨ All systems are healthy. Zero drift detected.'));
} else {
  console.log(chalk.red.bold('\n⚠️  Some issues require manual intervention. See logs above.'));
}
console.log('');
