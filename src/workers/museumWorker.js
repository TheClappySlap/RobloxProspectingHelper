// ---------------------------------------------------------------------------
// museumWorker.js — Web Worker: museum optimization pipeline.
//
// NEW 2-phase approach (fixes the "zero museum bias" problem from Phase 1
// gear sweep using static multiplier assumptions):
//
//   Phase 2a (coarse) — runs bruteForceMuseum at step=0.5 for ALL N gear
//     combos from the top-1000 gear sweep. With 6 stats and budget=12 @ 0.5×
//     step, each gear takes ~5k states (vs 8.2M at 0.1×). All 1000 take ~5M
//     evals total — under 0.5s in the worker. Re-ranks gears using a museum
//     tailored to each combo, eliminating the "need weird museum to hit a
//     breakpoint" failure mode.
//
//   Phase 2b (fine)  — for the top-10 umbrella + top-10 non-umbrella from
//     Phase 2a, runs pairwise coordinate descent (0.1× steps) starting from
//     the coarse optimum. Converges in tens of iterations.
//
// Protocol:
//   receive:  { gears:[{bf,M,FM,hasSummit,hasUmbrella},...], museumBudget, museumCap }
//   emit:     { type:'progress', phase:1|2, pct:0-100, evals, bestRPS }
//   emit:     { type:'done', results:[{gearIdx,museum:[8],rps,hasUmbrella},...], totalEvals }
//
// Stat indices (must match REL in optimizer.js):
//   0:Luck  1:Capacity  2:ShakeSpeed  3:ShakeStrength
//   4:DigSpeed  5:DigStrength  6:ModBoost  7:WalkSpeed (no museum)
// ---------------------------------------------------------------------------

import { shakesPerSecond } from '../core/throughputMath.js';

const I_LUCK=0, I_CAP=1, I_SS=2, I_SSTR=3, I_DS=4, I_DSTR=5, I_MB=6, I_WS=7;

function evalRPS(bf, M, FM, hasSummit, hasUmbrella, mus) {
  const mEff = (i) => (M[i] + (i < 7 ? mus[i] : 0)) * FM[i];

  let ssBonus = 0;
  if (hasSummit) {
    const ws = bf[I_WS] * mEff(I_WS);
    ssBonus = 0.05 * Math.max(0, ws - 3);
  }

  let addLuck = 0;
  if (hasUmbrella) {
    const cap = bf[I_CAP] * mEff(I_CAP);
    const mob = bf[I_MB] * mEff(I_MB);
    const modPct = (5 + 5 * (mob / 100) - mob / 380) / 100;
    addLuck = 25 * Math.sqrt(Math.max(0, cap)) * modPct;
  }

  const L  = (bf[I_LUCK] + addLuck) * mEff(I_LUCK);
  const C  = bf[I_CAP]  * mEff(I_CAP);
  const SS = bf[I_SS]   * (mEff(I_SS)   + ssBonus);
  const DS = bf[I_DS]   * (mEff(I_DS)   + ssBonus);
  if (C <= 0 || SS <= 0 || DS <= 0) return 0;

  const rpp = Math.floor(L * Math.sqrt(C));
  if (rpp <= 0) return 0;

  const sStr = Math.max(1, bf[I_SSTR] * mEff(I_SSTR));
  const dStr = Math.max(1, bf[I_DSTR] * mEff(I_DSTR));
  const r = shakesPerSecond(SS);
  const shakeTime = Math.ceil(C / sStr) / r;
  const digTime   = 190 * Math.ceil(C / dStr) / Math.max(0.0001, DS);
  const cycle = shakeTime + 1.5 + digTime;
  return cycle > 0 ? rpp / cycle : 0;
}

/**
 * Enumerate all museum allocations at a given step size.
 *
 * step=0.5 → BUDGET=12, CAP=7, ~5k states per gear (1000× faster than 0.1×).
 * step=0.1 → BUDGET=60, CAP=35, ~8.2M states (exact fine brute force).
 *
 * Always fully spends the budget (Σ = budget) since more museum is ≥ as good.
 */
