import * as fs from 'node:fs';
import * as path from 'node:path';

export function diagnoseConnection(system: string, inventory: any, rootDir: string): any {
  const config = inventory.systems[system.toLowerCase()];
  if (!config) {
    throw new Error('System ' + system + ' not defined in inventory.');
  }

  const secretPath = path.resolve(rootDir, config.credential_ref);
  const hasSecret = fs.existsSync(secretPath);

  return {
    system,
    config_status: 'valid',
    credential_status: hasSecret ? 'found' : 'missing',
    ready: hasSecret,
  };
}
