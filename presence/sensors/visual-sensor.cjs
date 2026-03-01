/**
 * Visual Sensor Orchestrator
 * Detects the platform and delegates to the appropriate driver.
 */

const { logger } = require('../../libs/core/core.cjs');
const pathResolver = require('../../libs/core/path-resolver.cjs');
const MacOSDriver = require('./drivers/macos-driver.cjs');
const fs = require('fs');
const path = require('path');

class VisualSensor {
  constructor() {
    this.drivers = [
      new MacOSDriver()
    ];
    this.activeDriver = this.drivers.find(d => d.isSupported());
  }

  /**
   * Captures visual state and returns metadata.
   */
  async capture(target = 'screen') {
    if (!this.activeDriver) {
      throw new Error(`Visual perception is not supported on this platform (${process.platform}).`);
    }

    const captureDir = pathResolver.active('shared/captures');
    if (!fs.existsSync(captureDir)) fs.mkdirSync(captureDir, { recursive: true });

    const filename = `capture_${Date.now()}.png`;
    const outputPath = path.join(captureDir, filename);

    logger.info(`📸 Capturing ${target} via ${this.activeDriver.name} driver...`);
    
    try {
      const success = await this.activeDriver.capture({ target, outputPath });
      if (success) {
        const stats = fs.statSync(outputPath);
        logger.success(`✅ Visual artifact saved: ${filename} (${Math.round(stats.size / 1024)} KB)`);
        
        return {
          id: filename,
          path: outputPath,
          timestamp: new Date().toISOString(),
          driver: this.activeDriver.name,
          format: 'image/png',
          size_bytes: stats.size
        };
      }
    } catch (err) {
      logger.error(`[VisualSensor] Orchestration Failure: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new VisualSensor();
