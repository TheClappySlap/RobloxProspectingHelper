// ---------------------------------------------------------------------------
// store.js — app state + persistence + pub/sub.
// Holds TWO live builds (A and B) so they can be edited side-by-side. Editing
// helpers take a ref ('a' | 'b'); single mode just uses 'a'.
// ---------------------------------------------------------------------------

import { SLOTS, LOCKABLE_SLOT_KEYS } from './config.js';
import { META_BUILDS } from '../../data/metaBuilds.js';

const LS_KEY = 'prospecting_planner_v1';

export function emptySlot() {
  // rollPct = overall quality; statRolls holds per-stat overrides (avg = rollPct).
  return { itemId: '', mutation: '', rollPct: 90, statRolls: {}, starTier: 5, enchant: '', trinket: '' };
}

export function emptyBuild() {
  const b = {};
  SLOTS.forEach(s => { b[s.key] = emptySlot(); });
  return b;
}

export const state = {
  // Build A (also "the build" in single mode)
  build: emptyBuild(),
  activeBuffs: {},
  museum: {},          // statKey -> additive bonus (from the Museum planner)
  // Build B
  buildB: emptyBuild(),
  buffsB: {},
  museumB: {},
  names: { a: 'Build A', b: 'Build B' },
  compareMode: false,
  tab: 'planner',        // 'planner' | 'museum'
  ringsUnlocked: false,
  savedBuilds: [],       // [{ id, name, build, activeBuffs }]
  ui: {
    pickerOpen: false,
    activeSlot: null,
    activeRef: 'a',      // which build the picker is editing
    draft: null,
    search: '',
    rarityFilter: 'all',
    buffsOpen: { a: false, b: false },
    museumOpen: { a: false, b: false },
    runesOpen: true,
    cmpShowAll: false,
  },
};

// --- pub/sub ----------------------------------------------------------------
const subscribers = [];
export function subscribe(fn) { subscribers.push(fn); }
export function emit() { subscribers.forEach(fn => fn()); }

// --- ref accessors ----------------------------------------------------------
export function getBuild(ref) { return ref === 'b' ? state.buildB : state.build; }
export function getBuffs(ref) { return ref === 'b' ? state.buffsB : state.activeBuffs; }
export function getMuseum(ref) { return ref === 'b' ? state.museumB : state.museum; }
function setBuildObj(ref, b) { if (ref === 'b') state.buildB = b; else state.build = b; }
function setBuffsObj(ref, b) { if (ref === 'b') state.buffsB = b; else state.activeBuffs = b; }
function setMuseumObj(ref, m) { if (ref === 'b') state.museumB = m; else state.museum = m; }

// --- persistence ------------------------------------------------------------
export function save() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      build: state.build, activeBuffs: state.activeBuffs, museum: state.museum,
      buildB: state.buildB, buffsB: state.buffsB, museumB: state.museumB,
      names: state.names, compareMode: state.compareMode, tab: state.tab,
      savedBuilds: state.savedBuilds, ringsUnlocked: state.ringsUnlocked,
    }));
  } catch (_) { /* storage unavailable */ }
}

function normalizeBuild(raw) {
  const b = emptyBuild();
  if (raw) for (const k in b) if (raw[k]) b[k] = { ...b[k], ...raw[k] };
  return b;
}

export function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    if (d.build) state.build = normalizeBuild(d.build);
    if (d.activeBuffs) state.activeBuffs = d.activeBuffs;
    if (d.museum) state.museum = d.museum;
    if (d.buildB) state.buildB = normalizeBuild(d.buildB);
    if (d.buffsB) state.buffsB = d.buffsB;
    if (d.museumB) state.museumB = d.museumB;
    if (d.names) state.names = { ...state.names, ...d.names };
    if (typeof d.compareMode === 'boolean') state.compareMode = d.compareMode;
    if (d.tab === 'planner' || d.tab === 'museum') state.tab = d.tab;
    if (typeof d.ringsUnlocked === 'boolean') state.ringsUnlocked = d.ringsUnlocked;
    if (Array.isArray(d.savedBuilds)) {
      state.savedBuilds = d.savedBuilds.map(sb => ({
        id: sb.id, name: sb.name, build: normalizeBuild(sb.build),
        activeBuffs: sb.activeBuffs || {}, museum: sb.museum || {},
      }));
    }
  } catch (_) { /* corrupt save */ }
}

