// ---------------------------------------------------------------------------
// engine.js — turns a build (slot configuration + active buffs) into final stats.
//
// Model (matches the in-game "sheet" approximation):
//   total = (base + flatGear) * multiplier
//   - base:       game defaults + flat buff/potion bonuses
//   - flatGear:   additive contributions from tools, accessories, runes, enchants
//   - multiplier: stacks ADDITIVELY, i.e. two 1.2x sources -> x1.4 (not x1.44)
//
// Roll model: an accessory's overall "quality" is the AVERAGE of its individual
// per-stat rolls. Each stat rolls within (min..max) scaled by star tier and the
// mutation multiplier; a per-stat override in cfg.statRolls beats cfg.rollPct.
// ---------------------------------------------------------------------------

import { STATS, STAT_BY_KEY, STAT_KEYS, STAR_MULT, SLOTS } from './config.js';
import { getItem, getMutation, getEnchant } from './db.js';
import { ALL_BUFFS, resolveBuffEffects } from './buffsModel.js';
import { parseWikiStatString } from './parse.js';

function normName(n) {
  const l = (n || '').toLowerCase();
  if (l === 'walkspeed' || l === 'walk speed') return 'Walk Speed';
  return n;
}

function clampStar(s) { return Math.min(6, Math.max(1, s || 5)); }

export function getToolStats(item, cfg = {}) {
  const baseFlats = {};
  const mults = [];      // the TOOL's own x-multipliers → GLOBAL multiplicative
  (item.toolStats || []).forEach(ts => {
    if (ts.unit === 'x') mults.push({ name: ts.name, value: ts.value });
    else baseFlats[ts.name] = (baseFlats[ts.name] || 0) + ts.value;
  });

  // Enchants (effects: [{kind:'add'|'mult', stat, value|multiplier}]) enhance the
  // TOOL's own flat stats: a 'mult' scales the tool's flat for that stat, an 'add'
  // adds flat. (This is the verified-correct enchant model.)
  const finalFlats = { ...baseFlats };
  const bonuses = {};
  if (cfg.enchant) {
    const enc = getEnchant(cfg.enchant);
    const encMul = {}, encAdd = {};
    (enc?.effects || []).forEach(e => {
      if (e.kind === 'mult') encMul[e.stat] = (encMul[e.stat] || 1) * e.multiplier;
      if (e.kind === 'add') encAdd[e.stat] = (encAdd[e.stat] || 0) + e.value;
    });
    Object.keys(encMul).forEach(stat => {
      if (finalFlats[stat] !== undefined) {
        const bonus = finalFlats[stat] * (encMul[stat] - 1);
        finalFlats[stat] *= encMul[stat];
        bonuses[stat] = (bonuses[stat] || 0) + bonus;
      }
    });
    Object.keys(encAdd).forEach(stat => {
      finalFlats[stat] = (finalFlats[stat] || 0) + encAdd[stat];
      bonuses[stat] = (bonuses[stat] || 0) + encAdd[stat];
    });
  }
  return { baseFlats, finalFlats, bonuses, mults };
}

export function rolledAccessoryStats(item, cfg) {
  if (!item || !item.stats) return [];
  const starMult = STAR_MULT[clampStar(cfg.starTier) - 1];
  const mut = getMutation(cfg.mutation);
  const mutMult = mut ? mut.multiplier : 1;

  const res = [];
  item.stats.forEach(st => {
    const p = parseWikiStatString(st);
    if (p.kind === 'note') {
      res.push({ note: true, name: p.raw });
    } else {
      const baseRange = (p.star6 && cfg.starTier === 6) ? p.star6 : p.base;
      const min = baseRange.min * (cfg.starTier === 6 ? 1 : starMult) * mutMult;
      const max = baseRange.max * (cfg.starTier === 6 ? 1 : starMult) * mutMult;
      const rp = (cfg.statRolls && cfg.statRolls[p.name] !== undefined) ? cfg.statRolls[p.name] : (cfg.rollPct || 90);
      const val = min + (max - min) * (rp / 100);
      res.push({ note: false, name: p.name, min, max, unit: baseRange.unit, value: val });
    }
  });
  return res;
}

