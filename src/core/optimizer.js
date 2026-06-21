// ---------------------------------------------------------------------------
// optimizer.js — Auto-Optimizer (JS-native, runs entirely in the browser).
//
// Finds the best accessory loadout (Necklace + Charm + N Rings), rune set
// (5 runes from a pruned candidate pool), and pan enchant that maximises
// Rolls/sec, scored through the SAME engine the UI uses (computeBuild +
// throughput), so every number a result card shows is identical to what the
// planner displays once applied. Shovel stays fixed (user picks tool type).
// Museum is optimized per build (idealized budget).
//
// Why an additive fast search is EXACT: accessories only ever add FLAT stats in
// the engine (never multipliers), so with the rest of the kit fixed the
// multiplier pile is CONSTANT across candidates. We precompute that fixed
// context once, then sum per-accessory flat vectors. The two accessory-dependent
// nonlinearities (Beach Umbrella flat-luck, Summit Seeker speed bonus) are
// replicated exactly in the fast scorer; finalists are re-scored through the
// real engine.
// ---------------------------------------------------------------------------

import { SLOTS, isUniqueEquip } from './config.js';
import { getItems, getItem } from './db.js';
import { emptySlot } from './store.js';
import { computeBuild, rolledAccessoryStats } from './engine.js';
import { throughput, shakesPerSecond } from './metrics.js';

const REL = ['Luck', 'Capacity', 'Shake Speed', 'Shake Strength', 'Dig Speed', 'Dig Strength', 'Modifier Boost', 'Walk Speed'];
const REL_IDX = Object.fromEntries(REL.map((k, i) => [k, i]));
const I_LUCK = 0, I_CAP = 1, I_SS = 2, I_SSTR = 3, I_DS = 4, I_DSTR = 5, I_MB = 6, I_WS = 7;
const ZERO_VEC = new Float64Array(REL.length);
const DEFAULT_CFG = { starTier: 6, rollPct: 100, mutation: '', statRolls: {}, enchant: '' };

export const OPTIMIZER_REL_STATS = REL;

// Candidate rune pool for Rolls/sec objective — C(8,5) = 56 combos.
export const RUNE_CANDIDATE_IDS = [
  'rune-summit-seeker',
  'rune-mountain-climber',
  'rune-speed-1',
  'rune-purity',
  'rune-solitude',
  'rune-sunblessed',
  'rune-abyssal',
  'rune-eternity',
];

// Stats relevant to Rolls/sec for pan enchant filtering.
const ENCHANT_RELEVANT_STATS = new Set(['Luck', 'Walk Speed', 'Dig Speed', 'Shake Speed', 'Dig Strength', 'Capacity']);

/** Per-accessory flat contribution over REL stats, at the assumed config. */
function flatVec(item, cfg) {
  const v = new Float64Array(REL.length);
  rolledAccessoryStats(item, cfg).forEach(l => {
    if (l.note) return;
    const i = REL_IDX[l.name];
    if (i !== undefined) v[i] += l.value;
  });
  return v;
}

const EMPTY_CAND = () => ({ id: '', name: '— empty —', rarity: '', ascended: false, unique: false, vec: new Float64Array(REL.length) });

/** All candidates for a category, including an explicit "leave empty" option. */
function candidates(cat, cfg) {
  const out = [EMPTY_CAND()];
  for (const item of getItems(cat) || []) {
    const rarity = (item.rarity || '').toLowerCase();
    out.push({ id: item.id, name: item.name, rarity, ascended: rarity === 'ascended', unique: isUniqueEquip(item), vec: flatVec(item, cfg) });
  }
  return out;
}

function vecEqual(a, b) { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; }

// Rolls/sec is monotone-increasing in every REL stat EXCEPT Capacity and the
// speed stats. Dig Speed and Shake Speed are non-monotone due to the
// shakesPerSecond step function. Skip domination checks in those dimensions
// to preserve candidates that might cross a step-function threshold.
const NON_MONOTONE = new Set([I_DS, I_SS]);

function dominatesDir(a, b, capDir) {
  let strict = false;
  for (let i = 0; i < a.length; i++) {
    if (NON_MONOTONE.has(i)) continue;
    const av = i === I_CAP ? capDir * a[i] : a[i];
    const bv = i === I_CAP ? capDir * b[i] : b[i];
    if (av < bv) return false;
    if (av > bv) strict = true;
  }
  return strict;
}
function paretoPrune(cands) {
  const uniq = [];
  for (const c of cands) if (!uniq.some(u => vecEqual(u.vec, c.vec))) uniq.push(c);
  return uniq.filter((c, i) =>
    !uniq.some((o, j) => j !== i && dominatesDir(o.vec, c.vec, 1)) ||
    !uniq.some((o, j) => j !== i && dominatesDir(o.vec, c.vec, -1)));
}

