// ---------------------------------------------------------------------------
// throughputMath.js — the single source of truth for the Rolls/sec model.
//
// This is the ONLY place the cycle/throughput formula lives. metrics.throughput()
// is a thin adapter over it, the optimizer scores against it, and the Math
// validator tab drives it directly. It returns both the numbers AND a
// step-by-step `breakdown` so every surface can show exactly how a result was
// derived (and the user can validate the math).
//
// Stat units: Shake Speed / Dig Speed are PERCENT values (100 = ×1), fed to the
// formula as-is. Luck / Capacity / strengths are flat.
//
// Model (autopan):
//   rollsPerPan      = floor(Luck × √Capacity)
//   shakesPerSec (r) = interp(empirical Shake-Speed table)   [non-smooth: tick breakpoints]
//   shakesToFill     = ceil(Capacity / Shake Strength)
//   shakingTime      = shakesToFill / r
//   n (digs to max)  = ceil(Capacity / Dig Strength)        [or a manual override]
//   diggingTime      = 190 × n / Dig Speed                  [sand: 190 × (n−1) / …]
//   overhead         = 1.5 (autopan) | 0.75 (sand)
//   cycle            = shakingTime + overhead + diggingTime
//   rollsPerSec      = rollsPerPan / cycle
// ---------------------------------------------------------------------------

// Empirical Shake Speed % → shakes/sec, MEASURED in-game (user-provided). The
// game's server-tick breakpoints make this non-smooth and non-monotonic, so we
// interpolate the measured table directly rather than fit a smooth curve.
// X is sorted ascending; Y is the measured shakes/sec at each X.
const SHAKE_X = [304, 353, 399, 449, 501, 554, 600, 650, 700, 752, 804, 847, 901, 952, 999, 1046, 1104, 1148, 1203, 1249, 1303, 1346, 1397, 1449, 1498, 1553, 1597, 1650, 1702, 1751, 1803, 1849, 1899, 1951, 2000];
const SHAKE_Y = [6.43776824, 5.244755245, 5.752636625, 8.462623413, 7.067137809, 6.802721088, 9.360374415, 9.009009009, 7.761966365, 8.287292818, 7.947019868, 8.053691275, 10.657193606, 11.152416357, 10.733452594, 10, 9.493670886, 9.433962264, 10.23890785, 10.221465077, 9.868421053, 10.204081633, 10.291595197, 10.23890785, 10.434782609, 10.050251256, 10.327022375, 10.526315789, 10.676156584, 12.631578947, 12.345679012, 12.422360248, 12.875536481, 12.195121951, 12.345679012];

/**
 * The bracket used to interpolate shakes/sec at a Shake Speed %, exposed so the
 * math breakdown can show exactly which measured points a value sits between.
 */
export function shakeBracket(shakeSpeedPct) {
  const x = Math.max(0, Number(shakeSpeedPct) || 0);
  const n = SHAKE_X.length;
  if (x <= SHAKE_X[0]) return { below: true, hiX: SHAKE_X[0], hiY: SHAKE_Y[0] };
  if (x >= SHAKE_X[n - 1]) return { above: true, loX: SHAKE_X[n - 1], loY: SHAKE_Y[n - 1] };
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (SHAKE_X[mid] <= x) lo = mid; else hi = mid; }
  return { loX: SHAKE_X[lo], loY: SHAKE_Y[lo], hiX: SHAKE_X[hi], hiY: SHAKE_Y[hi] };
}

/**
 * Shakes per second at a given Shake Speed %, via linear interpolation of the
 * measured table. Below the lowest measured point (304%) it ramps linearly from
 * the origin; above the highest (2000%) it clamps to the last value.
 */
export function shakesPerSecond(shakeSpeedPct) {
  const x = Math.max(0, Number(shakeSpeedPct) || 0);
  const b = shakeBracket(x);
  let y;
  if (b.below) y = b.hiY * (x / b.hiX);          // ramp 0 → first measured point
  else if (b.above) y = b.loY;                   // clamp above the measured range
  else y = b.loY + (b.hiY - b.loY) * ((x - b.loX) / (b.hiX - b.loX));
  return Math.max(0.0001, y);
}

const fin = x => { const v = Number(x); return Number.isFinite(v) ? v : 0; };
/** Format a number for the breakdown's expression strings. */
const nf = (x, dp = 2) => Number(x).toLocaleString(undefined, { maximumFractionDigits: dp });

/**
 * @param {Object} inputs  { luck, capacity, shakeSpeed, shakeStrength, digSpeed, digStrength }
 * @param {'autopan'|'sand'} method
 * @param {Object} [opts]  { nOverride } — bypass ceil(Capacity/Dig Strength) with a direct n
 * @returns full throughput result + `breakdown` { method, inputs, steps, stopped? }
 */
