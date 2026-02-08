/**
 * Structured Logger - provides leveled, structured logging for skills.
 *
 * Usage:
 *   const { createLogger } = require('./logger.cjs');
 *   const log = createLogger('my-skill');
 *   log.info('Processing started', { file: 'data.json' });
 *   log.error('Failed', { code: 'FILE_NOT_FOUND' });
 */

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 };

function createLogger(name, options = {}) {
  const level = LOG_LEVELS[options.level || process.env.LOG_LEVEL || 'info'] ?? LOG_LEVELS.info;
  const json = options.json || process.env.LOG_FORMAT === 'json';

  function _format(lvl, msg, data) {
    const ts = new Date().toISOString();
    if (json) {
      return JSON.stringify({ ts, level: lvl, skill: name, msg, ...data });
    }
    const prefix = `[${ts}] [${lvl.toUpperCase()}] [${name}]`;
    if (data && Object.keys(data).length > 0) {
      return `${prefix} ${msg} ${JSON.stringify(data)}`;
    }
    return `${prefix} ${msg}`;
  }

  function _log(lvl, msg, data) {
    if (LOG_LEVELS[lvl] < level) return;
    const line = _format(lvl, msg, data);
    if (lvl === 'error') {
      process.stderr.write(line + '\n');
    } else {
      process.stderr.write(line + '\n');
    }
  }

  return {
    debug: (msg, data) => _log('debug', msg, data),
    info: (msg, data) => _log('info', msg, data),
    warn: (msg, data) => _log('warn', msg, data),
    error: (msg, data) => _log('error', msg, data),
    child: (childName) => createLogger(`${name}:${childName}`, options),
  };
}

module.exports = { createLogger, LOG_LEVELS };
