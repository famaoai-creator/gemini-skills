/**
 * Connection Manager Core Library.
 */

export interface ConnectionConfig {
  type: 'oauth2' | 'apikey' | 'basic';
  status: 'active' | 'expired' | 'revoked';
  expiry?: string;
}

export function validateConnection(config: ConnectionConfig): { valid: boolean; reason?: string } {
  if (config.status === 'revoked') return { valid: false, reason: 'Token was manually revoked.' };
  if (config.expiry && new Date(config.expiry) < new Date()) {
    return { valid: false, reason: 'Connection expired.' };
  }
  return { valid: config.status === 'active' };
}
