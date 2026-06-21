// ---------------------------------------------------------------------------
// museumTab.js — the Museum planner, ported into the app as a scoped tab.
//
// Same data + math as the standalone planner (kept faithful — the user likes
// it), with a UX refactor: a stat-filter bar that collapses ores you don't care
// about, cleaner presets/save/load, and a corrected autofill. All markup lives
// under `.museum-view` so its dark theme can't leak into the parchment planner.
// ---------------------------------------------------------------------------

import {
  RARITIES, ORES, MUTATIONS, MUTATION_MULT, STAT_CONFIG, STAT_ORDER, bestMutationFor,
} from '../core/museumData.js';
import { escapeHtml } from './helpers.js';

// --- persistence keys -------------------------------------------------------
const LS_SLOTS = 'prospectingMuseum_current';
const LS_BUILDS = 'prospectingMuseumBuilds';

// --- module state -----------------------------------------------------------
let museumSlots = {};
RARITIES.forEach(r => { museumSlots[r.id] = Array(r.slots).fill(null); });
let targetSlot = { active: false, rarity: null, idx: null };
let hiddenStats = new Set();        // stats filtered out of the ore tables
let expandedHidden = new Set();     // rarity ids whose hidden ores are revealed
let openDropdown = null;            // id of the open mutation dropdown
let statsMin = false;
let activePreset = null;
let mountRoot = null;
let localBuilds = readJSON(LS_BUILDS, {});

const PRESETS = [
  { id: 'luck',         label: 'Max Luck',     icon: '🍀', target: 'luck' },
  { id: 'capacity',     label: 'Max Capacity', icon: '🎒', target: 'capacity' },
  { id: 'dig_speed',    label: 'Dig Speed',    icon: '⛏',  target: 'dig_speed' },
  { id: 'dig_strength', label: 'Dig Strength', icon: '💪', target: 'dig_strength' },
  { id: 'shake_amount', label: 'Shake Amount', icon: '💥', target: 'shake_amount' },
  { id: 'mod_boost',    label: 'Mod Boost',    icon: '✨', target: 'mod_boost' },
  { id: 'sell_boost',   label: 'Sell Boost',   icon: '💰', target: 'sell_boost' },
];

const PRIORITY_CHAINS = [
  {
    id: 'luck_build',
    label: 'Luck Build',
    icon: '⚡',
    chain: ['luck', 'capacity', 'dig_strength', 'shake_amount', 'shake_speed', 'dig_speed', 'mod_boost'],
  },
  {
    id: 'hybrid_build',
    label: 'Hybrid Build',
    icon: '⚡',
    chain: ['mod_boost', 'luck', 'capacity', 'dig_strength', 'shake_amount', 'shake_speed'],
  },
  {
    id: 'size_build',
    label: 'Size Build',
    icon: '⚡',
    chain: ['sell_boost', 'luck', 'capacity', 'shake_amount', 'dig_strength'],
  },
];

// --- helpers ----------------------------------------------------------------
function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (_) { return fallback; }
}
function persistSlots() {
  try { localStorage.setItem(LS_SLOTS, JSON.stringify(exportObj())); } catch (_) {}
}
function persistBuilds() {
  try { localStorage.setItem(LS_BUILDS, JSON.stringify(localBuilds)); } catch (_) {}
}

function exportObj() {
  const out = {};
  RARITIES.forEach(r => { out[r.id] = museumSlots[r.id].map(s => s ? { o: s.ore.name, m: s.mutation?.id || null } : null); });
  return out;
}
function applyData(data) {
  RARITIES.forEach(r => { museumSlots[r.id] = Array(r.slots).fill(null); });
  RARITIES.forEach(r => {
    const arr = data?.[r.id]; if (!Array.isArray(arr)) return;
    for (let i = 0; i < r.slots; i++) {
      const sd = arr[i]; if (!sd) continue;
      const ore = ORES[r.id].find(o => o.name === sd.o);
      const mut = sd.m ? MUTATIONS.find(m => m.id === sd.m) : null;
      if (ore) museumSlots[r.id][i] = { ore, mutation: mut || null };
    }
  });
}

