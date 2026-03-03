import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Sovereign Secret Guard v1.0
 */

const SECRETS_FILE = path.join(process.cwd(), 'vault/secrets/secrets.json');
const _activeSecrets = new Set<string>();

export const getSecret = (key: string): string | null => {
  let value = process.env[key];

  if (!value && fs.existsSync(SECRETS_FILE)) {
    try {
      const secrets = JSON.parse(fs.readFileSync(SECRETS_FILE, 'utf8'));
      value = secrets[key];
    } catch (_) {}
  }

  if (value && typeof value === 'string') {
    if (value.length > 8) _activeSecrets.add(value);
    return value;
  }
  return null;
};

export const getActiveSecrets = () => Array.from(_activeSecrets);

export const isSecretPath = (filePath: string) => {
  const resolved = path.resolve(filePath);
  return resolved.startsWith(path.join(process.cwd(), 'vault/secrets'));
};

export const secretGuard = { getSecret, getActiveSecrets, isSecretPath };
