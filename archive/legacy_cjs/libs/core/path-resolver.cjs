/**
 * Bridge for legacy CJS scripts to use the latest TS-compiled path-resolver.
 */
const { pathResolver } = require('./path-resolver.js');
module.exports = pathResolver;