// --- editing (ref-aware) ----------------------------------------------------
export function setSlot(ref, key, cfg) { getBuild(ref)[key] = { ...cfg }; save(); emit(); }
export function clearSlot(ref, key) { getBuild(ref)[key] = emptySlot(); save(); emit(); }
export function clearAllGear(ref) { const b = getBuild(ref); Object.keys(b).forEach(k => b[k] = emptySlot()); save(); emit(); }
export function resetBuild(ref = 'a') { setBuildObj(ref, emptyBuild()); setBuffsObj(ref, {}); setMuseumObj(ref, {}); save(); emit(); }

export function setBuffsAll(ref, buffsObj) {
  setBuffsObj(ref, { ...buffsObj });
  save(); emit();
}

export function setBuff(ref, id, val) {
  const buffs = getBuffs(ref);
  if (val === undefined || val === null || val === false || val === 0 || val === '' || val === 'none') delete buffs[id];
  else buffs[id] = val;
  save(); emit();
}
export function clearBuffs(ref, ids) {
  const buffs = getBuffs(ref);
  (ids || Object.keys(buffs)).forEach(id => delete buffs[id]);
  save(); emit();
}

export function setMuseum(ref, stat, val) {
  const m = getMuseum(ref);
  const n = Number(val) || 0;
  // Museum stores a per-stat MULTIPLIER; 1.0× (or blank) means "no effect".
  if (n && n !== 1) m[stat] = n; else delete m[stat];
  save(); emit();
}
export function clearMuseum(ref) { setMuseumObj(ref, {}); save(); emit(); }
export function setMuseumAll(ref, obj) { setMuseumObj(ref, { ...obj }); save(); emit(); }

export function setRingsUnlocked(unlocked) {
  state.ringsUnlocked = unlocked;
  if (!unlocked) [state.build, state.buildB].forEach(b => LOCKABLE_SLOT_KEYS.forEach(k => { b[k] = emptySlot(); }));
  save(); emit();
}

// --- two-build helpers ------------------------------------------------------
export function copyBuild(fromRef, toRef) {
  setBuildObj(toRef, JSON.parse(JSON.stringify(getBuild(fromRef))));
  setBuffsObj(toRef, { ...getBuffs(fromRef) });
  setMuseumObj(toRef, { ...getMuseum(fromRef) });
  save(); emit();
}
export function swapBuilds() {
  const tb = state.build, tbu = state.activeBuffs, tm = state.museum;
  state.build = state.buildB; state.activeBuffs = state.buffsB; state.museum = state.museumB;
  state.buildB = tb; state.buffsB = tbu; state.museumB = tm;
  const tn = state.names.a; state.names.a = state.names.b; state.names.b = tn;
  save(); emit();
}
/**
 * Drop an optimizer result into Build B and flip on Compare so the existing
 * A|Δ|B diff shows "current → optimized". Buffs carry over from the source build
 * (the fixed context the optimizer scored against). The museum is the optimizer's
 * own allocation when provided (it optimizes museum too); otherwise we copy the
 * source build's museum. One emit.
 */
export function applyOptimized(build, museum = null, fromRef = 'a', toRef = 'b', name = '⚡ Optimized') {
  setBuildObj(toRef, JSON.parse(JSON.stringify(build)));
  setBuffsObj(toRef, { ...getBuffs(fromRef) });
  setMuseumObj(toRef, museum ? { ...museum } : { ...getMuseum(fromRef) });
  state.names[toRef] = name;
  state.compareMode = true;
  save(); emit();
}