function getEquipped() {
  const set = new Set();
  Object.values(museumSlots).flat().forEach(s => { if (s) set.add(s.ore.name); });
  return set;
}
function oreHidden(ore) {
  // Hidden only if EVERY effect targets a filtered-out stat (so multi-stat ores
  // with at least one stat you care about stay visible).
  return ore.effects.length > 0 && ore.effects.every(e => hiddenStats.has(e.stat));
}

function rarityTotals(rid) {
  const t = {};
  museumSlots[rid].forEach(s => {
    if (!s) return;
    s.ore.effects.forEach(e => { t[e.stat] = (t[e.stat] || 0) + e.max; });
    if (s.mutation) s.mutation.stats.forEach(st => { t[st] = (t[st] || 0) + MUTATION_MULT[rid]; });
  });
  return t;
}
function grandTotals() {
  const t = {};
  RARITIES.forEach(r => {
    const rt = rarityTotals(r.id);
    Object.entries(rt).forEach(([k, v]) => { t[k] = (t[k] || 0) + v; });
  });
  return t;
}

// --- autofill (corrected) ---------------------------------------------------
function runAutofill(preset) {
  const cfg = PRESETS.find(p => p.id === preset);
  if (!cfg) return;
  RARITIES.forEach(r => { museumSlots[r.id] = Array(r.slots).fill(null); });
  const mut = bestMutationFor(cfg.target);
  RARITIES.forEach(r => {
    const candidates = ORES[r.id]
      .map(o => {
        const hit = o.effects.find(e => e.stat === cfg.target);
        if (!hit) return null;
        const others = o.effects.filter(e => e !== hit).reduce((s, e) => s + e.max, 0);
        return { ore: o, val: hit.max, others };
      })
      .filter(Boolean)
      .sort((a, b) => (b.val - a.val) || (b.others - a.others)); // target first, then best secondaries
    for (let i = 0; i < r.slots && i < candidates.length; i++) {
      museumSlots[r.id][i] = { ore: candidates[i].ore, mutation: mut };
    }
    // Fewer matching ores than slots → leave the rest EMPTY (don't equip junk).
  });
  activePreset = preset;
  targetSlot.active = false;
  persistSlots();
  rerender();
}

