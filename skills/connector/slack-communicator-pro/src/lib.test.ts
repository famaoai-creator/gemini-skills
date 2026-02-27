import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkSlackWebhook, formatSlackMessage } from './lib';
import * as fs from 'node:fs';

vi.mock('node:fs');

describe('slack-communicator-pro lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should detect webhook if file exists', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ url: 'http://webhook' }));
    const status = checkSlackWebhook();
    expect(status.configured).toBe(true);
    expect(status.url).toBe('http://webhook');
  });

  it('should format alert message', () => {
    const msg = formatSlackMessage('alert', 'System Down!', '#ops');
    expect(msg.channel).toBe('#ops');
    expect(msg.blocks[0].text.text).toBe('ALERT');
  });
});
