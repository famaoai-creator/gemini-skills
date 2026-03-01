/**
 * macOS Visual Driver
 * Uses the native 'screencapture' command.
 */

const BaseVisualDriver = require('./base-driver.cjs');
const { execFileSync } = require('child_process');
const os = require('os');

class MacOSDriver extends BaseVisualDriver {
  constructor() {
    super('macOS');
  }

  isSupported() {
    return os.platform() === 'darwin';
  }

  async capture(options) {
    const { target = 'screen', outputPath } = options;
    
    // screencapture flags:
    // -x: silent
    // -m: main monitor only (optional)
    // -W: select window (interactive, but we will use -c or -x for background)
    const args = ['-x'];
    
    if (target === 'window') {
      // Note: Full automated window capture on macOS usually requires accessibility permissions
      // or specific window IDs. For this prototype, we default to screen capture.
      args.push('-m'); 
    }

    args.push(outputPath);

    try {
      execFileSync('screencapture', args);
      return true;
    } catch (err) {
      throw new Error(`[MacOSDriver] Capture failed: ${err.message}`);
    }
  }
}

module.exports = MacOSDriver;
