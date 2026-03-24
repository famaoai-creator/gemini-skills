import { logger } from './core.js';
import { discoverProviderAvailability, listBuiltinProviderDefinitions } from './provider-catalog.js';

/**
 * Provider Discovery v1.0
 *
 * Detects which LLM agent providers are installed and available.
 * Results are cached to avoid repeated shell calls.
 */

export interface ProviderInfo {
  provider: string;
  installed: boolean;
  version: string | null;
  protocol: 'acp' | 'print-json' | 'exec' | 'json-rpc' | 'openai-compatible';
  models: string[];
  healthy: boolean;
}

let cachedProviders: ProviderInfo[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 300000; // 5 min

/**
 * Discover all available providers. Cached for 5 minutes.
 */
export function discoverProviders(forceRefresh = false): ProviderInfo[] {
  if (!forceRefresh && cachedProviders && (Date.now() - cacheTimestamp) < CACHE_TTL) {
    return cachedProviders;
  }

  logger.info('[PROVIDER_DISCOVERY] Scanning available providers...');
  const providers = listBuiltinProviderDefinitions().map((definition) => {
    const availability = discoverProviderAvailability(definition);
    return {
      provider: definition.provider,
      installed: availability.installed,
      version: availability.version,
      protocol: definition.transport,
      models: [...definition.suggestedModels],
      healthy: availability.healthy,
    } satisfies ProviderInfo;
  });

  const available = providers.filter(p => p.installed);
  logger.info(`[PROVIDER_DISCOVERY] Found ${available.length}/${providers.length}: ${available.map(p => p.provider).join(', ')}`);

  cachedProviders = providers;
  cacheTimestamp = Date.now();
  return providers;
}

/**
 * Get only installed providers.
 */
export function getAvailableProviders(): ProviderInfo[] {
  return discoverProviders().filter(p => p.installed);
}
