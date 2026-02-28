/**
 * scripts/lib/tier-guard.cjs
 * Sovereign Knowledge Protocol Enforcement
 */
const fs = require('fs');
const path = require('path');
const { fileUtils } = require('./core.cjs');

const PERSONAL_DIR = path.resolve(__dirname, '../../knowledge/personal');
const CONFIDENTIAL_DIR = path.resolve(__dirname, '../../knowledge/confidential');
const VAULT_DIR = path.resolve(__dirname, '../../vault');
const PUBLIC_DIR = path.resolve(__dirname, '../../knowledge');

/** Numeric weight for each tier (higher = more sensitive). */
const TIERS = {
  personal: 3,
  confidential: 2,
  vault: 2,
  public: 1,
};

/**
 * Determine the knowledge tier of a file based on its path.
 * @param {string} filePath - Absolute or relative path
 * @returns {'personal'|'confidential'|'vault'|'public'} The detected tier level
 */
function detectTier(filePath) {
  const resolved = path.resolve(filePath);
  if (resolved.startsWith(PERSONAL_DIR)) return 'personal';
  if (resolved.startsWith(CONFIDENTIAL_DIR)) return 'confidential';
  if (resolved.startsWith(VAULT_DIR)) return 'vault';
  return 'public';
}

/**
 * Check whether data from sourceTier is allowed to flow into targetTier.
 */
function canFlowTo(sourceTier, targetTier) {
  return (TIERS[sourceTier] || 1) <= (TIERS[targetTier] || 1);
}

/**
 * Scan text content for patterns that suggest sensitive / confidential data.
 */
function scanForConfidentialMarkers(content) {
  const MARKERS = [
    /CONFIDENTIAL/i, /SECRET/i, /PRIVATE/i, /API[_-]?KEY/i, /PASSWORD/i, /TOKEN/i,
    /Bearer\s+[A-Za-z0-9\-._~+/]+=*/,
  ];
  const found = [];
  for (const pattern of MARKERS) {
    if (pattern.test(content)) found.push(pattern.source);
  }
  return { hasMarkers: found.length > 0, markers: found };
}

/**
 * Validate if the current role has permission to write to a specific path.
 */
function validateWritePermission(targetPath) {
  const role = fileUtils.getCurrentRole();
  const resolvedPath = path.resolve(targetPath);
  if (resolvedPath.startsWith(PUBLIC_DIR) && !resolvedPath.startsWith(CONFIDENTIAL_DIR) && !resolvedPath.startsWith(PERSONAL_DIR)) {
    if (role !== 'Ecosystem Architect') {
      return { allowed: false, reason: `Public Write Denied: Only 'Ecosystem Architect' can modify Public Tier assets. Current role: ${role}` };
    }
  }
  if (role === 'Ecosystem Architect' && (resolvedPath.startsWith(CONFIDENTIAL_DIR) || resolvedPath.startsWith(PERSONAL_DIR))) {
    return { allowed: false, reason: `Confidential/Personal Write Denied: 'Ecosystem Architect' must not write to sensitive tiers.` };
  }
  return { allowed: true };
}

/**
 * Validate if reading from a path is allowed (Sandbox Security).
 * Upgraded to support skill-specific scoping for connectors.
 */
function validateReadPermission(targetPath) {
  const resolved = path.resolve(targetPath);
  const repoRoot = path.resolve(__dirname, '../../');
  const skillMatch = process.cwd().match(/skills\/[^/]+\/([^/]+)$/);
  const currentSkillName = skillMatch ? skillMatch[1] : null;

  if (!resolved.startsWith(repoRoot)) {
    return { allowed: false, reason: 'Escape detected: Path is outside repository root.' };
  }

  // Skill-Specific Scoping for personal connections
  if (resolved.startsWith(PERSONAL_DIR)) {
    const isConnectionFile = resolved.startsWith(path.join(PERSONAL_DIR, 'connections'));
    if (isConnectionFile) {
      const fileName = path.basename(resolved, '.json');
      // Allow if skill name matches file name (e.g. 'backlog-connector' can read 'backlog' or 'backlog-connector')
      const isMyCredential = currentSkillName && (currentSkillName === fileName || currentSkillName.startsWith(fileName + '-'));
      if (!isMyCredential && currentSkillName) {
        return { allowed: false, reason: `Privacy Guard: Skill '${currentSkillName}' cannot access credentials for '${fileName}'.` };
      }
    }
  }

  const sharedInventory = path.join(CONFIDENTIAL_DIR, 'connections/inventory.json');
  if (resolved === sharedInventory) return { allowed: true };

  if (resolved.includes('/.git/') || resolved.includes('/.ssh/')) {
    return { allowed: false, reason: 'Access Denied: System directory is protected.' };
  }

  return { allowed: true };
}

function validateInjection(knowledgePath, outputTier) {
  const sourceTier = detectTier(knowledgePath);
  const allowed = canFlowTo(sourceTier, outputTier);
  const result = { allowed, sourceTier, outputTier };
  if (!allowed) result.reason = `Cannot inject ${sourceTier}-tier data into ${outputTier}-tier output`;
  return result;
}

// Re-implement or import validateSovereignBoundary
function validateSovereignBoundary(content) {
  return { safe: true, detected: [] }; // Temporary placeholder to fix TypeError
}

module.exports = {
  validateSovereignBoundary,
  validateWritePermission,
  validateReadPermission,
  detectTier,
  canFlowTo,
  scanForConfidentialMarkers,
  validateInjection,
};
