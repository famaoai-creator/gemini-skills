import * as fs from 'node:fs';
import { createHash } from 'node:crypto';

/**
 * ACE (Autonomous Consensus Engine) Core Utility
 */
export const aceCore = {
  calculateHash: (text: string) => {
    return createHash('sha256').update(text).digest('hex');
  },

  appendThought: (minutesPath: string, role: string, thought: string, _metadata = {}) => {
    let content = '';
    if (fs.existsSync(minutesPath)) {
      content = fs.readFileSync(minutesPath, 'utf8');
    }

    const prevHash = aceCore.calculateHash(content);
    const timestamp = new Date().toISOString();

    const entryHeader = `\n### [${role}] @${timestamp} | PREV_HASH: ${prevHash.substring(0, 8)} | HASH: `;
    const entryBody = `\n> ${thought}\n`;

    const entryHash = aceCore.calculateHash(entryHeader + entryBody);
    const finalEntry = entryHeader + entryHash.substring(0, 8) + entryBody;

    fs.appendFileSync(minutesPath, finalEntry);
    return entryHash;
  },

  validateIntegrity: (minutesPath: string) => {
    if (!fs.existsSync(minutesPath)) return true;
    const content = fs.readFileSync(minutesPath, 'utf8');
    const lines = content.split('\n');
    let lastHash = '';

    for (const line of lines) {
      const match = line.match(/HASH: ([a-f0-9]{8})/);
      if (match) {
        lastHash = match[1];
      }
    }
    console.log(`[Integrity] Last chain hash: ${lastHash}`);
    return true;
  },

  evaluateDecision: (votes: any[]) => {
    const securityRisk = votes.find((v) => v.securityScore === 'S1');
    const highUrgency = votes.some((v) => v.urgencyScore === 'U1');

    if (securityRisk) {
      return {
        decision: 'NO-GO',
        reason: `Critical Security Risk (S1) detected by ${securityRisk.role}.`,
        allowYellowCard: false,
      };
    }

    const s2Risk = votes.find((v) => v.securityScore === 'S2');
    if (s2Risk) {
      if (highUrgency) {
        return {
          decision: 'YELLOW-CARD',
          reason: `High Security Risk (S2) detected, but U1 Urgency allows conditional approval.`,
          allowYellowCard: true,
          debtAction: s2Risk.comment,
        };
      } else {
        return {
          decision: 'NO-GO',
          reason: `High Security Risk (S2) and insufficient urgency for bypass.`,
          allowYellowCard: false,
        };
      }
    }

    return {
      decision: 'GO',
      reason: 'All evaluations within acceptable limits.',
      allowYellowCard: false,
    };
  },
};
