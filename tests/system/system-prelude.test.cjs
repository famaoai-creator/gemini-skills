/**
 * System Test: System Prelude v1.0
 */
const prelude = require('../../scripts/system-prelude.cjs');
const assert = require('assert');

console.log('🧪 Testing System Prelude V1.0...');

try {
  assert(prelude.logger, 'Logger should be present');
  assert(prelude.safeReadFile, 'safeReadFile should be present');
  assert(prelude.pathResolver, 'pathResolver should be present');
  assert(prelude.requireRole, 'requireRole should be present');
  
  console.log('✅ System Prelude tests passed.');
} catch (err) {
  console.error('❌ System Prelude tests failed:', err.message);
  process.exit(1);
}
