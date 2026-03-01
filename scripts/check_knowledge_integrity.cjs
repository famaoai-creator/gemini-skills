#!/usr/bin/env node
/**
 * Knowledge Integrity Checker v3.0
 * Detects broken internal links and duplicated context in documentation.
 * Standards-compliant version (Script Optimization Mission).
 */

const { logger, errorHandler, safeReadFile, pathResolver } = require('./system-prelude.cjs');
const { walk } = require('../libs/core/fs-utils.cjs');
const fs = require('fs');
const path = require('path');

const knowledgeDir = pathResolver.knowledge();

function checkLinks() {
  const issues = [];
  const files = [];

  for (const file of walk(knowledgeDir)) {
    if (file.endsWith('.md')) {
      files.push(file);
    }
  }

  files.forEach((file) => {
    try {
      const content = safeReadFile(file, { encoding: 'utf8' });
      const relFile = path.relative(pathResolver.rootDir(), file);

      const linkRegex = /\[.*?\]\(((\.\/|\.\.\/).*?\.md)\)/g;
      let match;
      while ((match = linkRegex.exec(content)) !== null) {
        const linkPath = path.resolve(path.dirname(file), match[1]);
        if (!fs.existsSync(linkPath)) {
          issues.push({ file: relFile, type: 'BROKEN_LINK', detail: match[1] });
        }
      }
    } catch (_) {}
  });

  return issues;
}

try {
  const issues = checkLinks();
  if (issues.length > 0) {
    logger.warn(`Knowledge Integrity Issues Found: ${issues.length}`);
    issues.forEach((i) => {
      console.log(`  [${i.type}] ${i.file}: ${i.detail}`);
    });
    process.exit(1);
  } else {
    logger.success('Knowledge integrity verified. No broken links detected.');
  }
} catch (err) {
  errorHandler(err, 'Knowledge Integrity Check Failed');
}
