import { spawnSync } from 'node:child_process';
import { pathResolver } from './path-resolver.js';
import { safeReadFile } from './secure-io.js';

export type ProviderTransport = 'acp' | 'print-json' | 'exec' | 'json-rpc' | 'openai-compatible';

export interface ProviderDefinition {
  provider: string;
  transport: ProviderTransport;
  defaultModel: string;
  bootCommand?: string;
  bootArgs?: string[];
  discovery: {
    kind: 'command' | 'env';
    command?: string;
    versionArgs?: string[];
    envVar?: string;
  };
  suggestedModels: string[];
}

export interface ProviderAvailability {
  installed: boolean;
  version: string | null;
  healthy: boolean;
}

interface ProviderCatalogDocument {
  version: string;
  providers: Record<string, Omit<ProviderDefinition, 'provider'>>;
}

const PROVIDER_CATALOG_PATH = pathResolver.knowledge('public/orchestration/provider-catalog.json');

let cachedCatalog: ProviderDefinition[] | null = null;

function cloneDefinition(definition: ProviderDefinition): ProviderDefinition {
  return {
    ...definition,
    bootArgs: definition.bootArgs ? [...definition.bootArgs] : undefined,
    discovery: { ...definition.discovery, versionArgs: definition.discovery.versionArgs ? [...definition.discovery.versionArgs] : undefined },
    suggestedModels: [...definition.suggestedModels],
  };
}

function loadCatalog(): ProviderDefinition[] {
  if (cachedCatalog) {
    return cachedCatalog.map(cloneDefinition);
  }

  const parsed = JSON.parse(safeReadFile(PROVIDER_CATALOG_PATH, { encoding: 'utf8' }) as string) as ProviderCatalogDocument;
  cachedCatalog = Object.entries(parsed.providers).map(([provider, definition]) => ({
    provider,
    ...definition,
  }));
  return cachedCatalog.map(cloneDefinition);
}

function run(cmd: string, args: string[], timeoutMs = 10000): { ok: boolean; stdout: string } {
  try {
    const res = spawnSync(cmd, args, {
      encoding: 'utf8',
      timeout: timeoutMs,
      env: process.env,
      shell: false,
    });
    return { ok: res.status === 0, stdout: (res.stdout || '').trim() };
  } catch {
    return { ok: false, stdout: '' };
  }
}

export function listBuiltinProviderDefinitions(): ProviderDefinition[] {
  return loadCatalog();
}

export function getProviderDefinition(provider: string): ProviderDefinition | null {
  const match = loadCatalog().find((definition) => definition.provider === provider);
  return match ? cloneDefinition(match) : null;
}

export function discoverProviderAvailability(definition: ProviderDefinition): ProviderAvailability {
  if (definition.discovery.kind === 'env') {
    const installed = Boolean(definition.discovery.envVar && process.env[definition.discovery.envVar]);
    return {
      installed,
      version: installed ? 'configured' : null,
      healthy: installed,
    };
  }

  const command = definition.discovery.command;
  if (!command) {
    return { installed: false, version: null, healthy: false };
  }
  const versionArgs = definition.discovery.versionArgs || ['--version'];
  const result = run(command, versionArgs, 15000);
  return {
    installed: result.ok,
    version: result.ok ? (result.stdout || null) : null,
    healthy: result.ok,
  };
}

export function listSupportedProviderIds(): string[] {
  return loadCatalog().map((definition) => definition.provider);
}
