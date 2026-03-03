/**
 * Bridge for legacy CJS scripts to use the latest TS-compiled secure-io.
 */
const io = require('./secure-io.js');
module.exports = {
  validateFileSize: io.validateFileSize,
  safeReadFile: io.safeReadFile,
  safeReadFileAsync: io.safeReadFileAsync,
  safeWriteFile: io.safeWriteFile,
  safeAppendFileSync: io.safeAppendFileSync,
  safeAppendFile: io.safeAppendFileSync,
  safeUnlinkSync: io.safeUnlinkSync,
  safeUnlink: io.safeUnlinkSync,
  safeMkdir: io.safeMkdir,
  safeStreamPipeline: io.safeStreamPipeline,
  safeExec: io.safeExec,
  safeSpawn: io.safeSpawn,
  sanitizePath: io.sanitizePath,
  validateUrl: io.validateUrl,
  writeArtifact: io.writeArtifact,
  readArtifact: io.readArtifact,
  DEFAULT_MAX_FILE_SIZE_MB: io.DEFAULT_MAX_FILE_SIZE_MB,
  DEFAULT_TIMEOUT_MS: io.DEFAULT_TIMEOUT_MS
};
