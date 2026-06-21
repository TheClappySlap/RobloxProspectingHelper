// ---------------------------------------------------------------------------
// metrics.js — output metrics (cycle time, rolls/s) for a build's total stats.
//
// The actual model lives in throughputMath.js (single source of truth, used by
// the optimizer and the Math validator too). This file just maps a build's
// engine totals into that model's inputs.
// ---------------------------------------------------------------------------

import { computeBuild } from './engine.js';
import { computeThroughput, shakesPerSecond } from './throughputMath.js';

// Re-exported so existing importers (optimizer) keep working unchanged.
export { shakesPerSecond };

/**
 * @param {Object} totals  engine totals (stat -> value)
 * @param {'autopan'|'sand'} method
 * @param {Object} [opts]  forwarded to computeThroughput (e.g. { nOverride })
 * @returns throughput result incl. `breakdown`
 */
export function throughput(totals, method = 'autopan', opts = {}) {
  return computeThroughput({
    luck: totals['Luck'] || 0,
    capacity: totals['Capacity'] || 0,
    shakeSpeed: totals['Shake Speed'] || 0,
    shakeStrength: totals['Shake Strength'] || 0,
    digSpeed: totals['Dig Speed'] || 0,
    digStrength: totals['Dig Strength'] || 0,
  }, method, opts);
}

/** Convenience: compute stats + throughput for a build in one call. */
export function buildMetrics(build, activeBuffs = {}, museum = {}, method = 'autopan') {
  const res = computeBuild(build, activeBuffs, museum);
  return { ...throughput(res.total, method), totals: res.total, res };
}