/**
 * Ring multisets (combinations with replacement), enforcing equip-once.
 * Stores actual candidate objects (not indices) so entries are self-contained.
 */
function ringMultisets(pool, slots, allowUniqueDup) {
  const out = [];
  const chosen = new Array(slots);
  const recur = (start, depth, sum, asc) => {
    if (depth === slots) {
      out.push({ sum: sum.slice(), asc, rings: chosen.slice() });
      return;
    }
    for (let i = start; i < pool.length; i++) {
      const c = pool[i];
      if (!allowUniqueDup && c.unique && depth > 0 && chosen[depth - 1] === c) continue;
      chosen[depth] = c;
      for (let k = 0; k < sum.length; k++) sum[k] += c.vec[k];
      recur(i, depth + 1, sum, asc + (c.ascended ? 1 : 0));
      for (let k = 0; k < sum.length; k++) sum[k] -= c.vec[k];
    }
  };
  recur(0, 0, new Float64Array(REL.length), 0);
  return out;
}

function chooseN(n, k) { let r = 1; for (let i = 0; i < k; i++) r = r * (n + i) / (i + 1); return r; }

// --- Rune combo enumeration --------------------------------------------------

/** Build all C(n,5) 5-rune combinations from the candidate pool (no repeats). */
function runeCombosSafely(candidateIds) {
  const items = candidateIds.map(id => getItem('runes', id)).filter(Boolean);
  const k = 5; // NUM_RUNES
  const combos = [];
  const choose = (start, chosen) => {
    if (chosen.length === k) { combos.push([...chosen]); return; }
    for (let i = start; i < items.length; i++) {
      chosen.push(items[i]);
      choose(i + 1, chosen);
    }
  };
  choose(0, []);
  return combos;
}

/** The rune slot keys in order. */
const RUNE_SLOT_KEYS = SLOTS.filter(s => s.group === 'runes').map(s => s.key);

/** Apply a rune combo to a build copy (mutates). */
function applyRunesToBuild(build, runeCombo) {
  RUNE_SLOT_KEYS.forEach((key, i) => {
    build[key] = (i < runeCombo.length) ? { ...emptySlot(), itemId: runeCombo[i].id } : emptySlot();
  });
  return build;
}

// --- Pan enchant helpers -----------------------------------------------------

/** Get all pan enchants from DB. Real enchants use the effects[] format (not toolStats),
 *  so we include every Pan enchant and let the engine score decide relevance. */
function getPanEnchantCandidates() {
  const enchants = getItems('enchants') || [];
  return enchants.filter(e => e.appliesTo === 'Pan' || !e.appliesTo);
}

// --- Context helpers ---------------------------------------------------------

/** Build a context with accessories cleared, rune combo and enchant applied. */
function buildContext(contextBuild, runeCombo, enchantId, optNeck, optCharm, optRingSlots) {
  const ctx = JSON.parse(JSON.stringify(contextBuild));
  if (optNeck) ctx.necklace = emptySlot();
  if (optCharm) ctx.charm = emptySlot();
  optRingSlots.forEach(k => { ctx[k] = emptySlot(); });
  if (runeCombo) applyRunesToBuild(ctx, runeCombo);
  if (ctx.pan) ctx.pan = { ...ctx.pan, enchant: enchantId || '' };
  if (ctx.shovel) ctx.shovel = { ...ctx.shovel, enchant: 'mastered' };
  return ctx;
}

/** Extract B, F, M, FM from a computeBuild result for the relevant stats. */
function extractVectors(fixed) {
  return {
    B: REL.map(k => fixed.base[k] || 0),
    F: REL.map(k => fixed.flat[k] || 0),
    M: REL.map(k => fixed.mult[k] || 1),
    FM: REL.map(k => (fixed.finalMult && fixed.finalMult[k]) || 1),
  };
}

/** Get the set of active rune IDs for a given context. */
function activeRuneSet(runeCombo, contextBuild) {
  if (runeCombo) return new Set(runeCombo.map(r => r.id));
  return new Set(RUNE_SLOT_KEYS.map(k => contextBuild[k]?.itemId).filter(Boolean));
}

