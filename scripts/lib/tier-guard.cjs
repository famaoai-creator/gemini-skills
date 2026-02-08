const path = require('path');

/**
 * Knowledge Tier Guard - prevents confidential/personal data leaks into public outputs.
 *
 * Tier hierarchy: personal > confidential > public
 * Data from a higher tier must never appear in a lower-tier output.
 */

const TIERS = { personal: 3, confidential: 2, public: 1 };

const KNOWLEDGE_ROOT = path.resolve(__dirname, '../../knowledge');

const TIER_PATHS = {
  personal: path.join(KNOWLEDGE_ROOT, 'personal'),
  confidential: path.join(KNOWLEDGE_ROOT, 'confidential'),
  public: KNOWLEDGE_ROOT,
};

/**
 * Determine the knowledge tier of a file path.
 * @param {string} filePath - Absolute or relative path
 * @returns {'personal' | 'confidential' | 'public'}
 */
function detectTier(filePath) {
  const resolved = path.resolve(filePath);
  if (resolved.startsWith(path.resolve(TIER_PATHS.personal))) return 'personal';
  if (resolved.startsWith(path.resolve(TIER_PATHS.confidential))) return 'confidential';
  return 'public';
}

/**
 * Check if data from sourceTier can be used in targetTier output.
 * @param {'personal' | 'confidential' | 'public'} sourceTier
 * @param {'personal' | 'confidential' | 'public'} targetTier
 * @returns {boolean}
 */
function canFlowTo(sourceTier, targetTier) {
  return TIERS[sourceTier] <= TIERS[targetTier];
}

/**
 * Validate that a knowledge file can be injected into output at the given tier.
 * @param {string} knowledgePath - Path to knowledge file
 * @param {'personal' | 'confidential' | 'public'} outputTier - Target output tier
 * @returns {{ allowed: boolean, sourceTier: string, outputTier: string, reason?: string }}
 */
function validateInjection(knowledgePath, outputTier) {
  const sourceTier = detectTier(knowledgePath);
  const allowed = canFlowTo(sourceTier, outputTier);
  const result = { allowed, sourceTier, outputTier };

  if (!allowed) {
    result.reason = `Cannot inject ${sourceTier}-tier data into ${outputTier}-tier output`;
  }

  return result;
}

/**
 * Scan text content for potential confidential markers.
 * Returns findings of patterns that suggest sensitive data.
 * @param {string} content - Text to scan
 * @returns {{ hasMarkers: boolean, markers: string[] }}
 */
function scanForConfidentialMarkers(content) {
  const MARKERS = [
    /CONFIDENTIAL/i,
    /SECRET/i,
    /PRIVATE/i,
    /API[_-]?KEY/i,
    /PASSWORD/i,
    /TOKEN/i,
    /Bearer\s+[A-Za-z0-9\-._~+/]+=*/,
  ];

  const found = [];
  for (const pattern of MARKERS) {
    if (pattern.test(content)) {
      found.push(pattern.source);
    }
  }

  return { hasMarkers: found.length > 0, markers: found };
}

module.exports = { detectTier, canFlowTo, validateInjection, scanForConfidentialMarkers, TIERS };
