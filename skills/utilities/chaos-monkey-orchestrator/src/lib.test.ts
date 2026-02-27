import { describe, it, expect } from 'vitest';
import { createChaosConfig } from './lib';

describe('chaos-monkey-orchestrator lib', () => {
  it('should create config with target', () => {
    const config = createChaosConfig('my-skill', 'latency', 0.8);
    expect(config.target).toBe('my-skill');
    expect(config.mode).toBe('latency');
    expect(config.intensity).toBe(0.8);
  });
});
