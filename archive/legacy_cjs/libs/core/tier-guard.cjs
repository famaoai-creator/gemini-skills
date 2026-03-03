/**
 * Bridge for legacy CJS scripts to use the latest TS-compiled tier-guard.
 */
const tg = require('./tier-guard.js');
module.exports = {
  detectTier: tg.detectTier,
  canFlowTo: tg.canFlowTo,
  validateInjection: tg.validateInjection,
  scanForConfidentialMarkers: tg.scanForConfidentialMarkers,
  validateReadPermission: tg.validateReadPermission,
  validateWritePermission: tg.validateWritePermission,
  TIERS: tg.TIERS
};
