import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGoogleAuth, formatAgenda } from './lib';
import * as fs from 'node:fs';
import { safeReadFile } from '@agent/core/secure-io';

vi.mock('node:fs');
vi.mock('@agent/core/secure-io');
vi.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: vi.fn().mockImplementation(() => ({
        setCredentials: vi.fn(),
      })),
    },
  },
}));

describe('google-workspace-integrator lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return missing_creds if credentials file is missing', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const auth = await getGoogleAuth();
    expect(auth.status).toBe('missing_creds');
  });

  it('should return needs_auth if token file is missing', async () => {
    // credentials exist, token doesn't
    vi.mocked(fs.existsSync).mockImplementation((p: any) => p.includes('credentials.json'));
    vi.mocked(safeReadFile).mockReturnValue(JSON.stringify({
      installed: { client_id: 'id', client_secret: 'sec', redirect_uris: ['http://localhost'] }
    }));
    
    const auth = await getGoogleAuth();
    expect(auth.status).toBe('needs_auth');
  });

  it('should format agenda correctly', () => {
    const events = [
      { summary: 'Meeting A', start: { dateTime: '2026-03-03T10:00:00Z' } },
      { summary: 'Lunch', start: { dateTime: '2026-03-03T12:00:00Z' } }
    ];
    const output = formatAgenda(events);
    expect(output).toContain('### 🗓️ CEO Agenda');
    expect(output).toContain('Meeting A');
    expect(output).toContain('Lunch');
  });

  it('should handle empty agenda', () => {
    const output = formatAgenda([]);
    expect(output).toBe('CEO, your schedule is clear for now.');
  });
});
