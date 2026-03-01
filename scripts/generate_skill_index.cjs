#!/usr/bin/env node
/**
 * Global Skill Index Generator v3.1 (Deletion-Aware Incremental Edition)
 * Scans all directories for SKILL.md and creates a compact JSON index.
 * Only re-scans skills that have been modified since the last update.
 * Now removes stale entries (deleted skills) from the index.
 */

const { logger, errorHandler, safeReadFile, safeWriteFile, pathResolver, requireRole } = require('./system-prelude.cjs');
const fs = require('fs');
const path = require('path');

requireRole('Ecosystem Architect');

const indexFile = pathResolver.knowledge('orchestration/global_skill_index.json');

function main() {
  try {
    let existingIndex = { s: [] };
    if (fs.existsSync(indexFile)) {
      try {
        existingIndex = JSON.parse(safeReadFile(indexFile, { encoding: 'utf8' }));
      } catch (_) {
        logger.warn('Corrupt index found. Performing full re-scan.');
      }
    }

    const skillsMap = new Map(existingIndex.s.map(s => [s.path, s]));
    const foundPaths = new Set(); // Track skills currently on disk
    const skillsRootDir = pathResolver.rootResolve('skills');
    
    if (!fs.existsSync(skillsRootDir)) {
      throw new Error(`Skills root directory not found: ${skillsRootDir}`);
    }

    const categories = fs.readdirSync(skillsRootDir).filter(f => {
      try { return fs.lstatSync(path.join(skillsRootDir, f)).isDirectory(); } catch(_) { return false; }
    });
    
    let scanned = 0;
    let updated = 0;

    const descRegex = /^description:\s*(.*)$/m;
    const statusRegex = /^status:\s*(\w+)$/m;
    const riskRegex = /^risk_level:\s*(\w+)$/m;

    for (const cat of categories) {
      const catPath = path.join(skillsRootDir, cat);
      const skillDirs = fs.readdirSync(catPath).filter(f => {
        try { return fs.statSync(path.join(catPath, f)).isDirectory(); } catch(_) { return false; }
      });

      for (const dir of skillDirs) {
        scanned++;
        const skillPhysicalPath = path.join('skills', cat, dir);
        const skillFullDir = pathResolver.rootResolve(skillPhysicalPath);
        const skillMdPath = path.join(skillFullDir, 'SKILL.md');

        if (fs.existsSync(skillMdPath)) {
          foundPaths.add(skillPhysicalPath); // Mark as found
          const stat = fs.statSync(skillMdPath);
          const lastMtime = skillsMap.get(skillPhysicalPath)?.u ? new Date(skillsMap.get(skillPhysicalPath).u).getTime() : 0;

          // Only scan if modified since last index update
          if (stat.mtimeMs > lastMtime) {
            updated++;
            const content = safeReadFile(skillMdPath, { encoding: 'utf8' });
            const descMatch = content.match(descRegex);
            const statusMatch = content.match(statusRegex);
            const riskMatch = content.match(riskRegex);

            let desc = descMatch ? descMatch[1].trim() : '';
            if (desc.length > 100) desc = desc.substring(0, 97) + '...';

            const pkgPath = path.join(skillFullDir, 'package.json');
            let mainScript = '';
            if (fs.existsSync(pkgPath)) {
              try {
                const pkg = JSON.parse(safeReadFile(pkgPath, { encoding: 'utf8' }));
                mainScript = pkg.main || '';
              } catch (_) {}
            }

            let tags = [];
            const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
            if (fmMatch) {
              try {
                const yaml = require('js-yaml');
                const fm = yaml.load(fmMatch[1]);
                tags = fm.tags || [];
              } catch (_) {}
            }

            skillsMap.set(skillPhysicalPath, {
              n: dir,
              path: skillPhysicalPath,
              d: desc,
              s: statusMatch ? (statusMatch[1] === 'implemented' ? 'impl' : statusMatch[1].substring(0, 4)) : 'plan',
              r: riskMatch ? riskMatch[1] : 'low',
              m: mainScript,
              t: tags,
              u: new Date(stat.mtimeMs).toISOString()
            });
          }
        }
      }
    }

    // Deletion Detection: Remove entries that are no longer on disk
    let deleted = 0;
    for (const pathKey of skillsMap.keys()) {
      if (!foundPaths.has(pathKey)) {
        skillsMap.delete(pathKey);
        deleted++;
      }
    }

    const skills = Array.from(skillsMap.values());
    const output = {
      v: '1.2.1', // Patch version for deletion logic
      t: skills.length,
      u: new Date().toISOString(),
      s: skills,
    };

    safeWriteFile(indexFile, JSON.stringify(output, null, 2));
    logger.success(`Global Skill Index updated: ${updated} new/updated, ${deleted} deleted, ${scanned} total on disk.`);
  } catch (err) {
    errorHandler(err, 'Incremental Index Generation Failed');
  }
}

main();
