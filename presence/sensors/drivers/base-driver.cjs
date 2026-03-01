/**
 * Base Visual Driver Interface
 * Defines the contract for platform-specific capture implementations.
 */

class BaseVisualDriver {
  constructor(name) {
    this.name = name;
  }

  /**
   * Captures the current screen or window.
   * @param {Object} options - { target: 'screen'|'window', outputPath: string }
   * @returns {Promise<boolean>} Success status
   */
  async capture(options) {
    throw new Error('Method "capture" must be implemented by the driver.');
  }

  /**
   * Checks if the driver is supported on the current platform.
   * @returns {boolean}
   */
  isSupported() {
    return false;
  }
}

module.exports = BaseVisualDriver;
