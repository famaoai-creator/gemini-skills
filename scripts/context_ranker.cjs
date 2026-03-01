#!/usr/bin/env node
/**
 * context_ranker.cjs v3.0
 * Ranks knowledge files based on intent and filters out noise.
 * Standards-compliant version (Script Optimization Mission).
 */

const { logger, errorHandler, safeReadFile, safeWriteFile, pathResolver } = require('./system-prelude.cjs');
const fs = require('fs');
const path = require('path');

const indexPath = pathResolver.knowledge('orchestration/knowledge_index.json');

function rankContext(intent, limit = 7) {
  if (!fs.existsSync(indexPath)) {
    logger.error('[Ranker] Index not found. Run generate_knowledge_index.cjs first.');
    return [];
  }

  try {
    const indexContent = safeReadFile(indexPath, { encoding: 'utf8' });
    const index = JSON.parse(indexContent);
    const query = intent.toLowerCase();
    const queryWords = query.split(/[\s,._/-]+/).filter(w => w.length > 2);

    const scoredItems = index.items.map(item => {
      let score = 0;
      const title = (item.title || '').toLowerCase();
      const id = (item.id || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();

      queryWords.forEach(word => {
        if (title.includes(word)) score += 10;
        if (id.includes(word)) score += 5;
        if (cat.includes(word)) score += 3;
      });

      if (query.includes(cat) || cat.includes(query)) score += 15;
      if (item.last_updated && item.last_updated.startsWith('2026')) score += 2;
      if (id.includes('protocol') || id.includes('policy')) score += 5;

      return { ...item, score };
    });

    return scoredItems
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (err) {
    logger.error(`Ranking Failed: ${err.message}`);
    return [];
  }
}

if (require.main === module) {
  try {
    const intent = process.argv.slice(2).join(' ');
    if (!intent) {
      logger.info('Usage: node context_ranker.cjs "<intent>"');
      process.exit(1);
    }

    const ranked = rankContext(intent);
    logger.info(`Context Ranking for: "${intent}"`);
    
    if (ranked.length === 0) {
      logger.info('No highly relevant knowledge found. Defaulting to core protocols.');
    } else {
      ranked.forEach((item, i) => {
        logger.info(`${i+1}. [Score: ${item.score}] ${item.title} (${item.id})`);
      });
    }

    const activeContextPath = pathResolver.knowledge('orchestration/active_context.json');
    safeWriteFile(activeContextPath, JSON.stringify({
      intent,
      timestamp: new Date().toISOString(),
      top_matches: ranked
    }, null, 2));
    
    logger.success(`Active context saved to ${activeContextPath}`);
  } catch (err) {
    errorHandler(err, 'Context Ranker Failed');
  }
}

module.exports = { rankContext };
