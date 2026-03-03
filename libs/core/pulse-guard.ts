import { createHmac } from 'node:crypto';

/**
 * Pulse Guard: Sovereign Token Manager
 */
export const pulseGuard = {
  createToken: (missionId: string, scope: any) => {
    const secret = process.env.GEMINI_SOVEREIGN_SECRET || 'default-secret';
    const payload = JSON.stringify({ missionId, scope, ts: Date.now() });
    const hmac = createHmac('sha256', secret).update(payload).digest('hex');
    return Buffer.from(payload).toString('base64') + '.' + hmac;
  },

  validateToken: (token: string) => {
    try {
      const [base64Payload, signature] = token.split('.');
      const secret = process.env.GEMINI_SOVEREIGN_SECRET || 'default-secret';
      const payload = Buffer.from(base64Payload, 'base64').toString();

      const expectedHmac = createHmac('sha256', secret).update(payload).digest('hex');
      if (signature !== expectedHmac) return null;

      const data = JSON.parse(payload);
      if (Date.now() - data.ts > 3600000) return null;

      return data;
    } catch (_e) {
      return null;
    }
  },
};