/** Build a closure: fast scorer + museum optimizer for one fixed context. */
function makeScorer(B, F, M, FM, hasSummit, hasUmbrella, method, museumBudget, museumCap, museumStep) {
  function fastScore(addA, addB, mb) {
    const eff = (i) => B[i] + F[i] + addA[i] + addB[i];
    const m = (i) => (M[i] + (mb ? mb[i] : 0)) * FM[i];
    let ssBonus = 0;
    if (hasSummit) { const w = eff(I_WS) * m(I_WS); ssBonus = 0.05 * Math.max(0, w - 3); }
    let addLuck = 0;
    if (hasUmbrella) {
      const cap = eff(I_CAP) * m(I_CAP);
      const mob = eff(I_MB) * m(I_MB);
      const modPct = (5 + 5 * (mob / 100) - (mob / 380)) / 100;
      addLuck = 25 * Math.sqrt(Math.max(0, cap)) * modPct;
    }
    const L = (eff(I_LUCK) + addLuck) * m(I_LUCK);
    const C = eff(I_CAP) * m(I_CAP);
    const SS = eff(I_SS) * (m(I_SS) + ssBonus);
    const DS = eff(I_DS) * (m(I_DS) + ssBonus);
    if (C <= 0 || SS <= 0 || DS <= 0) return 0;
    const rollsPerPan = Math.floor(L * Math.sqrt(C));
    if (rollsPerPan <= 0) return 0;
    const sStr = Math.max(1, eff(I_SSTR) * m(I_SSTR));
    const dStr = Math.max(1, eff(I_DSTR) * m(I_DSTR));
    const r = shakesPerSecond(SS);
    const totalShakes = Math.ceil(C / sStr);
    const shakingDuration = totalShakes / r;
    const n = Math.ceil(C / dStr);
    const d = Math.max(0.0001, DS);
    const overhead = method === 'autopan' ? 1.5 : 0.75;
    const digTime = method === 'autopan' ? (190 * n / d) : (190 * Math.max(0, n - 1) / d);
    const cycle = shakingDuration + overhead + digTime;
    return cycle > 0 ? rollsPerPan / cycle : 0;
  }

  const museumEligible = [I_LUCK, I_CAP, I_SS, I_SSTR, I_DS, I_DSTR];
  if (hasUmbrella) museumEligible.push(I_MB);

  function optimizeMuseumFor(addVec) {
    const mb = new Float64Array(REL.length);
    let cur = fastScore(addVec, ZERO_VEC, mb);
    let remaining = museumBudget;
    while (remaining > 1e-9) {
      let bestI = -1, bestGain = 1e-12, bestInc = 0;
      for (const i of museumEligible) {
        if (mb[i] >= museumCap - 1e-9) continue;
        const inc = Math.min(museumStep, remaining, museumCap - mb[i]);
        const prev = mb[i]; mb[i] = prev + inc;
        const gain = fastScore(addVec, ZERO_VEC, mb) - cur;
        mb[i] = prev;
        if (gain > bestGain) { bestGain = gain; bestI = i; bestInc = inc; }
      }
      if (bestI < 0) break;
      mb[bestI] += bestInc; remaining -= bestInc; cur += bestGain;
    }
    return mb;
  }

  return { fastScore, optimizeMuseumFor };
}

// --- Main export -------------------------------------------------------------

/**
 * @param {Object}  opts
 * @param {Object}  opts.contextBuild     the build providing fixed shovel/locked accessories
 * @param {Object}  opts.buffs            active buffs for the context
 * @param {number}  opts.ringCount        ring slots to fill (6 or 8)
 * @param {Object}  [opts.candidateConfig] { starTier, rollPct, mutation } per candidate
 * @param {boolean} [opts.optimizeMuseum=true]  allocate an idealized museum per build
 * @param {boolean} [opts.searchRunes=true]      enumerate rune combos
 * @param {boolean} [opts.searchEnchant=true]    enumerate pan enchants
 * @param {number}  [opts.museumBudget=6.0]      total museum budget in additive-pile units
 * @param {number}  [opts.museumCap=3.5]         per-stat cap in additive-pile units
 * @returns {{ok, topBuilds:[{build, museum, rollsPerSec, runeCombo, enchantItem, ...}], stats}}
 */