// --- priority-chain autofill ------------------------------------------------
function runPriorityFill(chainId) {
  const cfg = PRIORITY_CHAINS.find(c => c.id === chainId);
  if (!cfg) return;

  RARITIES.forEach(r => { museumSlots[r.id] = Array(r.slots).fill(null); });
  const mut = bestMutationFor(cfg.chain[0]);

  // Process rarities highest → lowest (best slots get first pick).
  const rarityOrder = ['exotic', 'mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
  const assignedOres = new Set(); // track globally so no ore is double-slotted

  rarityOrder.forEach(rid => {
    const r = RARITIES.find(r => r.id === rid);
    if (!r) return;
    const oresForRarity = ORES[rid] || [];

    for (let slotIdx = 0; slotIdx < r.slots; slotIdx++) {
      // Walk priority chain: find best unassigned ore for the first matching stat.
      let chosen = null;
      for (const stat of cfg.chain) {
        // All ores of this rarity that (a) have this stat with a positive value
        // and (b) haven't been assigned yet — pick the one with the highest value.
        const best = oresForRarity
          .filter(o => !assignedOres.has(o.name) && o.effects.some(e => e.stat === stat && e.max > 0))
          .sort((a, b) => {
            const va = a.effects.find(e => e.stat === stat)?.max ?? 0;
            const vb = b.effects.find(e => e.stat === stat)?.max ?? 0;
            return vb - va;
          })[0];
        if (best) { chosen = best; break; }
      }
      if (chosen) {
        museumSlots[rid][slotIdx] = { ore: chosen, mutation: mut };
        assignedOres.add(chosen.name);
      }
    }
  });

  activePreset = chainId;
  targetSlot.active = false;
  persistSlots();
  rerender();
}

// --- actions ----------------------------------------------------------------
function clearAll() {
  RARITIES.forEach(r => { museumSlots[r.id] = Array(r.slots).fill(null); });
  activePreset = null; targetSlot.active = false; openDropdown = null;
  persistSlots(); rerender();
}
function setTarget(rarity, idx) {
  targetSlot = { active: true, rarity, idx }; openDropdown = null; rerender();
}
function equip(rarity, oreName) {
  if (!targetSlot.active || targetSlot.rarity !== rarity) {
    const empty = museumSlots[rarity].findIndex(s => s === null);
    if (empty === -1) return;
    targetSlot = { active: true, rarity, idx: empty };
  }
  const ore = ORES[rarity].find(o => o.name === oreName);
  const keepMut = museumSlots[rarity][targetSlot.idx]?.mutation || null;
  museumSlots[rarity][targetSlot.idx] = { ore, mutation: keepMut };
  const next = museumSlots[rarity].findIndex(s => s === null);
  if (next !== -1) targetSlot.idx = next; else targetSlot.active = false;
  activePreset = null; persistSlots(); rerender();
}
function clearSlot(rarity, idx) {
  museumSlots[rarity][idx] = null;
  targetSlot = { active: true, rarity, idx }; openDropdown = null;
  activePreset = null; persistSlots(); rerender();
}
function setMutation(rarity, idx, mutId) {
  const mut = mutId ? MUTATIONS.find(m => m.id === mutId) : null;
  if (museumSlots[rarity][idx]) museumSlots[rarity][idx].mutation = mut;
  openDropdown = null; activePreset = null; persistSlots(); rerender();
}
function toggleFilter(stat) {
  if (hiddenStats.has(stat)) hiddenStats.delete(stat); else hiddenStats.add(stat);
  rerender();
}
function saveBuild(name) {
  name = (name || '').trim(); if (!name) return;
  localBuilds[name] = exportObj(); persistBuilds(); rerender();
}
function loadBuild(name) { if (localBuilds[name]) { applyData(localBuilds[name]); activePreset = null; persistSlots(); rerender(); } }
function deleteBuild(name) { delete localBuilds[name]; persistBuilds(); rerender(); }
function renameBuild(name) {
  const next = prompt('Rename build:', name);
  if (next === null) return;
  const trimmed = next.trim(); if (!trimmed || trimmed === name) return;
  localBuilds[trimmed] = localBuilds[name]; delete localBuilds[name];
  persistBuilds(); rerender();
}
function exportFile() {
  const data = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj(), null, 2));
  const a = document.createElement('a');
  a.setAttribute('href', data); a.setAttribute('download', 'museum_build.json');
  document.body.appendChild(a); a.click(); a.remove();
}
function importFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try { applyData(JSON.parse(e.target.result)); activePreset = null; persistSlots(); rerender(); }
    catch (_) { alert('Invalid build file.'); }
  };
  reader.readAsText(file);
}

// --- render -----------------------------------------------------------------
function statChip(stat) {
  const cfg = STAT_CONFIG[stat];
  const off = hiddenStats.has(stat);
  return `<button class="mv-chip ${cfg.css} ${off ? 'off' : ''}" data-act="filter" data-stat="${stat}">
    <span class="mv-chip-dot"></span>${escapeHtml(cfg.label)}</button>`;
}

