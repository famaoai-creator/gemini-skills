import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import { execSync } from 'node:child_process';
import { convertToPPTX } from './lib';
import { safeWriteFile, safeUnlinkSync, safeMkdir } from '@agent/core/secure-io';

vi.mock('node:fs');
vi.mock('node:child_process');
vi.mock('@agent/core/secure-io');

describe('ppt-artisan lib', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const mockMD = { title: 'Test Presentation', body: '# Slide 1', format: 'markdown' as const };

  it('should call execSync with correct Marp arguments', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true); // marp exists
    
    await convertToPPTX({ markdown: mockMD, outputPath: 'out.pptx' });

    expect(safeWriteFile).toHaveBeenCalled();
    expect(execSync).toHaveBeenCalledWith(
      expect.stringContaining('--pptx --pptx-editable -o "out.pptx"'),
      expect.any(Object)
    );
  });

  it('should include theme artifact in command if provided', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const mockTheme = { title: 'Brand', body: 'body{}', format: 'text' as const };

    await convertToPPTX({ 
      markdown: mockMD, 
      outputPath: 'out.pptx',
      theme: mockTheme
    });

    expect(execSync).toHaveBeenCalledWith(
      expect.stringContaining('--theme'),
      expect.any(Object)
    );
  });

  it('should throw detailed error on failure', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(execSync).mockImplementation(() => {
      const err: any = new Error('Command failed');
      err.stderr = Buffer.from('theme not found');
      throw err;
    });

    await expect(convertToPPTX({ markdown: mockMD, outputPath: 'out.pptx' }))
      .rejects.toThrow(/Theme invalid or missing/);
  });
});