export function optimize(opts) {
  const {
    contextBuild, buffs = {}, museum = {}, ringCount = 8,
    lockedSlots = [], allowUniqueDup = false, maxAscendedTotal = Infinity,
    candidateConfig, method = 'autopan', evalBudget = 8e6,
    optimizeMuseum = true, museumBudget = 6.0, museumCap = 3.5, museumStep = 0.1,
    searchRunes = true, searchEnchant = true,
  } = opts;
  const cfg = { ...DEFAULT_CFG, ...(candidateConfig || {}) };
  const contextMuseum = optimizeMuseum ? {} : museum;

  const ringSlots = SLOTS.filter(s => s.group === 'rings').slice(0, ringCount).map(s => s.key);
  const optNeck = !lockedSlots.includes('necklace');
  const optCharm = !lockedSlots.includes('charm');
  const optRingSlots = ringSlots.filter(k => !lockedSlots.includes(k));

  // --- Build rune + enchant candidate lists ----------------------------------
  const runeCombos = searchRunes ? runeCombosSafely(RUNE_CANDIDATE_IDS) : [null];
  const panEnchantItems = searchEnchant ? getPanEnchantCandidates() : [];
  const enchantCandidates = [{ id: '', name: 'None', toolStats: [] }, ...panEnchantItems];

  // --- Pre-build accessory candidate pools (invariant across rune/enchant) ---
  const neckP_raw = optNeck ? paretoPrune(candidates('necklaces', cfg)) : [EMPTY_CAND()];
  const charmP_raw = optCharm ? paretoPrune(candidates('charms', cfg)) : [EMPTY_CAND()];
  const ringP_raw = optRingSlots.length ? paretoPrune(candidates('rings', cfg)) : [];
  if (!neckP_raw.length || !charmP_raw.length) {
    return { ok: false, reason: 'no-candidates', topBuilds: [], stats: {} };
  }

  // --- Global top-K heap (entries are self-contained — no pool references) ---
  const KEEP = 600;
  const globalTop = [];
  let globalWorst = -Infinity;
  let totalEvaluated = 0;
  let exhaustive = true;
  let droppedRings = 0;
  let bestNeckCount = 0, bestCharmCount = 0, bestRingCount = 0;

  const considerGlobal = (score, neck, charm, rs, runeCombo, enchantItem) => {
    if (globalTop.length >= KEEP && score <= globalWorst) return;
    const entry = { score, neck, charm, rs, runeCombo, enchantItem };
    let i = globalTop.length;
    while (i > 0 && globalTop[i - 1].score < score) i--;
    globalTop.splice(i, 0, entry);
    if (globalTop.length > KEEP) globalTop.pop();
    globalWorst = globalTop[globalTop.length - 1].score;
  };

  // Divide evalBudget across outer iterations to keep total work bounded.
  const outerCount = runeCombos.length * enchantCandidates.length;
  const perIterBudget = Math.max(evalBudget / outerCount, 50000);

  // --- Outer loop: enumerate rune combos × enchants -------------------------
  for (const runeCombo of runeCombos) {
    for (const enchantItem of enchantCandidates) {
      // Build the context for this (runeCombo, enchant) pair.
      const ctx = buildContext(contextBuild, runeCombo, enchantItem.id, optNeck, optCharm, optRingSlots);
      const fixed = computeBuild(ctx, buffs, contextMuseum);
      const { B, F, M, FM } = extractVectors(fixed);
      // Enchant effect is already baked into B/F/M/FM via computeBuild (db.js
      // getEnchant now translates toolStats → effects for the engine).

      // Detect passives from active rune set.
      const runeIds = activeRuneSet(runeCombo, contextBuild);
      const hasSummit = runeIds.has('rune-summit-seeker');
      const hasUmbrella = ctx.pan?.trinket === 'beach-umbrella' && !runeIds.has('rune-purity');

      const { fastScore } = makeScorer(B, F, M, FM, hasSummit, hasUmbrella, method, museumBudget, museumCap, museumStep);

      // Trim ring pool for budget (sorted by solo-score in this context).
      let ringP = ringP_raw.slice();
      const R = optRingSlots.length;
      if (R > 0) {
        ringP.sort((a, b) => {
          const sA = new Float64Array(REL.length), sB = new Float64Array(REL.length);
          for (let k = 0; k < REL.length; k++) { sA[k] = a.vec[k] * (a.unique ? 1 : R); sB[k] = b.vec[k] * (b.unique ? 1 : R); }
          return fastScore(ZERO_VEC, sB, null) - fastScore(ZERO_VEC, sA, null);
        });
        while (ringP.length > 1 && neckP_raw.length * charmP_raw.length * chooseN(ringP.length, R) > perIterBudget) {
          ringP.pop();
          exhaustive = false;
          droppedRings = Math.max(droppedRings, ringP_raw.length - ringP.length);
        }
      }

      const ringSets = R > 0
        ? ringMultisets(ringP, R, allowUniqueDup)
        : [{ sum: new Float64Array(REL.length), asc: 0, rings: [] }];

      bestNeckCount = Math.max(bestNeckCount, neckP_raw.length);
      bestCharmCount = Math.max(bestCharmCount, charmP_raw.length);
      bestRingCount = Math.max(bestRingCount, ringP.length);

      const ncSum = new Float64Array(REL.length);
      for (const neck of neckP_raw) {
        for (const charm of charmP_raw) {
          for (let k = 0; k < ncSum.length; k++) ncSum[k] = neck.vec[k] + charm.vec[k];
          const ncAsc = (neck.ascended ? 1 : 0) + (charm.ascended ? 1 : 0);
          for (const rs of ringSets) {
            if (maxAscendedTotal !== Infinity && ncAsc + rs.asc > maxAscendedTotal) continue;
            totalEvaluated++;
            considerGlobal(fastScore(ncSum, rs.sum, null), neck, charm, rs, runeCombo, enchantItem);
          }
        }
      }
    }
  }

  // --- Reconstruct, museum-optimize, EXACT re-score, de-dup, re-rank --------
  const mbToMuseum = (mb) => {
    const out = {};
    for (let i = 0; i < REL.length; i++) if (mb[i] > 1e-6) out[REL[i]] = 1 + Math.round(mb[i] * 1000) / 1000;
    return out;
  };

  const seen = new Set();
  const scored = [];

  for (const e of globalTop) {
    // Rebuild the full build with accessories + runes + enchant.
    const build = reconstructFromEntry(contextBuild, e, optNeck, optCharm, optRingSlots, cfg);
    const sig = buildSig(build, optNeck, optCharm, optRingSlots, e.runeCombo, e.enchantItem);
    if (seen.has(sig)) continue;
    seen.add(sig);

    // Re-derive the fast scorer for this entry's context (enchant baked in via computeBuild).
    const ctx2 = buildContext(contextBuild, e.runeCombo, e.enchantItem?.id, optNeck, optCharm, optRingSlots);
    const fixed2 = computeBuild(ctx2, buffs, contextMuseum);
    const { B: B2, F: F2, M: M2, FM: FM2 } = extractVectors(fixed2);
    const runeIds2 = activeRuneSet(e.runeCombo, contextBuild);
    const hasSummit2 = runeIds2.has('rune-summit-seeker');
    const hasUmbrella2 = ctx2.pan?.trinket === 'beach-umbrella' && !runeIds2.has('rune-purity');
    const { optimizeMuseumFor } = makeScorer(B2, F2, M2, FM2, hasSummit2, hasUmbrella2, method, museumBudget, museumCap, museumStep);

    let museumObj = museum;
    if (optimizeMuseum) {
      const addVec = new Float64Array(REL.length);
      for (let k = 0; k < addVec.length; k++) addVec[k] = e.neck.vec[k] + e.charm.vec[k] + e.rs.sum[k];
      museumObj = mbToMuseum(optimizeMuseumFor(addVec));
    }

    const res = computeBuild(build, buffs, museumObj);
    const tp = throughput(res.total, method);
    scored.push({
      build, museum: museumObj, rollsPerSec: tp.rollsPerSec, totals: res.total, metrics: tp,
      runeCombo: e.runeCombo, enchantItem: e.enchantItem,
    });
    if (scored.length >= 150) break;
  }
  scored.sort((a, b) => b.rollsPerSec - a.rollsPerSec);

  const top3 = scored.slice(0, 3).map((s, i) => ({
    rank: i + 1,
    rollsPerSec: s.rollsPerSec,
    relPct: scored[0].rollsPerSec > 0 ? (s.rollsPerSec / scored[0].rollsPerSec) * 100 : 0,
    build: s.build, museum: s.museum, totals: s.totals,
    accessories: accessoryList(s.build, optNeck, optCharm, optRingSlots),
    runeCombo: s.runeCombo,
    enchantItem: s.enchantItem,
  }));

  return {
    ok: top3.length > 0,
    reason: top3.length ? undefined : 'no-result',
    topBuilds: top3,
    stats: {
      evaluated: totalEvaluated, exhaustive, droppedRings,
      pool: { neck: bestNeckCount, charm: bestCharmCount, ring: bestRingCount },
      ringSlots: optRingSlots.length, label: exhaustive ? 'Optimal*' : 'Best found',
      optimizeMuseum, museumBudget, museumCap,
      runeCombos: runeCombos.length, enchantCandidates: enchantCandidates.length,
    },
  };
}

