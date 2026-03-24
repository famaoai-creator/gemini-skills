import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Mock @agent/core to simulate resolveServiceBinding and file system
const mocks = vi.hoisted(() => ({
  resolveServiceBinding: vi.fn(),
  safeReadFile: vi.fn(),
  safeExistsSync: vi.fn(),
  logger: { info: vi.fn(), error: vi.fn(), success: vi.fn() }
}));

vi.mock('@agent/core', () => ({
  resolveServiceBinding: mocks.resolveServiceBinding,
  safeReadFile: mocks.safeReadFile,
  safeExistsSync: mocks.safeExistsSync,
  logger: mocks.logger,
  pathResolver: { rootResolve: (p: string) => p }
}));

// Import the function to test (we'll implement this)
import { validateServiceAuth } from './index';

describe('service-actuator: validateServiceAuth', () => {
  const MOCK_PRESET_PATH = 'mock-preset.json';
  const SERVICE_ID = 'test-service';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return valid if no preset path is defined (assumed no auth needed)', async () => {
    const result = await validateServiceAuth(SERVICE_ID, undefined);
    expect(result.valid).toBe(true);
  });

  it('should return valid if auth_strategy is "none" in preset', async () => {
    mocks.safeExistsSync.mockReturnValue(true);
    mocks.safeReadFile.mockReturnValue(JSON.stringify({
      auth_strategy: 'none',
      operations: {}
    }));

    const result = await validateServiceAuth(SERVICE_ID, MOCK_PRESET_PATH);
    expect(result.valid).toBe(true);
  });

  it('should return valid if auth_strategy is "bearer" and token is present', async () => {
    mocks.safeExistsSync.mockReturnValue(true);
    mocks.safeReadFile.mockReturnValue(JSON.stringify({
      auth_strategy: 'bearer',
      operations: {}
    }));
    mocks.resolveServiceBinding.mockReturnValue({ serviceId: SERVICE_ID, accessToken: 'valid-token' });

    const result = await validateServiceAuth(SERVICE_ID, MOCK_PRESET_PATH);
    expect(result.valid).toBe(true);
    expect(mocks.resolveServiceBinding).toHaveBeenCalledWith(SERVICE_ID, 'secret-guard');
  });

  it('should return invalid if auth_strategy is "bearer" but token is missing', async () => {
    mocks.safeExistsSync.mockReturnValue(true);
    mocks.safeReadFile.mockReturnValue(JSON.stringify({
      auth_strategy: 'bearer',
      operations: {}
    }));
    // Simulate missing token
    mocks.resolveServiceBinding.mockReturnValue({ serviceId: SERVICE_ID, accessToken: undefined });

    const result = await validateServiceAuth(SERVICE_ID, MOCK_PRESET_PATH);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Missing access token');
  });

  it('should return valid if API token is missing but CLI is authenticated', async () => {
    const mocks = vi.importMock('@agent/core') as any;
    mocks.safeExistsSync.mockReturnValue(true);
    mocks.safeReadFile.mockReturnValue(JSON.stringify({
      auth_strategy: 'bearer',
      operations: {},
      alternatives: [
        { type: 'cli', command: 'gh', health_check: 'gh auth status' }
      ]
    }));
    
    // API token is missing
    mocks.resolveServiceBinding.mockReturnValue({ serviceId: SERVICE_ID, accessToken: undefined });
    
    // Mock CLI health check success
    const { validateServiceAuth } = await import('./index');
    // We need to mock safeExec or the underlying call
    vi.mock('node:child_process', () => ({
      execSync: vi.fn().mockReturnValue('Logged in as...') // Success
    }));

    const result = await validateServiceAuth(SERVICE_ID, MOCK_PRESET_PATH);
    expect(result.valid).toBe(true);
  });
});