export function setCompareMode(on) { state.compareMode = on; save(); emit(); }
export function setTab(tab) { if (tab === state.tab) return; state.tab = tab; save(); emit(); }
export function setName(ref, name) { state.names[ref] = (name || state.names[ref]).trim() || state.names[ref]; save(); emit(); }

// --- saved builds -----------------------------------------------------------
let idCounter = 0;
function newId() { return `b_${Date.now().toString(36)}_${(idCounter++).toString(36)}`; }

export function addBuild(name, ref = 'a') {
  const entry = {
    id: newId(),
    name: (name || 'Untitled').trim() || 'Untitled',
    build: JSON.parse(JSON.stringify(getBuild(ref))),
    activeBuffs: { ...getBuffs(ref) },
    museum: { ...getMuseum(ref) },
  };
  state.savedBuilds.push(entry);
  save(); emit();
  return entry;
}
export function loadSavedBuild(id, ref = 'a') {
  const sb = state.savedBuilds.find(b => b.id === id);
  if (!sb) return;
  setBuildObj(ref, JSON.parse(JSON.stringify(sb.build)));
  setBuffsObj(ref, { ...sb.activeBuffs });
  setMuseumObj(ref, { ...(sb.museum || {}) });
  save(); emit();
}
export function renameSavedBuild(id, name) {
  const sb = state.savedBuilds.find(b => b.id === id);
  if (!sb) return;
  sb.name = (name || sb.name).trim() || sb.name;
  save(); emit();
}
export function deleteSavedBuild(id) {
  state.savedBuilds = state.savedBuilds.filter(b => b.id !== id);
  save(); emit();
}

// --- meta builds ------------------------------------------------------------
export { META_BUILDS };

/**
 * Load a meta build by id into Build A or B.
 * Maps each slot in the meta build's slots object into the target build's slot
 * state. Returns the meta build name on success, null if not found.
 */
// Accessory slot keys — used to apply defaultStarTier / defaultRollPct / defaultMutation.
const ACCESSORY_SLOT_KEYS = ['necklace', 'charm', 'ring1', 'ring2', 'ring3', 'ring4', 'ring5', 'ring6', 'ring7', 'ring8'];

export function loadMetaBuild(metaBuildId, ref = 'a') {
  const mb = META_BUILDS.find(m => m.id === metaBuildId);
  if (!mb) return null;
  const b = emptyBuild();

  // For 6-ring mode, merge ring-slot overrides if the build defines them.
  const slotDefs = (!state.ringsUnlocked && mb.slots6Rings)
    ? { ...mb.slots, ...mb.slots6Rings }
    : mb.slots;

  for (const [key, slotDef] of Object.entries(slotDefs)) {
    if (b[key] !== undefined) {
      b[key] = {
        ...emptySlot(),
        itemId:  slotDef.itemId   || '',
        enchant: slotDef.enchantId || '',
        trinket: slotDef.trinket  || '',  // e.g. Beach Umbrella on pan
      };
    }
  }

  // Always clear extra ring slots when they aren't unlocked.
  if (!state.ringsUnlocked) {
    LOCKABLE_SLOT_KEYS.forEach(k => { b[k] = emptySlot(); });
  }

  // Apply default quality settings to accessory slots when the build specifies them.
  if (mb.defaultStarTier !== undefined || mb.defaultRollPct !== undefined || mb.defaultMutation !== undefined) {
    ACCESSORY_SLOT_KEYS.forEach(k => {
      if (!b[k]?.itemId) return;
      if (mb.defaultStarTier !== undefined) b[k].starTier = mb.defaultStarTier;
      if (mb.defaultRollPct !== undefined) b[k].rollPct = mb.defaultRollPct;
      if (mb.defaultMutation !== undefined) b[k].mutation = mb.defaultMutation;
    });
  }

  setBuildObj(ref, b);
  state.names[ref] = mb.name;
  save(); emit();
  return mb.name;
}
