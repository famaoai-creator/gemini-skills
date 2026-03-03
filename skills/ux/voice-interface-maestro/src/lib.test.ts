import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadVoiceConfig, cleanTextForSpeech, speakText, speakArtifact } from './lib';
import * as fs from 'node:fs';
import { execSync } from 'node:child_process';
import { safeReadFile } from '@agent/core/secure-io';

vi.mock('node:fs');
vi.mock('node:child_process');
vi.mock('@agent/core/secure-io', () => ({
  safeReadFile: vi.fn(),
  safeWriteFile: vi.fn(),
}));

describe('voice-interface-maestro lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should load config from file or return defaults', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(safeReadFile).mockReturnValue(JSON.stringify({ engine: 'api', voice: 'Pro' }));

    const config = loadVoiceConfig('/test/config.json');
    expect(config.engine).toBe('api');
    expect(config.voice).toBe('Pro');
  });

  it('should clean text by skipping code blocks', () => {
    const text = 'Hello world ```const x = 1;``` Goodbye';
    const clean = cleanTextForSpeech(text);
    expect(clean).toContain('[コードをスキップ]');
    expect(clean).not.toContain('const x');
  });

  it('should clean Markdown formatting for natural speech', () => {
    const text = '# Title\n[Link](url) **Bold** *Italic*';
    const clean = cleanTextForSpeech(text);
    expect(clean).toBe('Title Link Bold Italic');
  });

  it('should call say command for macos engine', () => {
    const config = { engine: 'macos', voice: 'Kyoko' };
    speakText('Hello', config as any);
    expect(execSync).toHaveBeenCalledWith(expect.stringContaining('say -v Kyoko "Hello"'));
  });

  it('should use fallback for non-macos engines', () => {
    const config = { engine: 'google-tts', voice: 'en-US' };
    const result = speakText('Hello', config as any);
    expect(result.method).toBe('api-google-tts');
    expect(result.success).toBe(true);
  });

  it('should speak DocumentArtifact content', () => {
    const artifact = { id: '1', title: 'Doc', body: 'Content', type: 'text' };
    const config = { engine: 'api', voice: 'Pro' };
    const result = speakArtifact(artifact as any, config as any);
    expect(result.success).toBe(true);
  });
});
