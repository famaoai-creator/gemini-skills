import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateMaestroYaml } from './lib';
import * as secureIo from '@agent/core/secure-io';

vi.mock('@agent/core/secure-io');

describe('generateMaestroYaml', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('generates yaml using gemini CLI', () => {
    const fakeYaml = `appId: com.example.app
---
- launchApp
`;
    vi.mocked(secureIo.safeExec).mockReturnValue(fakeYaml);

    const result = generateMaestroYaml({ appId: 'com.example.app', scenario: 'Launch app' });
    expect(result).toBe(fakeYaml.trim());
    expect(secureIo.safeExec).toHaveBeenCalledWith('gemini', expect.any(Array), expect.any(Object));
  });

  it('cleans up markdown code blocks', () => {
    const rawOutput = `Here is your yaml:
\`\`\`yaml
appId: com.example.app
---
- launchApp
\`\`\`
`;
    vi.mocked(secureIo.safeExec).mockReturnValue(rawOutput);

    const result = generateMaestroYaml({ appId: 'com.example.app', scenario: 'Launch app' });
    expect(result).toBe(`appId: com.example.app
---
- launchApp`);
  });
});