function slotHtml(r, slot, idx) {
  const isTarget = targetSlot.active && targetSlot.rarity === r.id && targetSlot.idx === idx;
  if (!slot) {
    return `<div class="mv-slot empty ${isTarget ? 'active-target' : ''}" data-act="target" data-r="${r.id}" data-i="${idx}">
      <span class="mv-slot-empty">${isTarget ? 'Pick from table ↓' : '+ Select Ore'}</span></div>`;
  }
  const ddId = `dd-${r.id}-${idx}`;
  const oreEffs = slot.ore.effects.map(e =>
    `<div class="mv-eff"><span class="${STAT_CONFIG[e.stat].css}">${STAT_CONFIG[e.stat].label}</span>
     <span class="mv-eff-v">${e.max < 0 ? '−' : '+'}${Math.abs(e.max).toFixed(2)}x</span></div>`).join('');
  let mutEffs = '';
  if (slot.mutation) {
    mutEffs = slot.mutation.stats.map(st =>
      `<div class="mv-eff"><span class="${STAT_CONFIG[st].css}">${STAT_CONFIG[st].label}</span>
       <span class="mv-eff-v">+${MUTATION_MULT[r.id].toFixed(2)}x</span></div>`).join('');
  }
  let menu = `<div class="cd-item" data-act="set-mut" data-r="${r.id}" data-i="${idx}" data-mut="">
      <span class="cd-name" style="color:var(--mv-dim)">No Modifier</span></div>`;
  MUTATIONS.forEach(m => {
    const effs = m.stats.map(st => `<span class="${STAT_CONFIG[st].css}">${STAT_CONFIG[st].label}</span>`).join(' + ');
    menu += `<div class="cd-item" data-act="set-mut" data-r="${r.id}" data-i="${idx}" data-mut="${m.id}">
      <span class="cd-name">${escapeHtml(m.label)}</span><span class="cd-effs">${effs}</span></div>`;
  });
  const mutLabel = slot.mutation ? slot.mutation.label : 'Select Modifier';
  return `
    <div class="mv-slot filled" style="--slot-color:${r.color}">
      <button class="mv-slot-clear" data-act="clear-slot" data-r="${r.id}" data-i="${idx}" title="Remove">✕</button>
      <div class="mv-slot-name">${escapeHtml(slot.ore.name)}</div>
      <div class="custom-dropdown ${openDropdown === ddId ? 'open' : ''}">
        <div class="cd-trigger" data-act="dd-toggle" data-dd="${ddId}">
          <span style="color:${slot.mutation ? 'var(--gold)' : 'var(--mv-dim)'}">${escapeHtml(mutLabel)}</span>
          <span class="cd-caret">▼</span>
        </div>
        <div class="cd-menu">${menu}</div>
      </div>
      <div class="mv-slot-group"><div class="mv-slot-glabel">Ore Stats</div><div class="mv-effs">${oreEffs}</div></div>
      ${slot.mutation ? `<div class="mv-slot-group"><div class="mv-slot-glabel">Mutation Stats</div><div class="mv-effs">${mutEffs}</div></div>` : ''}
    </div>`;
}

function raritySection(r, equipped) {
  const totals = rarityTotals(r.id);
  const tk = Object.keys(totals);
  const summary = tk.length
    ? tk.map(st => `<span class="${STAT_CONFIG[st].css}">${totals[st] < 0 ? '−' : '+'}${Math.abs(totals[st]).toFixed(2)}x ${STAT_CONFIG[st].label}</span>`).join('')
    : `<span class="mv-faint">0.00x Stats</span>`;

  const slots = museumSlots[r.id].map((s, i) => slotHtml(r, s, i)).join('');

  const visible = [], hidden = [];
  ORES[r.id].forEach(ore => (oreHidden(ore) ? hidden : visible).push(ore));
  const showHidden = expandedHidden.has(r.id);

  const rowHtml = ore => {
    const eq = equipped.has(ore.name);
    const effs = ore.effects.map(e => `<span class="${STAT_CONFIG[e.stat].css}">${STAT_CONFIG[e.stat].label}</span>`).join(', ');
    const maxes = ore.effects.map(e => `${e.max}x`).join(', ');
    return `<tr class="${eq ? 'equipped' : ''}" ${eq ? '' : `data-act="equip" data-r="${r.id}" data-ore="${escapeHtml(ore.name)}"`}>
      <td style="color:${r.color}">${escapeHtml(ore.name)}</td><td>${ore.kg || '--'}</td><td>${effs}</td><td>${maxes}</td></tr>`;
  };

  let body = visible.map(rowHtml).join('');
  if (hidden.length) {
    body += `<tr class="mv-hidden-row"><td colspan="4">
      <button class="mv-show-hidden" data-act="show-hidden" data-r="${r.id}">
        ${showHidden ? '▾ Hide' : `▸ ${hidden.length} ore${hidden.length > 1 ? 's' : ''} hidden by filter`}
      </button></td></tr>`;
    if (showHidden) body += hidden.map(rowHtml).join('');
  }

  return `
    <section class="mv-rarity">
      <div class="mv-rarity-head">
        <div class="mv-rarity-title" style="color:${r.color}">${escapeHtml(r.label)}</div>
        <div class="mv-rarity-summary">${summary}</div>
      </div>
      <div class="mv-slots">${slots}</div>
      <div class="mv-table-wrap"><table class="mv-table">
        <thead><tr><th>Ore</th><th>Min KG</th><th>Bonus</th><th>Max Boost</th></tr></thead>
        <tbody>${body || `<tr><td colspan="4" class="mv-faint" style="text-align:center">All ores hidden by filter</td></tr>`}</tbody>
      </table></div>
    </section>`;
}