// --- helpers ----------------------------------------------------------------

/**
 * Reconstruct a build from an entry, setting accessories, runes, and enchant.
 * Runes and enchant are already in the entry; accessories are set from entry fields.
 */
function reconstructFromEntry(contextBuild, entry, optNeck, optCharm, optRingSlots, cfg) {
  const b = JSON.parse(JSON.stringify(contextBuild));
  // Apply runes.
  if (entry.runeCombo) applyRunesToBuild(b, entry.runeCombo);
  // Apply enchant.
  if (b.pan) b.pan = { ...b.pan, enchant: entry.enchantItem?.id || '' };
  // Apply accessories.
  const setCand = (slotKey, cand) => {
    b[slotKey] = cand && cand.id ? { ...emptySlot(), ...cfg, itemId: cand.id } : emptySlot();
  };
  if (optNeck) setCand('necklace', entry.neck);
  if (optCharm) setCand('charm', entry.charm);
  optRingSlots.forEach((k, i) => setCand(k, entry.rs.rings[i]));
  return b;
}

function buildSig(build, optNeck, optCharm, optRingSlots, runeCombo, enchantItem) {
  const parts = [];
  if (optNeck) parts.push('n:' + (build.necklace?.itemId || ''));
  if (optCharm) parts.push('c:' + (build.charm?.itemId || ''));
  parts.push('r:' + optRingSlots.map(k => build[k]?.itemId || '').sort().join(','));
  if (runeCombo) parts.push('rn:' + runeCombo.map(r => r.id).sort().join(','));
  if (enchantItem?.id) parts.push('enc:' + enchantItem.id);
  return parts.join('|');
}