function bruteForceMuseum(bf, M, FM, hasSummit, hasUmbrella, museumBudget, museumCap, step) {
  const BUDGET = Math.round(museumBudget / step);
  const CAP    = Math.round(museumCap    / step);
  const mus = new Float64Array(8);
  let bestRPS = -Infinity;
  const bestMus = new Float64Array(8);
  let evals = 0;

  if (!hasUmbrella) {
    for (let n0 = 0; n0 <= Math.min(CAP, BUDGET); n0++) {
      const r1 = BUDGET - n0;
      for (let n1 = 0; n1 <= Math.min(CAP, r1); n1++) {
        const r2 = r1 - n1;
        for (let n2 = 0; n2 <= Math.min(CAP, r2); n2++) {
          const r3 = r2 - n2;
          for (let n3 = 0; n3 <= Math.min(CAP, r3); n3++) {
            const r4 = r3 - n3;
            for (let n4 = 0; n4 <= Math.min(CAP, r4); n4++) {
              const n5 = r4 - n4;
              if (n5 > CAP) continue;
              mus[0]=n0*step; mus[1]=n1*step; mus[2]=n2*step;
              mus[3]=n3*step; mus[4]=n4*step; mus[5]=n5*step; mus[6]=0;
              const rps = evalRPS(bf, M, FM, hasSummit, hasUmbrella, mus);
              if (rps > bestRPS) { bestRPS = rps; bestMus.set(mus); }
              evals++;
            }
          }
        }
      }
    }
  } else {
    for (let n0 = 0; n0 <= Math.min(CAP, BUDGET); n0++) {
      const r1 = BUDGET - n0;
      for (let n1 = 0; n1 <= Math.min(CAP, r1); n1++) {
        const r2 = r1 - n1;
        for (let n2 = 0; n2 <= Math.min(CAP, r2); n2++) {
          const r3 = r2 - n2;
          for (let n3 = 0; n3 <= Math.min(CAP, r3); n3++) {
            const r4 = r3 - n3;
            for (let n4 = 0; n4 <= Math.min(CAP, r4); n4++) {
              const r5 = r4 - n4;
              for (let n5 = 0; n5 <= Math.min(CAP, r5); n5++) {
                const n6 = r5 - n5;
                if (n6 > CAP) continue;
                mus[0]=n0*step; mus[1]=n1*step; mus[2]=n2*step;
                mus[3]=n3*step; mus[4]=n4*step; mus[5]=n5*step; mus[6]=n6*step;
                const rps = evalRPS(bf, M, FM, hasSummit, hasUmbrella, mus);
                if (rps > bestRPS) { bestRPS = rps; bestMus.set(mus); }
                evals++;
              }
            }
          }
        }
      }
    }
  }

  return { museum: bestMus, rps: bestRPS, evals };
}

/**
 * Pairwise coordinate descent (0.1× fine steps) from a starting museum.
 * Typically only needs a few iterations when starting from the 0.5× coarse optimum.
 */
function coordinateDescent(bf, M, FM, hasSummit, hasUmbrella, startMus, cap, maxIter = 600) {
  const mus = Float64Array.from(startMus);
  let cur = evalRPS(bf, M, FM, hasSummit, hasUmbrella, mus);
  const eligible = hasUmbrella ? [0, 1, 2, 3, 4, 5, 6] : [0, 1, 2, 3, 4, 5];
  const STEP = 0.1;

  for (let iter = 0; iter < maxIter; iter++) {
    let improved = false;
    for (const i of eligible) {
      for (const j of eligible) {
        if (i === j) continue;
        if (mus[j] < STEP - 1e-9) continue;
        if (mus[i] >= cap - 1e-9) continue;
        const pi = mus[i], pj = mus[j];
        mus[i] = Math.round((pi + STEP) * 10) / 10;
        mus[j] = Math.round((pj - STEP) * 10) / 10;
        const rps = evalRPS(bf, M, FM, hasSummit, hasUmbrella, mus);
        if (rps > cur) { cur = rps; improved = true; }
        else { mus[i] = pi; mus[j] = pj; }
      }
    }
    if (!improved) break;
  }
  return { museum: mus, rps: cur };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

self.onmessage = (e) => {
  const { gears, museumBudget, museumCap } = e.data;
  const N = gears.length;
  let totalEvals = 0;
  let bestCoarseRPS = 0;

  // --- Phase 2a: Coarse museum for all N gear combos (step = 0.5) -----------
  // ~5k states per non-umbrella gear → 5M total for N=1000. Fast in worker.
  const coarseResults = [];
  for (let i = 0; i < N; i++) {
    const g = gears[i];
    const { museum, rps, evals } = bruteForceMuseum(
      g.bf, g.M, g.FM, g.hasSummit, g.hasUmbrella,
      museumBudget, museumCap, 0.5
    );
    coarseResults.push({ gearIdx: i, museum, rps, hasUmbrella: g.hasUmbrella });
    totalEvals += evals;
    if (rps > bestCoarseRPS) bestCoarseRPS = rps;

    if (i % 100 === 0 || i === N - 1) {
      const pct = Math.round(((i + 1) / N) * 70);
      self.postMessage({ type: 'progress', phase: 1, pct, evals: totalEvals, bestRPS: bestCoarseRPS });
    }
  }

  // Re-rank by coarse RPS. Pick top-10 per category for fine refinement.
  const umbrella    = coarseResults.filter(r =>  r.hasUmbrella).sort((a, b) => b.rps - a.rps).slice(0, 10);
  const nonUmbrella = coarseResults.filter(r => !r.hasUmbrella).sort((a, b) => b.rps - a.rps).slice(0, 10);
  const top20 = [...umbrella, ...nonUmbrella];

  self.postMessage({ type: 'progress', phase: 2, pct: 70, evals: totalEvals, bestRPS: bestCoarseRPS });

  // --- Phase 2b: Fine coordinate descent for top-20 from coarse optimum -----
  const fineResults = [];
  for (let i = 0; i < top20.length; i++) {
    const cr = top20[i];
    const g  = gears[cr.gearIdx];
    const { museum, rps } = coordinateDescent(
      g.bf, g.M, g.FM, g.hasSummit, g.hasUmbrella,
      cr.museum, museumCap, 600
    );
    fineResults.push({ gearIdx: cr.gearIdx, museum: Array.from(museum), rps, hasUmbrella: cr.hasUmbrella });

    const pct = 70 + Math.round(((i + 1) / top20.length) * 30);
    self.postMessage({ type: 'progress', phase: 2, pct, evals: totalEvals, bestRPS: rps });
  }

  fineResults.sort((a, b) => b.rps - a.rps);
  self.postMessage({ type: 'done', results: fineResults, totalEvals });
};