function totalsHtml() {
  const totals = grandTotals();
  const rows = STAT_ORDER.filter(st => totals[st]).map(st => {
    const v = totals[st];
    return `<div class="mv-stat-line ${STAT_CONFIG[st].css}"><span class="mv-stat-v">x${(1 + v).toFixed(2)}</span><span>${STAT_CONFIG[st].label}</span></div>`;
  }).join('');
  return rows || `<span class="mv-faint" style="font-size:12px">No boosts active.</span>`;
}

export function renderMuseumTab(root) {
  mountRoot = root;
  const equipped = getEquipped();

  const presetBtns = PRESETS.map(p =>
    `<button class="mv-preset ${activePreset === p.id ? 'active' : ''}" data-act="preset" data-preset="${p.id}">
      <span>${p.icon}</span>${escapeHtml(p.label)}</button>`).join('');

  const priorityBtns = PRIORITY_CHAINS.map(c =>
    `<button class="mv-preset priority-fill ${activePreset === c.id ? 'active' : ''}" data-act="priority-fill" data-chain="${c.id}">
      <span>${c.icon}</span>${escapeHtml(c.label)}</button>`).join('');

  const buildKeys = Object.keys(localBuilds);
  const buildsList = buildKeys.length
    ? buildKeys.map(name => `<div class="mv-build" data-act="load" data-name="${escapeHtml(name)}">
        <span class="mv-build-name">${escapeHtml(name)}</span>
        <span class="mv-build-acts">
          <button class="mv-build-btn" data-act="rename" data-name="${escapeHtml(name)}" title="Rename">✎</button>
          <button class="mv-build-btn del" data-act="del" data-name="${escapeHtml(name)}" title="Delete">✕</button>
        </span></div>`).join('')
    : `<div class="mv-faint" style="font-size:11px">No saved builds yet.</div>`;

  const filterBar = STAT_ORDER.filter(st => st !== 'dig_amount' && st !== 'walk_speed').map(statChip).join('');
  const anyHidden = hiddenStats.size > 0;

  root.innerHTML = `
  <div class="museum-view ${statsMin ? 'stats-min' : ''}">
    <aside class="mv-sidebar">
      <div class="mv-side-sec">
        <div class="mv-side-label">Priority Fill</div>
        <div class="mv-presets">${priorityBtns}</div>
      </div>
      <div class="mv-side-sec">
        <div class="mv-side-label">Auto-Fill (Max Single Stat)</div>
        <div class="mv-presets">${presetBtns}</div>
      </div>
      <div class="mv-side-sec">
        <div class="mv-side-label">Saved Builds</div>
        <div class="mv-save-row">
          <input type="text" id="mv-save-name" class="mv-input" placeholder="Name this build…">
          <button class="mv-btn" data-act="save">Save</button>
        </div>
        <div class="mv-builds">${buildsList}</div>
      </div>
      <div class="mv-side-sec">
        <div class="mv-side-label">Import / Export</div>
        <div class="mv-io">
          <button class="mv-btn gold" data-act="export">📥 Export</button>
          <button class="mv-btn gold" data-act="import">📤 Import</button>
          <input type="file" id="mv-import" accept=".json" hidden>
        </div>
        <button class="mv-btn danger full" data-act="clear-all">✕ Clear All Slots</button>
      </div>
      <div class="mv-side-sec mv-math">
        <div class="mv-side-label">Modifier Math</div>
        <table class="mv-math-table">
          <tr><th>Rarity</th><th>Base</th><th>Mut</th></tr>
          <tr><td>Common</td><td>0.05x</td><td>0.01x</td></tr>
          <tr><td>Uncommon</td><td>0.08x</td><td>0.01x</td></tr>
          <tr><td>Rare</td><td>0.13x</td><td>0.01x</td></tr>
          <tr><td>Epic</td><td>0.20x</td><td>0.02x</td></tr>
          <tr><td>Legendary</td><td>0.30x</td><td>0.03x</td></tr>
          <tr><td>Mythic</td><td>0.50x</td><td>0.05x</td></tr>
          <tr><td>Exotic</td><td>1.00x</td><td>0.08x</td></tr>
        </table>
      </div>
    </aside>

    <div class="mv-content">
      <div class="mv-filterbar">
        <span class="mv-filter-label">Show stats:</span>
        ${filterBar}
        ${anyHidden ? `<button class="mv-filter-reset" data-act="filter-reset">Reset</button>` : ''}
      </div>
      <div class="mv-grid" id="mv-grid">
        ${RARITIES.map(r => raritySection(r, equipped)).join('')}
      </div>
    </div>

    <div class="mv-floating ${statsMin ? 'min' : ''}">
      <div class="mv-fl-head" data-act="toggle-stats">
        Total Output <button class="mv-fl-btn">${statsMin ? '[ + ]' : '[ – ]'}</button>
      </div>
      <div class="mv-fl-body">${totalsHtml()}</div>
    </div>
  </div>`;

  wire(root);
}

