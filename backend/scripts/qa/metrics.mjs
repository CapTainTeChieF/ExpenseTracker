/** Pure helpers: benchmark reporting. This module has zero side effects. */
export function percentile(values, p) {
  if (!Array.isArray(values) || values.length === 0) throw new Error('Samples required');
  if (p < 0 || p > 100) throw new Error('Percentile must be 0..100');
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil((p / 100) * sorted.length) - 1 < 0 ? 0 : Math.ceil((p / 100) * sorted.length) - 1];
}
export function summarize(values) {
  return {
    samples: values.length,
    p50ms: Number(percentile(values, 50).toFixed(1)),
    p95ms: Number(percentile(values, 95).toFixed(1)),
    maxMs: Number(Math.max(...values).toFixed(1)),
  };
}
export function assertQaDatabaseUrl(connectionString) {
  if (!connectionString) throw new Error('QA DATABASE_URL missing');
  const u = new URL(connectionString);
  const host = u.hostname;
  if (!['localhost', '127.0.0.1', '::1', '[::1]'].includes(host) ||
      u.port !== '5434' || u.pathname !== '/expense_tracker_qa' ||
      decodeURIComponent(u.username) !== 'expense_qa') {
    throw new Error('Safety guard: refusing non-local or non-QA PostgreSQL database');
  }
}