function accessoryList(build, optNeck, optCharm, optRingSlots) {
  const out = [];
  const label = (key) => SLOTS.find(s => s.key === key)?.label || key;
  ['necklace', 'charm', ...optRingSlots].forEach(k => {
    if (k === 'necklace' && !optNeck) return;
    if (k === 'charm' && !optCharm) return;
    out.push({ slotKey: k, slotLabel: label(k), itemId: build[k]?.itemId || '' });
  });
  return out;
}

// ---------------------------------------------------------------------------
// 3-Step Deep Optimizer
// ---------------------------------------------------------------------------

/**
 * Rarity order used to filter the ring pool to a viable endgame tier.
 * Rings below ringMinRarity are excluded from the search.
 */
const RARITY_ORDER = ['common','uncommon','rare','epic','legendary','mythic','exotic','ascended'];

/**
 * Museum stat names in the same order as REL[0..6].
 * WalkSpeed (REL[7]) has no museum slot.
 */
const MUSEUM_STAT_NAMES = ['Luck','Capacity','Shake Speed','Shake Strength','Dig Speed','Dig Strength','Modifier Boost'];

/**
 * optimizeDeep — async 3-step optimizer that guarantees a globally optimal
 * (or near-optimal) museum allocation alongside the best accessory loadout.
 *
 * Step 1 (main thread, sync): enumerate every gear combo in the pruned pool
 *         with no museum contribution, keep the top-KEEP by fast score.
 * Step 2 (Web Worker): brute-force the full museum lattice for gear #1.
 *         ~8.2M states (no umbrella) or ~90M (Beach Umbrella).
 * Step 3 (Web Worker): pairwise coordinate descent from gear #1's museum
 *         for every runner-up — finds each gear's local optimum near the known
 *         global optimum.
 *
 * Returns a Promise that resolves to the same shape as optimize() so the
 * existing renderResults() in optimizerPanel.js works without changes.
 *
 * @param {Object}   opts          — same options as optimize()
 * @param {Function} [onProgress]  — called with (pct:0-100, bestRPS:number)
 */
