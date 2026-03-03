import { describe, it, expect } from 'vitest';
import { validateConnection } from './lib';

describe('connection-manager lib', () => {
  it('should validate active connections', () => {
    expect(validateConnection({ type: 'apikey', status: 'active' }).valid).toBe(true);
  });

  it('should reject expired connections', () => {
    const pastDate = new Date(Date.now() - 10000).toISOString();
    const result = validateConnection({ type: 'oauth2', status: 'active', expiry: pastDate });
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Connection expired.');
  });

  it('should reject revoked connections', () => {
    expect(validateConnection({ type: 'basic', status: 'revoked' }).valid).toBe(false);
  });
});
