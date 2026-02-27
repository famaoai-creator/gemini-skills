export function calculatePercentile(sorted: number[], percentile: number): number {
  if (sorted.length === 0) return 0;
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function classifyMetric(name: string, unit: string): string {
  const n = name.toLowerCase();
  const u = unit.toLowerCase();
  if (u === 'ms' || n.includes('latency')) return 'responseTime';
  if (u === 'mb' || n.includes('memory')) return 'memory';
  return 'other';
}
