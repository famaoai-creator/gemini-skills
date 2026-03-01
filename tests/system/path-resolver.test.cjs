/**
 * System Test: Path Resolver v3.0
 */
const pathResolver = require('../../libs/core/path-resolver.cjs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Testing Path Resolver V3.0...');

try {
  const root = pathResolver.rootDir();
  assert(root.length > 0, 'Root directory should not be empty');
  
  const knowledge = pathResolver.knowledge('incidents');
  assert(knowledge.endsWith('knowledge/incidents'), 'Knowledge semantic path incorrect');
  
  const active = pathResolver.active('missions');
  assert(active.endsWith('active/missions'), 'Active semantic path incorrect');
  
  const scripts = pathResolver.scripts();
  assert(scripts.endsWith('scripts'), 'Scripts semantic path incorrect');
  
  const shared = pathResolver.shared('test.json');
  assert(shared.endsWith('active/shared/test.json'), 'Shared semantic path incorrect');

  const resolved = pathResolver.resolve('active/shared/config.json');
  assert(resolved.includes('active/shared/config.json'), 'Logical resolve failed');

  console.log('✅ Path Resolver tests passed.');
} catch (err) {
  console.error('❌ Path Resolver tests failed:', err.message);
  process.exit(1);
}
