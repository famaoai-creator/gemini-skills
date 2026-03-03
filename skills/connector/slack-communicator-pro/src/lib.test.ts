import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadSlackCredentials, formatSlackMessage } from './lib';
import * as fs from 'node:fs';
import { safeReadFile } from '@agent/core/secure-io';

vi.mock('node:fs');
vi.mock('@agent/core/secure-io');

describe('slack-communicator-pro lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should load credentials from file if exists', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(safeReadFile).mockReturnValue(JSON.stringify({ 
      bot_token: 'xoxb-test',
      url: 'https://hooks.slack.com/test'
    }));
    
    const creds = loadSlackCredentials();
    expect(creds.bot_token).toBe('xoxb-test');
    expect(creds.webhook_url).toBe('https://hooks.slack.com/test');
  });

  it('should format alert message blocks', () => {
    const msg = formatSlackMessage('alert', 'Database is down!', '#general');
    expect(msg.channel).toBe('#general');
    expect(msg.blocks[0].type).toBe('header');
    expect(msg.blocks[0].text.text).toContain('GEMINI SYSTEM ALERT');
    expect(msg.blocks[1].text.text).toContain('Database is down!');
  });

  it('should format actionable message blocks', () => {
    const msg = formatSlackMessage('actionable', 'Approve deployment?', '#ops');
    expect(msg.blocks[1].type).toBe('actions');
    expect(msg.blocks[1].elements[0].text.text).toBe('Approve & Execute');
  });
});