export function computeThroughput(inputs, method = 'autopan', opts = {}) {
  const luck = Math.max(0, fin(inputs.luck));
  const capacity = fin(inputs.capacity);
  const shakeSpeed = fin(inputs.shakeSpeed);
  const shakeStrength = Math.max(1, fin(inputs.shakeStrength));
  const digSpeed = fin(inputs.digSpeed);
  const digStrength = Math.max(1, fin(inputs.digStrength));
  const overhead = method === 'sand' ? 0.75 : 1.5;

  const steps = [];
  const stop = (msg) => ({
    rollsPerPan: 0, cycleSeconds: 0, pansPerMin: 0, rollsPerSec: 0, shakesPerSec: 0,
    totalShakes: 0, digsToMax: 0, times: null,
    breakdown: { method, inputs: { luck, capacity, shakeSpeed, shakeStrength, digSpeed, digStrength }, steps, stopped: msg },
  });

  if (capacity <= 0 || shakeSpeed <= 0 || digSpeed <= 0)
    return stop('Capacity, Shake Speed and Dig Speed must each be greater than 0.');

  const sqrtCap = Math.sqrt(capacity);
  const rollsPerPan = Math.floor(luck * sqrtCap);
  steps.push({ key: 'rollsPerPan', kind: 'rolls', label: 'Rolls per pan',
    expr: `⌊ Luck × √Capacity ⌋ = ⌊ ${nf(luck)} × ${nf(sqrtCap, 3)} ⌋ = ⌊ ${nf(luck * sqrtCap)} ⌋`, value: rollsPerPan });
  if (rollsPerPan <= 0) return stop('Rolls per pan rounded down to 0 — need more Luck × √Capacity.');

  const r = shakesPerSecond(shakeSpeed);
  const br = shakeBracket(shakeSpeed);
  let shakeExpr, shakeNote;
  if (br.below) {
    shakeExpr = `below table — ramp 0 → (${br.hiX}%, ${nf(br.hiY, 3)}/s),  S = ${nf(shakeSpeed)}`;
    shakeNote = `Shake Speed is below the lowest measured point (${br.hiX}%).`;
  } else if (br.above) {
    shakeExpr = `at/above table top — clamped to ${nf(br.loY, 3)}/s  (S = ${nf(shakeSpeed)} ≥ ${br.loX}%)`;
    shakeNote = `Shake Speed is at/above the highest measured point (${br.loX}%).`;
  } else {
    shakeExpr = `interp (${br.loX}%, ${nf(br.loY, 3)}) → (${br.hiX}%, ${nf(br.hiY, 3)}),  S = ${nf(shakeSpeed)}`;
    shakeNote = `Empirical in-game tick table (non-smooth at server breakpoints), linearly interpolated.`;
  }
  steps.push({ key: 'shakesPerSec', kind: 'shake', label: 'Shakes / sec', value: r, unit: '/s', expr: shakeExpr, note: shakeNote });

  const totalShakes = Math.ceil(capacity / shakeStrength);
  steps.push({ key: 'totalShakes', kind: 'shake', label: 'Shakes to fill',
    expr: `⌈ Capacity / Shake Strength ⌉ = ⌈ ${nf(capacity)} / ${nf(shakeStrength)} ⌉`, value: totalShakes });

  const shakingDuration = totalShakes / r;
  steps.push({ key: 'shaking', kind: 'shake', label: 'Shaking time', unit: 's',
    expr: `Shakes ÷ Shakes/sec = ${nf(totalShakes)} ÷ ${nf(r, 4)}`, value: shakingDuration });

  const nDerived = Math.ceil(capacity / digStrength);
  const useOverride = opts.nOverride != null && opts.nOverride !== '' && Number.isFinite(Number(opts.nOverride));
  const n = useOverride ? Math.max(0, Math.floor(Number(opts.nOverride))) : nDerived;
  steps.push({ key: 'digsToMax', kind: 'dig', label: 'Digs to max (n)', value: n,
    expr: useOverride ? `manual input` : `⌈ Capacity / Dig Strength ⌉ = ⌈ ${nf(capacity)} / ${nf(digStrength)} ⌉`,
    note: useOverride ? `formula would give ⌈ ${nf(capacity)} / ${nf(digStrength)} ⌉ = ${nf(nDerived)}` : undefined });

  const d = Math.max(0.0001, digSpeed);
  const effN = method === 'sand' ? Math.max(0, n - 1) : n;
  const digTime = 190 * effN / d;
  steps.push({ key: 'digging', kind: 'dig', label: 'Digging time', unit: 's', value: digTime,
    expr: method === 'sand'
      ? `190 × (n−1) ÷ Dig Speed = 190 × ${nf(effN)} ÷ ${nf(digSpeed)}`
      : `190 × n ÷ Dig Speed = 190 × ${nf(n)} ÷ ${nf(digSpeed)}` });

  steps.push({ key: 'overhead', kind: 'cycle', label: 'Overhead', unit: 's', value: overhead,
    expr: `${method === 'sand' ? 'sand' : 'autopan'} constant` });

  const cycleSeconds = shakingDuration + overhead + digTime;
  steps.push({ key: 'cycle', kind: 'cycle', label: 'Cycle time', unit: 's', value: cycleSeconds,
    expr: `Shaking + Overhead + Digging = ${nf(shakingDuration, 3)} + ${nf(overhead)} + ${nf(digTime, 3)}` });
  if (cycleSeconds <= 0) return stop('Cycle time is 0.');

  const rollsPerSec = rollsPerPan / cycleSeconds;
  steps.push({ key: 'rollsPerSec', kind: 'result', label: 'Rolls / sec', value: rollsPerSec,
    expr: `Rolls per pan ÷ Cycle = ${nf(rollsPerPan)} ÷ ${nf(cycleSeconds, 3)}` });

  const pansPerMin = 60 / cycleSeconds;
  steps.push({ key: 'pansPerMin', kind: 'result', label: 'Pans / min', value: pansPerMin,
    expr: `60 ÷ Cycle = 60 ÷ ${nf(cycleSeconds, 3)}` });

  return {
    rollsPerPan, cycleSeconds, pansPerMin, rollsPerSec, shakesPerSec: r, totalShakes,
    digsToMax: n, times: { shake: shakingDuration, overhead, dig: digTime },
    breakdown: {
      method,
      inputs: { luck, capacity, shakeSpeed, shakeStrength, digSpeed, digStrength, nOverride: useOverride ? n : null },
      steps,
    },
  };
}