export async function optimizeDeep(opts, onProgress) {
  const {
    buffs = {}, ringCount = 8,
    lockedSlots = [], lockedRunes = [],
    allowUniqueDup = false,
    candidateConfig, method = 'autopan',
    museumBudget = 6.0, museumCap = 3.5,
    searchRunes = true, searchEnchant = true,
    ringMinRarity = 'mythic',
  } = opts;

  // Auto-equip best pan/shovel if contextBuild is missing them.
  let contextBuild = opts.contextBuild;
  if (!contextBuild?.pan?.itemId || !contextBuild?.shovel?.itemId) {
    contextBuild = JSON.parse(JSON.stringify(contextBuild || {}));
    if (!contextBuild.pan) contextBuild.pan = {};
    if (!contextBuild.shovel) contextBuild.shovel = {};
    if (!contextBuild.pan.itemId) {
      contextBuild.pan = { itemId: 'nebula-pan', enchantId: 'devouring', starTier: 6, rollPct: 100 };
    }
    if (!contextBuild.shovel.itemId) {
      contextBuild.shovel = { itemId: 'starcrusher-shovel', enchantId: 'mastered', starTier: 6, rollPct: 100 };
    }
  }

  const cfg = { ...DEFAULT_CFG, ...(candidateConfig || {}) };
  const ringSlots = SLOTS.filter(s => s.group === 'rings').slice(0, ringCount).map(s => s.key);
  const optNeck = !lockedSlots.includes('necklace');
  const optCharm = !lockedSlots.includes('charm');
  const optRingSlots = ringSlots.filter(k => !lockedSlots.includes(k));

  // --- Accessory candidate pools -------------------------------------------
  // Keep Pareto pruning (domination-based — never misses the optimum) but
  // remove the per-iteration budget-based ring truncation that caused missed
  // optima in the original optimize().

  // If the user locked specific runes, filter combos to only those containing all of them.
  const locked = new Set(lockedRunes);
  const allCombos = searchRunes ? runeCombosSafely(RUNE_CANDIDATE_IDS) : [null];
  const runeCombos = locked.size
    ? allCombos.filter(combo => combo && [...locked].every(id => combo.some(r => r.id === id)))
    : allCombos;
  const panEnchantItems = searchEnchant ? getPanEnchantCandidates() : [];
  const enchantCandidates = [{ id: '', name: 'None', toolStats: [] }, ...panEnchantItems];

  const neckP = optNeck ? paretoPrune(candidates('necklaces', cfg)) : [EMPTY_CAND()];
  const charmP = optCharm ? paretoPrune(candidates('charms', cfg)) : [EMPTY_CAND()];

  // Filter rings to the endgame tier before Pareto so we never waste combos on
  // common/rare rings that can't compete.
  const minRarityIdx = RARITY_ORDER.indexOf(ringMinRarity);
  const ringP_all = optRingSlots.length ? candidates('rings', cfg) : [];
  const ringP_tier = ringP_all.filter(r => !r.id || RARITY_ORDER.indexOf(r.rarity) >= minRarityIdx);
  const ringP = optRingSlots.length ? paretoPrune(ringP_tier) : [];

  if (!neckP.length || !charmP.length) {
    return { ok: false, reason: 'no-candidates', topBuilds: [], stats: {} };
  }

  // --- Step 1: Gear sweep ---------------------------------------------------
  // Score each combo with fastScore(ncSum, rs.sum, mb=null) — no museum.
  // Museum only affects the final ranking in Steps 2+3.
  const KEEP = 1000;
  const topEntries = [];
  let globalWorst = -Infinity;
  let totalEvaluated = 0;

  // Cache (runeCombo, enchant) → context data so we compute buildContext once per pair.
  const contextCache = new Map();

  // Generate ring multisets once (pool is constant across all (rune,enchant) iterations).
  const R = optRingSlots.length;
  const ringSets = R > 0
    ? ringMultisets(ringP, R, allowUniqueDup)
    : [{ sum: new Float64Array(REL.length), asc: 0, rings: [] }];
  const ncSum = new Float64Array(REL.length);

  for (const runeCombo of runeCombos) {
    for (const enchantItem of enchantCandidates) {
      const cacheKey = (runeCombo?.map(r => r.id).join(',') || '') + '|' + (enchantItem.id || '');
      let ctx_data = contextCache.get(cacheKey);
      if (!ctx_data) {
        const ctx = buildContext(contextBuild, runeCombo, enchantItem.id, optNeck, optCharm, optRingSlots);
        const fixed = computeBuild(ctx, buffs, {});
        const { B, F, M, FM } = extractVectors(fixed);
        const runeIds = activeRuneSet(runeCombo, contextBuild);
        const hasSummit = runeIds.has('rune-summit-seeker');
        const hasUmbrella = ctx.pan?.trinket === 'beach-umbrella' && !runeIds.has('rune-purity');
        // museumBudget/Cap passed as 0 — we never call optimizeMuseumFor in the sweep.
        const { fastScore } = makeScorer(B, F, M, FM, hasSummit, hasUmbrella, method, 0, 0, 0.1);
        ctx_data = {
          B, F,
          M: Array.from(M), FM: Array.from(FM),
          fastScore, hasSummit, hasUmbrella,
        };
        contextCache.set(cacheKey, ctx_data);
      }

      const { fastScore } = ctx_data;

      for (const neck of neckP) {
        for (const charm of charmP) {
          for (let k = 0; k < ncSum.length; k++) ncSum[k] = neck.vec[k] + charm.vec[k];
          for (const rs of ringSets) {
            totalEvaluated++;
            const score = fastScore(ncSum, rs.sum, null);
            if (topEntries.length < KEEP || score > globalWorst) {
              const entry = { score, neck, charm, rs, runeCombo, enchantItem, cacheKey };
              let i = topEntries.length;
              while (i > 0 && topEntries[i - 1].score < score) i--;
              topEntries.splice(i, 0, entry);
              if (topEntries.length > KEEP) topEntries.pop();
              globalWorst = topEntries[topEntries.length - 1].score;
            }
          }
        }
      }
    }
  }

  if (!topEntries.length) return { ok: false, reason: 'no-result', topBuilds: [], stats: {} };

  onProgress?.(5, 0);

  // --- Build gear vectors for the worker ------------------------------------
  // bf[i] = B[i] + F[i] + neck.vec[i] + charm.vec[i] + rings.sum[i]
  // M and FM are the (runeCombo, enchant) context's multiplier piles — constant
  // across all gear combos with the same (rune, enchant) pair.
  const gearVectors = topEntries.map(entry => {
    const { B, F, M, FM, hasSummit, hasUmbrella } = contextCache.get(entry.cacheKey);
    const bf = REL.map((_, i) => B[i] + F[i] + entry.neck.vec[i] + entry.charm.vec[i] + entry.rs.sum[i]);
    return { bf, M, FM, hasSummit, hasUmbrella };
  });

  // --- Steps 2+3: Web Worker ------------------------------------------------
  return new Promise((resolve, reject) => {
    let worker;
    try {
      worker = new Worker(
        new URL('../workers/museumWorker.js', import.meta.url),
        { type: 'module' }
      );
    } catch (err) {
      return reject(new Error('Web Worker unavailable: ' + (err.message || err)));
    }

    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'progress') {
        onProgress?.(msg.pct, msg.bestRPS ?? 0);
        return;
      }
      if (msg.type !== 'done') return;

      worker.terminate();

      // Reconstruct builds from worker results (up to 20: 10 trinket + 10 non-trinket).
      const topBuilds = (msg.results || [])
        .map((r, rank) => {
          const entry = topEntries[r.gearIdx];
          if (!entry) return null;

          const build = reconstructFromEntry(contextBuild, entry, optNeck, optCharm, optRingSlots, cfg);

          // Convert additive museum array → engine multiplier object.
          // mus[i] is the added value (museum_mult − 1); engine expects full multiplier.
          const museumObj = {};
          for (let i = 0; i < 7; i++) {
            const v = r.museum[i];
            if (v > 1e-6) museumObj[MUSEUM_STAT_NAMES[i]] = Math.round((1 + v) * 1000) / 1000;
          }

          const res = computeBuild(build, buffs, museumObj);
          const tp  = throughput(res.total, method);

          return {
            rank: rank + 1,
            rollsPerSec: tp.rollsPerSec,
            relPct: 0,
            hasUmbrella: r.hasUmbrella,
            build, museum: museumObj, totals: res.total,
            accessories: accessoryList(build, optNeck, optCharm, optRingSlots),
            runeCombo: entry.runeCombo,
            enchantItem: entry.enchantItem,
          };
        })
        .filter(Boolean);

      if (topBuilds.length && topBuilds[0].rollsPerSec > 0) {
        const best = topBuilds[0].rollsPerSec;
        for (const b of topBuilds) b.relPct = (b.rollsPerSec / best) * 100;
      }

      resolve({
        ok: topBuilds.length > 0,
        reason: topBuilds.length ? undefined : 'no-result',
        topBuilds,
        stats: {
          evaluated: totalEvaluated,
          exhaustive: true,
          label: 'Optimal',
          pool: { neck: neckP.length, charm: charmP.length, ring: ringP.length },
          ringSlots: optRingSlots.length,
          runeCombos: runeCombos.length,
          enchantCandidates: enchantCandidates.length,
          optimizeMuseum: true, museumBudget, museumCap,
          droppedRings: 0,
          workerEvals: msg.totalEvals ?? 0,
        },
      });
    };

    worker.onerror = (err) => {
      worker.terminate();
      reject(new Error(err.message || 'Museum worker failed'));
    };

    worker.postMessage({ gears: gearVectors, museumBudget, museumCap });
  });
}