export function overallQuality(item, cfg) {
  if (!item || !item.stats) return cfg.rollPct || 90;
  if (!cfg.statRolls || Object.keys(cfg.statRolls).length === 0) return cfg.rollPct || 90;
  let sum = 0, count = 0;
  item.stats.forEach(st => {
    const p = parseWikiStatString(st);
    if (p.kind === 'range') {
      const rp = cfg.statRolls[p.name] !== undefined ? cfg.statRolls[p.name] : (cfg.rollPct || 90);
      sum += rp;
      count++;
    }
  });
  return count > 0 ? Math.round(sum / count) : (cfg.rollPct || 90);
}

function isActive(val) { return val === true || (typeof val === 'number' && val > 0) || val === 'true'; }

export function computeBuild(build, activeBuffs = {}, museum = {}) {
  const base = {};
  const flat = {};
  const mult = {};        // ADDITIVE multiplier pile (museum, totems, runes, buffs…)
  const finalMult = {};   // GLOBAL multiplicative factors (tool x-multipliers), applied last
  const breakdown = {};
  const multSources = {};
  const baseSources = {};

  STAT_KEYS.forEach(k => {
    base[k] = STAT_BY_KEY[k]?.base || 0;   // STATS is an array — key off STAT_BY_KEY
    flat[k] = 0;
    mult[k] = 1;
    finalMult[k] = 1;
    breakdown[k] = {};
    multSources[k] = [];
    baseSources[k] = [];
  });

  const addFlat = (stat, val, source) => { 
    if (flat[stat] === undefined) return;
    flat[stat] += val; 
    if (source) {
      if (!breakdown[source]) breakdown[source] = {};
      breakdown[source][stat] = (breakdown[source][stat] || 0) + val; 
    }
  };
  const addMult = (stat, val, source) => {
    if (mult[stat] === undefined || val === 1) return;
    // Multipliers stack ADDITIVELY: two 1.5x sources -> x2.0 (not x2.25).
    mult[stat] += (val - 1);
    multSources[stat].push({ label: source, mult: val });
  };
  // GLOBAL multiplicative: multiplies the final total AFTER the additive pile
  // (e.g. a shovel's 1.5x). Most sources are additive (addMult); only these few.
  const addFinalMult = (stat, val) => {
    if (finalMult[stat] === undefined || val === 1) return;
    finalMult[stat] *= val;
  };

  let hasSummitSeeker = false;
  let hasBeachUmbrella = false;
  let hasPurity = false;

  for (const [slotKey, slotData] of Object.entries(build)) {
    if (!slotData?.itemId) continue;
    const slot = SLOTS.find(s => s.key === slotKey);
    if (!slot) continue;
    const item = getItem(slot.cat, slotData.itemId);
    if (!item) continue;
    
    breakdown[slotKey] = {};
    STAT_KEYS.forEach(k => breakdown[slotKey][k] = 0);
    
    const itemLabel = item.name;
    
    if (slot.group === 'runes') {
      if (item.id === 'rune-summit-seeker') hasSummitSeeker = true;
      if (item.id === 'rune-purity') hasPurity = true;
      // Runes carry their numeric effects in toolStats ({name,value,unit}).
      (item.toolStats || []).forEach(ts => {
        if (ts.unit === 'x') addMult(ts.name, ts.value, itemLabel);
        else addFlat(ts.name, ts.value, slotKey);
      });
    } else if (slot.kind === 'tool') {
      const ts = getToolStats(item, slotData);
      Object.keys(ts.finalFlats).forEach(stat => addFlat(stat, ts.finalFlats[stat], slotKey));
      // Tool x-multipliers are ADDITIVE (pan & shovel alike — they apply to that
      // stat's pile, e.g. a pan's Shake Speed x2 -> +1.0 Shake Speed mult).
      // The ONLY GLOBAL multipliers are the few specified via addFinalMult below:
      // shovel natural 1.5x + the meteor / starfall / fog-swamp events.
      ts.mults.forEach(m => addMult(m.name, m.value, itemLabel));
    } else {
      rolledAccessoryStats(item, slotData).forEach(l => { if (!l.note) addFlat(l.name, l.value, slotKey); });
    }
  }

  // --- Tool passives that BOOST totems (Nebula Pan, Starcrusher Shovel): e.g.
  //     "+25% Luck from Luck Totems". Collected per totem id; if both tools are
  //     worn their boosts sum. Applied below as a SEPARATE labeled mult source so
  //     the tool's unique contribution is visible in the breakdown. ---
  const totemBoosts = {}; // totemId -> [{ boost, source }]
  ['pan', 'shovel'].forEach(sk => {
    const sd = build[sk];
    if (!sd?.itemId) return;
    const slot = SLOTS.find(s => s.key === sk);
    const it = slot && getItem(slot.cat, sd.itemId);
    (it?.totemBoosts || []).forEach(tb => {
      (totemBoosts[tb.totem] = totemBoosts[tb.totem] || []).push({ boost: tb.boost, source: it.name });
    });
  });

  // Handle ALL_BUFFS
  ALL_BUFFS.forEach(b => {
    const val = activeBuffs[b.id];
    if (val === undefined || val === null || val === false || val === 0 || val === '' || val === 'none') return;
    const factor = b.type === 'counter' ? Number(val) : 1;
    resolveBuffEffects(b, val).forEach(eff => {
      if (eff.add) addFlat(eff.stat, eff.add * factor, b.name);
      if (eff.mult) {
        if (eff.global) {
          // GLOBAL multiplicative (e.g. event multipliers) — applied after the pile.
          addFinalMult(eff.stat, eff.mult);
        } else {
          // Additive: a 1.5x means +0.5 into the pile; scaled by the stack count.
          addMult(eff.stat, 1 + (eff.mult - 1) * factor, b.name);
          // A tool passive boosts this totem's bonus by `boost` (e.g. +25%):
          // the totem's +X into the pile becomes +X·(1+boost). Shown separately.
          (totemBoosts[b.id] || []).forEach(tb => {
            const extra = (eff.mult - 1) * factor * tb.boost;
            if (extra) addMult(eff.stat, 1 + extra, `${tb.source} (+${Math.round(tb.boost * 100)}% ${b.name})`);
          });
        }
      }
    });
  });

  // --- Museum: a per-stat multiplier (e.g. 1.41×) that stacks additively into
  //     the multiplier pile, like every other multiplier source. ---
  Object.entries(museum || {}).forEach(([stat, v]) => {
    const m = Number(v) || 0;
    if (m && m !== 1) addMult(stat, m, 'Museum');
  });

  // --- Shovel: equipping ANY shovel is naturally a 1.5× GLOBAL multiplier on
  //     DIG STRENGTH ONLY (not Luck/Capacity/speeds) — one of the few true
  //     global multiplicatives. ---
  if (build.shovel?.itemId) addFinalMult('Dig Strength', 1.5);

  const warnings = [];

  // Post-process logic for dynamic scaling items
  const finalWalkSpeed = (base['Walk Speed'] + flat['Walk Speed']) * mult['Walk Speed'] * finalMult['Walk Speed'];
  if (hasSummitSeeker) {
    const extraWalkSpeed = Math.max(0, finalWalkSpeed - 3);
    if (extraWalkSpeed > 0) {
      const bonusMult = 1 + (0.05 * extraWalkSpeed);
      addMult('Dig Speed', bonusMult, 'Summit Seeker');
      addMult('Shake Speed', bonusMult, 'Summit Seeker');
    }
  }

  if (build.pan?.trinket === 'beach-umbrella') hasBeachUmbrella = true;

  // Trinket detail (exposed on the result so the UI can show its formula).
  let trinket = null;

  if (hasBeachUmbrella) {
    if (hasPurity) {
      warnings.push("Beach Umbrella and Purity Rune conflict! Beach Umbrella effects disabled.");
    } else {
      const finalCap = (base['Capacity'] + flat['Capacity']) * mult['Capacity'] * finalMult['Capacity'];
      const finalModBoost = (base['Modifier Boost'] + flat['Modifier Boost']) * mult['Modifier Boost'] * finalMult['Modifier Boost'];
      const modPct = (5 + 5 * (finalModBoost / 100) - (finalModBoost / 380)) / 100;
      const flatLuck = 25 * Math.sqrt(Math.max(0, finalCap)) * modPct; // clamp matches optimizer; avoids NaN

      const n = normName('Luck');
      flat[n] += flatLuck;
      // Attribute to its OWN labeled source (not lumped into the Pan slot) so it
      // shows separately in the Luck breakdown.
      baseSources[n].push({ label: '🏖️ Beach Umbrella', value: flatLuck });

      trinket = {
        id: 'beach-umbrella', name: 'Beach Umbrella', stat: 'Luck',
        capacity: finalCap, modBoost: finalModBoost, modPct, flatLuck,
      };
    }
  }

  const total = {};
  STAT_KEYS.forEach(k => { total[k] = (base[k] + flat[k]) * mult[k] * finalMult[k]; });

  return { base, flat, mult, finalMult, finalMults: finalMult, total, breakdown, multSources, baseSources, warnings, trinket };
}
