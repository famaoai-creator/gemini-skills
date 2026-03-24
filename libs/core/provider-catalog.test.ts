import { afterEach, describe, expect, it } from 'vitest';

import {
  discoverProviderAvailability,
  getProviderDefinition,
  listBuiltinProviderDefinitions,
  listSupportedProviderIds,
} from './provider-catalog.js';

describe('provider catalog', () => {
  const originalLocalOpenAI = process.env.LOCAL_OPENAI_BASE_URL;

  afterEach(() => {
    if (originalLocalOpenAI === undefined) {
      delete process.env.LOCAL_OPENAI_BASE_URL;
    } else {
      process.env.LOCAL_OPENAI_BASE_URL = originalLocalOpenAI;
    }
  });

  it('lists built-in provider definitions including local transports', () => {
    const providers = listSupportedProviderIds();
    expect(providers).toContain('gemini');
    expect(providers).toContain('ollama');
    expect(providers).toContain('local-openai');
  });

  it('resolves ACP provider metadata from the catalog', () => {
    const gemini = getProviderDefinition('gemini');
    expect(gemini).toMatchObject({
      provider: 'gemini',
      transport: 'acp',
      bootCommand: 'gemini',
      defaultModel: 'gemini-2.5-flash',
    });
  });

  it('treats env-backed local providers as installed when configured', () => {
    process.env.LOCAL_OPENAI_BASE_URL = 'http://127.0.0.1:8000/v1';
    const definition = getProviderDefinition('local-openai');
    expect(definition).not.toBeNull();
    const availability = discoverProviderAvailability(definition!);
    expect(availability).toMatchObject({
      installed: true,
      healthy: true,
      version: 'configured',
    });
  });

  it('returns cloned definitions so callers cannot mutate the catalog', () => {
    const providers = listBuiltinProviderDefinitions();
    providers[0].suggestedModels.push('mutated-model');
    const fresh = getProviderDefinition(providers[0].provider);
    expect(fresh?.suggestedModels).not.toContain('mutated-model');
  });
});