// --- wiring (event delegation) ----------------------------------------------
function wire(root) {
  const view = root.querySelector('.museum-view');
  if (!view) return;

  view.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    // Click outside any dropdown closes the open one.
    if (openDropdown && !e.target.closest('.custom-dropdown')) { openDropdown = null; rerender(); return; }
    if (!el) return;
    const { act, r, i, ore, dd, mut, stat, name, preset, chain } = el.dataset;
    switch (act) {
      case 'target': setTarget(r, +i); break;
      case 'equip': equip(r, ore); break;
      case 'clear-slot': clearSlot(r, +i); break;
      case 'clear-all': clearAll(); break;
      case 'dd-toggle': openDropdown = openDropdown === dd ? null : dd; rerender(); break;
      case 'set-mut': setMutation(r, +i, mut || null); break;
      case 'preset': runAutofill(preset); break;
      case 'priority-fill': runPriorityFill(chain); break;
      case 'filter': toggleFilter(stat); break;
      case 'filter-reset': hiddenStats.clear(); rerender(); break;
      case 'show-hidden': (expandedHidden.has(r) ? expandedHidden.delete(r) : expandedHidden.add(r)); rerender(); break;
      case 'save': saveBuild(root.querySelector('#mv-save-name')?.value); break;
      case 'load': loadBuild(name); break;
      case 'rename': renameBuild(name); break;
      case 'del': deleteBuild(name); break;
      case 'export': exportFile(); break;
      case 'import': root.querySelector('#mv-import')?.click(); break;
      case 'toggle-stats': statsMin = !statsMin; rerender(); break;
    }
  });

  const saveInput = root.querySelector('#mv-save-name');
  saveInput?.addEventListener('keydown', e => { if (e.key === 'Enter') saveBuild(saveInput.value); });
  root.querySelector('#mv-import')?.addEventListener('change', e => importFile(e.target.files[0]));
}

function rerender() { if (mountRoot) renderMuseumTab(mountRoot); }

// Restore the last-edited museum on first load.
applyData(readJSON(LS_SLOTS, null));
