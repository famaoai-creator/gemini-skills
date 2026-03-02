import * as fs from 'node:fs';
import * as path from 'node:path';
import { safeWriteFile, safeReadFile } from '@agent/core';

const rootDir = process.cwd();

/**
 * Unused Dependency Detector
 * Scans skill scripts to verify if declared dependencies are actually used.
 */

function isUsed(dep: string, skillDir: string): boolean {
  const searchDirs = ['scripts', 'src'];
  let found = false;

  for (const sDir of searchDirs) {
    const targetPath = path.join(skillDir, sDir);
    if (!fs.existsSync(targetPath)) continue;

    const files = fs
      .readdirSync(targetPath, { recursive: true } as any)
      .filter((f: any) => f.endsWith('.js') || f.endsWith('.cjs') || f.endsWith('.ts'));

    for (const file of files as string[]) {
      const content = fs.readFileSync(path.join(targetPath, file), 'utf8');
      // Escape dep name for regex
      const escapedDep = dep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const requireRegex = new RegExp('require\\([\'"]' + escapedDep + '[\'"]', 'g');
      const importRegex = new RegExp('from\\s+[\'"]' + escapedDep + '[\'"]', 'g');
      const directImportRegex = new RegExp('import\\s+[\'"]' + escapedDep + '[\'"]', 'g');
      
      if (requireRegex.test(content) || importRegex.test(content) || directImportRegex.test(content)) {
        found = true;
        break;
      }
    }
    if (found) break;
  }
  return found;
}

// Dynamically discover skills within namespaces
const skills: { name: string; path: string }[] = [];
const skillsRootDir = path.join(rootDir, 'skills');

if (fs.existsSync(skillsRootDir)) {
  const categories = fs
    .readdirSync(skillsRootDir)
    .filter((f) => fs.lstatSync(path.join(skillsRootDir, f)).isDirectory());
  
  for (const cat of categories) {
    const catPath = path.join(skillsRootDir, cat);
    const skillDirs = fs
      .readdirSync(catPath)
      .filter((f) => fs.lstatSync(path.join(catPath, f)).isDirectory());
    
    for (const dir of skillDirs) {
      skills.push({ name: dir, path: path.join('skills', cat, dir) });
    }
  }
}

let totalUnused = 0;
const IGNORE_DEPS = ['@agent/core', 'chalk', 'yargs', 'axios', 'js-yaml'];

console.log(`Scanning ${skills.length} skills for unused dependencies...`);

skills.forEach((skillObj) => {
  const fullSkillPath = path.join(rootDir, skillObj.path);
  const pkgPath = path.join(fullSkillPath, 'package.json');
  
  if (!fs.existsSync(pkgPath)) return;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  let modified = false;

  if (pkg.dependencies) {
    for (const dep of Object.keys(pkg.dependencies)) {
      if (IGNORE_DEPS.includes(dep)) continue;
      if (dep.startsWith('@agent/')) continue;

      if (!isUsed(dep, fullSkillPath)) {
        console.log(`  [${skillObj.name}] UNUSED: ${dep}`);
        delete pkg.dependencies[dep];
        totalUnused++;
        modified = true;
      }
    }
    if (Object.keys(pkg.dependencies).length === 0) delete pkg.dependencies;
  }

  if (modified) {
    safeWriteFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  }
});

console.log(`\nScan complete. Removed ${totalUnused} unused dependency declarations.`);
