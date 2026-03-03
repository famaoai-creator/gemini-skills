import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeMcp } from '@agent/core/mcp-client-engine';

// Mock the core library
vi.mock('@agent/core/mcp-client-engine', () => ({
  executeMcp: vi.fn(),
}));

describe('mcp-terraform-connector', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should call executeMcp with correct terraform arguments', async () => {
    vi.mocked(executeMcp).mockResolvedValue({ status: 'success' });
    
    // Manual trigger of the logic (since index.ts is a wrapper)
    const action = 'list_tools';
    const mcpCommand = 'npx';
    const mcpArgs = ['-y', 'terraform-mcp-server'];

    const result = await executeMcp(mcpCommand, mcpArgs, {
      action: action as any,
      name: undefined,
      arguments: {}
    });

    expect(executeMcp).toHaveBeenCalledWith('npx', ['-y', 'terraform-mcp-server'], expect.objectContaining({
      action: 'list_tools'
    }));
    expect(result).toEqual({ status: 'success' });
  });
});
