const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

/**
 * Creates a pre-configured yargs instance with common options.
 * Robust implementation for CJS/ESM hybrid environments.
 */
function createStandardYargs(args = process.argv) {
  // Hybrid resolve: yargs can be a function, or have a default property, or need yargs/yargs
  let factory = yargs;
  if (typeof factory !== 'function' && factory.default) {
    factory = factory.default;
  }
  if (typeof factory !== 'function') {
    factory = require('yargs/yargs');
  }

  return factory(hideBin(args))
    .option('input', {
      alias: 'i',
      type: 'string',
      description: 'Input file or directory path',
    })
    .option('out', {
      alias: 'o',
      type: 'string',
      description: 'Output file path (optional)',
    })
    .option('tier', {
      type: 'string',
      choices: ['personal', 'confidential', 'public'],
      default: 'public',
      description: 'Knowledge tier for the operation',
    })
    .help('h')
    .alias('h', 'help');
}

module.exports = {
  createStandardYargs,
};
