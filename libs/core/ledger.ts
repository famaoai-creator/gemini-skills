import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';

/**
 * Ecosystem Ledger v1.0
 * Provides a centralized, tamper-evident audit trail for all governance events.
 */

const LEDGER_PATH = path.join(process.cwd(), 'active/audit/governance-ledger.jsonl');

export const record = (type: string, data: any) => {
  const timestamp = new Date().toISOString();
  const lastHash = _getLastHash();

  const entry: any = {
    timestamp,
    type,
    role: data.role || 'Unknown',
    mission_id: data.mission_id || 'None',
    payload: data,
    parent_hash: lastHash,
  };

  const hash = createHash('sha256').update(JSON.stringify(entry)).digest('hex');
  entry.hash = hash;

  if (!fs.existsSync(path.dirname(LEDGER_PATH))) {
    fs.mkdirSync(path.dirname(LEDGER_PATH), { recursive: true });
  }
  fs.appendFileSync(LEDGER_PATH, JSON.stringify(entry) + '\n');
  return hash;
};

function _getLastHash() {
  if (!fs.existsSync(LEDGER_PATH)) return '0'.repeat(64);
  try {
    const content = fs.readFileSync(LEDGER_PATH, 'utf8').trim();
    if (!content) return '0'.repeat(64);
    const lines = content.split('\n');
    const lastEntry = JSON.parse(lines[lines.length - 1]);
    return lastEntry.hash || '0'.repeat(64);
  } catch (_e) {
    return '0'.repeat(64);
  }
}

/**
 * Verify the integrity of the entire ledger
 */
export const verifyIntegrity = (): boolean => {
  if (!fs.existsSync(LEDGER_PATH)) return true;
  const lines = fs.readFileSync(LEDGER_PATH, 'utf8').trim().split('\n');
  let expectedParentHash = '0'.repeat(64);

  for (const line of lines) {
    if (!line) continue;
    try {
      const entry = JSON.parse(line);
      const { hash, ...dataWithoutHash } = entry;

      if (entry.parent_hash !== expectedParentHash) return false;

      const actualHash = createHash('sha256')
        .update(JSON.stringify(dataWithoutHash))
        .digest('hex');
      if (hash !== actualHash) return false;

      expectedParentHash = hash;
    } catch (_e) {
      return false;
    }
  }
  return true;
};

// Legacy support
export const ledger = { record, verifyIntegrity };
