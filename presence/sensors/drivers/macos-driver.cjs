/**
 * macOS Visual Driver
 * Uses 'screencapture' for screen/window and native Swift script for camera.
 */

const BaseVisualDriver = require('./base-driver.cjs');
const { execFileSync } = require('child_process');
const os = require('os');
const path = require('path');

class MacOSDriver extends BaseVisualDriver {
  constructor() {
    super('macOS');
  }

  isSupported() {
    return os.platform() === 'darwin';
  }

  async capture(options) {
    const { target = 'screen', outputPath } = options;
    
    if (target === 'camera') {
      return this.captureCamera(outputPath);
    }

    // screencapture flags:
    // -x: silent
    const args = ['-x'];
    
    if (target === 'window') {
      args.push('-m'); 
    }

    args.push(outputPath);

    try {
      execFileSync('screencapture', args);
      return true;
    } catch (err) {
      throw new Error(`[MacOSDriver] Screen capture failed: ${err.message}`);
    }
  }

  /**
   * Captures a still from the default camera using a Swift script.
   */
  async captureCamera(outputPath) {
    const scriptPath = path.join(__dirname, 'macos-camera.swift');
    try {
      execFileSync('swift', [scriptPath, outputPath]);
      return true;
    } catch (err) {
      throw new Error(`[MacOSDriver] Camera capture failed: ${err.message}`);
    }
  }
}

module.exports = MacOSDriver;