// ---------------------------------------------------------------------------
// Museum-only optimizer for a single build.
// Keeps all gear fixed, finds the best museum allocation.
// ---------------------------------------------------------------------------

/**
 * Given a fully-equipped build, find the optimal museum stat allocation.
 *
 * @param {Object} build         — current build object (all slots filled)
 * @param {Object} buffs         — active buffs
 * @param {number} museumBudget  — total budget (default 6.0)
 * @param {number} museumCap     — per-stat cap (default 3.5)
 * @returns {Promise<Object>}    — { statName: multiplier, ... }
 */
export async function optimizeMuseumForBuild(build, buffs, museumBudget = 6.0, museumCap = 3.5) {
  const ctx = JSON.parse(JSON.stringify(build));
  if (!ctx.pan?.itemId)   ctx.pan    = { itemId: 'nebula-pan',         enchant: 'devouring', starTier: 6, rollPct: 100 };
  if (!ctx.shovel?.itemId) ctx.shovel = { itemId: 'starcrusher-shovel', enchant: 'mastered',  starTier: 6, rollPct: 100 };
  if (ctx.shovel) ctx.shovel = { ...ctx.shovel, enchant: 'mastered' };

  // Compute flat gear vectors against empty museum.
  const fixed = computeBuild(ctx, buffs, {});
  const { B, F, M, FM } = extractVectors(fixed);

  // Detect special rune/trinket interactions.
  const runeIds = new Set(RUNE_SLOT_KEYS.map(k => ctx[k]?.itemId).filter(Boolean));
  const hasSummit  = runeIds.has('rune-summit-seeker');
  const hasUmbrella = ctx.pan?.trinket === 'beach-umbrella' && !runeIds.has('rune-purity');

  // All accessory flat stats are already in B+F since computeBuild processed all slots.
  const bf = REL.map((_, i) => B[i] + F[i]);
  const gear = { bf, M: Array.from(M), FM: Array.from(FM), hasSummit, hasUmbrella };

  return new Promise((resolve, reject) => {
    let worker;
    try {
      worker = new Worker(new URL('../workers/museumWorker.js', import.meta.url), { type: 'module' });
    } catch (err) {
      return reject(new Error('Web Worker unavailable: ' + (err.message || err)));
    }

    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type !== 'done') return;
      worker.terminate();
      const r = msg.results?.[0];
      if (!r) return resolve({});
      const museumObj = {};
      for (let i = 0; i < 7; i++) {
        const v = r.museum[i];
        if (v > 1e-6) museumObj[MUSEUM_STAT_NAMES[i]] = Math.round((1 + v) * 1000) / 1000;
      }
      resolve(museumObj);
    };

    worker.onerror = (err) => { worker.terminate(); reject(err); };
    worker.postMessage({ gears: [gear], museumBudget, museumCap });
  });
}
