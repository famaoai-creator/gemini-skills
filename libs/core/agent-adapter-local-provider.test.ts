import { afterEach, describe, expect, it, vi } from 'vitest';

import { OpenAICompatibleAdapter } from './agent-adapter.js';
import { pathResolver, safeExistsSync, safeRmSync, safeWriteFile, withExecutionContext } from './index.js';

const originalFetch = globalThis.fetch;
const originalOpenAIKey = process.env.OPENAI_API_KEY;
const originalOllamaBase = process.env.OLLAMA_BASE_URL;
const slackCoordination = pathResolver.rootResolve('active/shared/coordination/channels/slack');
const missionFixturePath = pathResolver.rootResolve('active/missions/public/RUNTIME-SUPERVISOR-HARDENING');

describe('OpenAICompatibleAdapter', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalOpenAIKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalOpenAIKey;
    }
    if (originalOllamaBase === undefined) {
      delete process.env.OLLAMA_BASE_URL;
    } else {
      process.env.OLLAMA_BASE_URL = originalOllamaBase;
    }
    withExecutionContext('slack_bridge', () => {
      if (safeExistsSync(slackCoordination)) safeRmSync(slackCoordination);
    });
    withExecutionContext('software_developer', () => {
      if (safeExistsSync(missionFixturePath)) safeRmSync(missionFixturePath);
    }, 'ecosystem_architect');
    vi.restoreAllMocks();
  });

  it('sends chat requests to ollama and parses the native response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: { content: 'hello from ollama' },
        eval_count: 12,
      }),
    });
    globalThis.fetch = fetchMock as any;
    process.env.OLLAMA_BASE_URL = 'http://127.0.0.1:11434';

    const adapter = new OpenAICompatibleAdapter({
      provider: 'ollama',
      model: 'llama3.1:8b',
      systemPrompt: 'You are local.',
    });

    const response = await adapter.ask('ping');
    expect(response.text).toBe('hello from ollama');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:11434/api/chat',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'content-type': 'application/json' }),
      }),
    );

    const body = JSON.parse((fetchMock.mock.calls[0]?.[1] as any).body);
    expect(body.model).toBe('llama3.1:8b');
    expect(body.stream).toBe(false);
    expect(body.messages[0]).toMatchObject({ role: 'system', content: 'You are local.' });
    expect(body.messages[1]).toMatchObject({ role: 'system' });
    expect(body.messages[1].content).toContain('Available tools:');
    expect(body.messages[2]).toMatchObject({ role: 'user' });
    expect(body.messages[2].content).toContain('/set nothink');
    expect(body.messages[2].content).toContain('ping');
  });

  it('sends chat requests to openai-compatible endpoints and parses choices', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'hello from local-openai' } }],
        usage: { total_tokens: 42 },
      }),
    });
    globalThis.fetch = fetchMock as any;
    process.env.OPENAI_API_KEY = 'test-key';

    const adapter = new OpenAICompatibleAdapter({
      provider: 'local-openai',
      model: 'qwen2.5-7b-instruct',
      baseUrl: 'http://127.0.0.1:8000/v1',
    });

    const response = await adapter.ask('status');
    expect(response.text).toBe('hello from local-openai');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'content-type': 'application/json',
          authorization: 'Bearer test-key',
        }),
      }),
    );
  });

  it('executes governed local read tools when the model emits a tool request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: { content: '{"mode":"tool","tool":"read_governed_artifact","path":"active/shared/coordination/channels/slack/inbox/test.json"}' },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: { content: 'There are no managed runtimes right now.' },
        }),
      });
    globalThis.fetch = fetchMock as any;
    process.env.OLLAMA_BASE_URL = 'http://127.0.0.1:11434';
    withExecutionContext('slack_bridge', () => {
      safeWriteFile('active/shared/coordination/channels/slack/inbox/test.json', JSON.stringify({ ok: true }, null, 2));
    });

    const adapter = new OpenAICompatibleAdapter({
      provider: 'ollama',
      model: 'llama3.1:8b',
    });

    const response = await adapter.ask('Read the governed artifact at active/shared/coordination/channels/slack and use a tool if needed.');
    expect(response.text).toBe('There are no managed runtimes right now.');
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const firstBody = JSON.parse((fetchMock.mock.calls[0]?.[1] as any).body);
    expect(firstBody.messages[0].content).toContain('Available tools:');
    expect(firstBody.messages[firstBody.messages.length - 1].content).toContain('Respond only with JSON.');
    expect(firstBody.format).toBeTruthy();

    const secondBody = JSON.parse((fetchMock.mock.calls[1]?.[1] as any).body);
    const assistantDecisionMessage = secondBody.messages[secondBody.messages.length - 2];
    expect(assistantDecisionMessage.role).toBe('assistant');
    expect(assistantDecisionMessage.content).toContain('"mode":"tool"');
    const toolResultMessage = secondBody.messages[secondBody.messages.length - 1];
    expect(toolResultMessage.role).toBe('user');
    expect(toolResultMessage.content).toContain('/set nothink');
    expect(toolResultMessage.content).toContain('TOOL_RESULT');
    expect(toolResultMessage.content).toContain('"tool": "read_governed_artifact"');
  });

  it('prefetches runtime state for runtime-dependent queries before asking the model', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: { content: 'Runtime overview ready.' },
      }),
    });
    globalThis.fetch = fetchMock as any;
    process.env.OLLAMA_BASE_URL = 'http://127.0.0.1:11434';

    const adapter = new OpenAICompatibleAdapter({
      provider: 'ollama',
      model: 'llama3.1:8b',
    });

    const response = await adapter.ask('What is the current runtime topology?');
    expect(response.text).toBe('Runtime overview ready.');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const body = JSON.parse((fetchMock.mock.calls[0]?.[1] as any).body);
    const userMessage = body.messages[body.messages.length - 1];
    expect(userMessage.role).toBe('user');
    expect(userMessage.content).toContain('STATE_CONTEXT');
    expect(userMessage.content).toContain('"tool": "load_runtime_topology"');
  });

  it('prefetches mission state for mission progress queries using generic mission ids', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: { content: 'Mission overview ready.' },
      }),
    });
    globalThis.fetch = fetchMock as any;
    process.env.OLLAMA_BASE_URL = 'http://127.0.0.1:11434';
    withExecutionContext('software_developer', () => {
      safeWriteFile('active/missions/public/RUNTIME-SUPERVISOR-HARDENING/mission-state.json', JSON.stringify({
        mission_id: 'RUNTIME-SUPERVISOR-HARDENING',
        status: 'active',
        tier: 'public',
        mission_type: 'governance',
      }, null, 2));
      safeWriteFile('active/missions/public/RUNTIME-SUPERVISOR-HARDENING/TASK_BOARD.md', [
        '# Task Board',
        '',
        '## Status: In Progress',
        '- [x] Step 1',
        '- [ ] Step 2',
      ].join('\n'));
      safeWriteFile('active/missions/public/RUNTIME-SUPERVISOR-HARDENING/NEXT_TASKS.json', JSON.stringify([
        { status: 'planned' },
      ], null, 2));
    }, 'ecosystem_architect');

    const adapter = new OpenAICompatibleAdapter({
      provider: 'ollama',
      model: 'llama3.1:8b',
    });

    const response = await adapter.ask('What is the current mission progress for RUNTIME-SUPERVISOR-HARDENING?');
    expect(response.text).toBe('Mission overview ready.');
    const body = JSON.parse((fetchMock.mock.calls[0]?.[1] as any).body);
    const userMessage = body.messages[body.messages.length - 1];
    expect(userMessage.content).toContain('STATE_CONTEXT');
    expect(userMessage.content).toContain('"tool": "load_mission_overview"');
    expect(userMessage.content).toContain('"mission_id": "RUNTIME-SUPERVISOR-HARDENING"');
  });
});
