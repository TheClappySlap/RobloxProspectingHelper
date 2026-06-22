// ---------------------------------------------------------------------------
// museumTab.js — the Museum planner, ported into the app as a scoped tab.
//
// Same data + math as the standalone planner (kept faithful — the user likes
// it), with a UX refactor: a stat-filter bar that collapses ores you don't care
// about, cleaner presets/save/load, and a corrected autofill. All markup lives
// under `.museum-view` so its dark theme can't leak into the parchment planner.
// ---------------------------------------------------------------------------

import {
  RARITIES, ORES, MUTATIONS, MUTATION_MULT, STAT_CONFIG, STAT_ORDER, museumMutationColor,
} from '../core/museumData.js';
import { escapeHtml } from './helpers.js';
import { META_BUILDS } from '../../data/metaBuilds.js';

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

// Meta builds that have museum data, grouped by type
const MUSEUM_META = META_BUILDS.filter(b => b.museum);
const META_TYPES = [...new Set(MUSEUM_META.map(b => b.type))];

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

// Treasured gives 2× the standard per-rarity luck multiplier
function mutBoost(mutId, stat, rid) {
  return MUTATION_MULT[rid] * (mutId === 'treasured' && stat === 'luck' ? 2 : 1);
}

function rarityTotals(rid) {
  const t = {};
  museumSlots[rid].forEach(s => {
    if (!s) return;
    s.ore.effects.forEach(e => { t[e.stat] = (t[e.stat] || 0) + e.max; });
    if (s.mutation) s.mutation.stats.forEach(st => { t[st] = (t[st] || 0) + mutBoost(s.mutation.id, st, rid); });
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

// --- meta build parsing and fill -------------------------------------------

// Find the first mutation whose label appears in str.
function parseMutFromString(str) {
  if (!str) return null;
  for (const mut of MUTATIONS) {
    if (str.includes(mut.label)) return mut;
  }
  return null;
}

// Parse a meta build's museum object into the same slot format museumSlots uses.
// Each entry in build.museum[rarity] is a slot string with this notation:
//   "[STAT_LETTERS] ORE_NAME KG"           — single ore, optional letter prefix
//   "ORE_A KG | ORE_B KG | ..."            — OR: first is primary, rest are alts
//   "[LETTERS] pick N: ORE_A | ORE_B | ..." — fill N slots from this pool
//   "ORE‡ KG"                              — ‡ marks ores that use dagger mutation
// Ore names are matched against the current rarity's ORES pool (longest-first to
// avoid substring collisions, e.g. "Bone" vs "Dragon Bone").
function parseMuseumBuild(build) {
  if (!build?.museum) return null;
  const modStr = build.museum.modifier || '';

  // Primary mutation: first mutation label found anywhere in the modifier string.
  const primaryMut = parseMutFromString(modStr);

  // Dagger mutation: mutation named after the first ‡ in the modifier string.
  let daggerMut = null;
  const di = modStr.indexOf('‡');
  if (di >= 0) daggerMut = parseMutFromString(modStr.slice(di + 1));

  const result = {};
  RARITIES.forEach(r => {
    result[r.id] = Array(r.slots).fill(null);
    const entries = build.museum[r.id];
    if (!Array.isArray(entries)) return;

    // Longest-first prevents "Bone" matching inside "Dragon Bone" etc.
    const sortedOres = [...ORES[r.id]].sort((a, b) => b.name.length - a.name.length);

    let slotIdx = 0;
    for (const entry of entries) {
      if (slotIdx >= r.slots) break;

      // "pick N:" prefix means this entry fills N consecutive slots from its pool.
      const pickMatch = entry.match(/^[A-Z+\-]*\s*pick\s+(\d+):\s*(.*)/i);
      const pickCount = pickMatch ? parseInt(pickMatch[1]) : 1;
      const body = pickMatch ? pickMatch[2] : entry;

      const parts = body.split(/\s*\|\s*/).map(p => p.trim()).filter(Boolean);
      const oreOpts = parts.map(part => {
        const hasDagger = part.includes('‡');
        const clean = part.replace(/‡/g, '').trim();
        const ore = sortedOres.find(o => clean.includes(o.name));
        return ore ? { ore, hasDagger } : null;
      }).filter(Boolean);

      for (let p = 0; p < pickCount && slotIdx < r.slots; p++, slotIdx++) {
        const primary = oreOpts[p] ?? oreOpts[0];
        if (!primary) continue;
        const mut = primary.hasDagger ? (daggerMut ?? primaryMut) : primaryMut;
        const alts = oreOpts.filter((_, ai) => ai !== p).map(opt => ({
          ore: opt.ore,
          mutation: opt.hasDagger ? (daggerMut ?? primaryMut) : primaryMut,
        }));
        result[r.id][slotIdx] = { ore: primary.ore, mutation: mut, alts: alts.length ? alts : undefined };
      }
    }
  });
  return result;
}

function runMetaBuildFill(buildId) {
  const build = META_BUILDS.find(b => b.id === buildId);
  if (!build?.museum) return;
  const parsed = parseMuseumBuild(build);
  if (!parsed) return;
  RARITIES.forEach(r => { museumSlots[r.id] = parsed[r.id] || Array(r.slots).fill(null); });
  activePreset = buildId;
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
function mutateAll(mutId) {
  const mut = mutId ? MUTATIONS.find(m => m.id === mutId) : null;
  RARITIES.forEach(r => { museumSlots[r.id].forEach(s => { if (s) s.mutation = mut; }); });
  activePreset = null; persistSlots(); rerender();
}
function setTarget(rarity, idx) {
  targetSlot = { active: true, rarity, idx }; openDropdown = null; rerender();
}
function equip(rarity, oreName) {
  // Prevent the same ore appearing in two slots of the same rarity
  if (museumSlots[rarity].some(s => s?.ore.name === oreName)) return;
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
  // Simplified display precision: 2dp for low-value rarities, 3dp for epic+
  const precision = ['common', 'uncommon', 'rare'].includes(r.id) ? 2 : 3;

  const oreEffs = slot.ore.effects.map(e =>
    `<div class="mv-eff"><span class="${STAT_CONFIG[e.stat].css}">${STAT_CONFIG[e.stat].label}</span>
     <span class="mv-eff-v">${e.max < 0 ? '−' : '+'}${Math.abs(e.max).toFixed(2)}x</span></div>`).join('');

  // Mutation stats — always padded to MAX_MUT_ROWS so slot height is stable regardless of mutation choice
  const MAX_MUT_ROWS = 3;
  const mutRows = [];
  if (slot.mutation) {
    slot.mutation.stats.forEach(st => {
      const boost = mutBoost(slot.mutation.id, st, r.id);
      const is2x = slot.mutation.id === 'treasured' && st === 'luck';
      const labelHtml = is2x
        ? `${STAT_CONFIG[st].label} <span class="mv-2x">×2</span>`
        : STAT_CONFIG[st].label;
      mutRows.push(`<div class="mv-eff"><span class="${STAT_CONFIG[st].css}">${labelHtml}</span>
        <span class="mv-eff-v">+${boost.toFixed(precision)}x</span></div>`);
    });
  } else {
    mutRows.push(`<div class="mv-eff mv-eff-muted"><span class="mv-faint">— no modifier</span></div>`);
  }
  while (mutRows.length < MAX_MUT_ROWS) {
    mutRows.push(`<div class="mv-eff mv-eff-spacer"></div>`);
  }
  const mutStatRows = mutRows.join('');

  // Dropdown: show "Luck×2" for Treasured so users see the bonus before selecting
  let menu = `<div class="cd-item" data-act="set-mut" data-r="${r.id}" data-i="${idx}" data-mut="">
      <span class="cd-name" style="color:var(--muted-2)">No Modifier</span></div>`;
  MUTATIONS.forEach(m => {
    const col = museumMutationColor(m.id);
    const effs = m.stats.map(st => {
      const is2x = m.id === 'treasured' && st === 'luck';
      return `<span class="${STAT_CONFIG[st].css}">${is2x ? `${STAT_CONFIG[st].label}×2` : STAT_CONFIG[st].label}</span>`;
    }).join(' + ');
    menu += `<div class="cd-item" data-act="set-mut" data-r="${r.id}" data-i="${idx}" data-mut="${m.id}">
      <span class="cd-name" style="color:${col}">${escapeHtml(m.label)}</span><span class="cd-effs">${effs}</span></div>`;
  });
  const mutColor = slot.mutation ? museumMutationColor(slot.mutation.id) : null;
  const mutLabel = slot.mutation ? slot.mutation.label : 'Select Modifier';

  // OR alternatives: only unequipped ores from this rarity.
  // Preset-filled slots use slot.alts (explicit alternatives). Manual slots use same primary stat.
  const equippedInRarity = new Set(museumSlots[r.id].map(s => s?.ore.name).filter(Boolean));
  let altChips = [];
  if (slot.alts?.length) {
    altChips = slot.alts
      .map((alt, oi) => ({ alt, oi }))
      .filter(({ alt }) => !equippedInRarity.has(alt.ore.name))
      .slice(0, 4)
      .map(({ alt, oi }) =>
        `<button class="mv-alt-chip" data-act="use-alt" data-r="${r.id}" data-i="${idx}" data-alt="${oi}">${escapeHtml(alt.ore.name)}</button>`
      );
  } else if (slot.ore.effects.length > 0) {
    const primaryStat = slot.ore.effects[0].stat;
    altChips = ORES[r.id]
      .filter(o => o.name !== slot.ore.name && !equippedInRarity.has(o.name) && o.effects[0]?.stat === primaryStat)
      .slice(0, 4)
      .map(o =>
        `<button class="mv-alt-chip" data-act="equip-alt" data-r="${r.id}" data-i="${idx}" data-ore="${escapeHtml(o.name)}">${escapeHtml(o.name)}</button>`
      );
  }
  // Always render alts container — min-height in CSS keeps slot height stable even when empty
  const altsHtml = `<div class="mv-slot-alts">${altChips.length ? `<span class="mv-alt-label">or</span>${altChips.join('')}` : ''}</div>`;

  return `
    <div class="mv-slot filled" style="--slot-color:${r.color}">
      <button class="mv-slot-clear" data-act="clear-slot" data-r="${r.id}" data-i="${idx}" title="Remove">✕</button>
      <div class="mv-slot-name">${escapeHtml(slot.ore.name)}</div>
      <div class="custom-dropdown ${openDropdown === ddId ? 'open' : ''}">
        <div class="cd-trigger" data-act="dd-toggle" data-dd="${ddId}">
          <span class="cd-label" style="color:${mutColor || 'var(--muted-2)'}">${escapeHtml(mutLabel)}</span>
          <span class="cd-caret">▼</span>
        </div>
        <div class="cd-menu">${menu}</div>
      </div>
      <div class="mv-slot-group"><div class="mv-slot-glabel">Ore Stats</div><div class="mv-effs">${oreEffs}</div></div>
      <div class="mv-slot-group"><div class="mv-slot-glabel">Modifier Stats</div><div class="mv-effs">${mutStatRows}</div></div>
      ${altsHtml}
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
    const actCell = eq
      ? `<td class="mv-row-act"><span class="mv-row-unequip">✕ Remove</span></td>`
      : `<td class="mv-row-act"><span class="mv-row-equip">+ Equip</span></td>`;
    return `<tr class="${eq ? 'equipped' : ''}" data-act="${eq ? 'unequip-ore' : 'equip'}" data-r="${r.id}" data-ore="${escapeHtml(ore.name)}">
      <td style="color:${r.color}">${escapeHtml(ore.name)}</td><td>${ore.kg || '--'}</td><td>${effs}</td><td>${maxes}</td>${actCell}</tr>`;
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
      </div>
      ${summary ? `<div class="mv-rarity-summary">${summary}</div>` : ''}
      <div class="mv-slots">${slots}</div>
      <div class="mv-table-wrap"><table class="mv-table">
        <thead><tr><th>Ore</th><th>Min KG</th><th>Bonus</th><th>Max Boost</th><th></th></tr></thead>
        <tbody>${body || `<tr><td colspan="4" class="mv-faint" style="text-align:center">All ores hidden by filter</td></tr>`}</tbody>
      </table></div>
    </section>`;
}

function totalsHtml() {
  const totals = grandTotals();
  const rows = STAT_ORDER.filter(st => totals[st]).map(st => {
    const v = totals[st];
    // Build per-rarity breakdown for hover tooltip
    const breakdown = RARITIES
      .map(r => { const rt = rarityTotals(r.id); return rt[st] ? `${r.id}: +${rt[st].toFixed(3)}x` : null; })
      .filter(Boolean).join('  |  ');
    return `<div class="mv-stat-line ${STAT_CONFIG[st].css}" title="${escapeHtml(breakdown)}">
      <span class="mv-stat-v">x${(1 + v).toFixed(2)}</span><span>${STAT_CONFIG[st].label}</span></div>`;
  }).join('');
  return rows || `<span class="mv-faint" style="font-size:12px">No boosts active.</span>`;
}

export function renderMuseumTab(root) {
  mountRoot = root;
  const equipped = getEquipped();

  // Sidebar preset buttons — one group per build type (Luck / Hybrid / Farming)
  const metaPresetBtns = META_TYPES.map(type => {
    const builds = MUSEUM_META.filter(b => b.type === type);
    const typeColor = builds[0].typeColor;
    const btns = builds.map(b =>
      `<button class="mv-preset ${activePreset === b.id ? 'active' : ''}" data-act="meta-fill" data-bid="${b.id}"
         title="${escapeHtml(b.museum.modifier || b.description || '')}">
        <span class="mv-meta-dot" style="background:${b.typeColor}"></span>${escapeHtml(b.name)}</button>`
    ).join('');
    return `<div class="mv-meta-group">
      <div class="mv-meta-type-hd" style="color:${typeColor}">${escapeHtml(type)}</div>${btns}</div>`;
  }).join('');

  const buildKeys = Object.keys(localBuilds);
  const buildsList = buildKeys.length
    ? buildKeys.map(name => `<div class="mv-build" data-act="load" data-name="${escapeHtml(name)}">
        <span class="mv-build-name">${escapeHtml(name)}</span>
        <span class="mv-build-acts">
          <button class="mv-build-btn" data-act="rename" data-name="${escapeHtml(name)}" title="Rename">✎</button>
          <button class="mv-build-btn del" data-act="del" data-name="${escapeHtml(name)}" title="Delete">✕</button>
        </span></div>`).join('')
    : `<div class="mv-faint" style="font-size:11px">No saved builds yet.</div>`;

  const filterBar = STAT_ORDER.filter(st => st !== 'dig_amount').map(statChip).join('');
  const anyHidden = hiddenStats.size > 0;

  root.innerHTML = `
  <div class="museum-view ${statsMin ? 'stats-min' : ''}">
    <aside class="mv-sidebar">
      <div class="mv-side-sec">
        <div class="mv-side-label">Meta Museum Builds</div>
        <div class="mv-presets">${metaPresetBtns}</div>
      </div>
      <div class="mv-side-sec">
        <div class="mv-side-label">Mutate All Slots</div>
        <div class="mv-mutall-chips">
          ${MUTATIONS.map(m => `<button class="mv-mutall-chip" data-act="mutate-all" data-mut="${m.id}" style="color:${museumMutationColor(m.id)}" title="${escapeHtml(m.label)}">${escapeHtml(m.label)}</button>`).join('')}
          <button class="mv-mutall-chip mv-mutall-none" data-act="mutate-all" data-mut="">Clear All</button>
        </div>
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
          <tr><th>Rarity</th><th>Base</th><th>Mut ×1</th></tr>
          <tr><td>Common</td><td>0.05x</td><td>0.005x</td></tr>
          <tr><td>Uncommon</td><td>0.075x</td><td>0.0075x</td></tr>
          <tr><td>Rare</td><td>0.125x</td><td>0.0125x</td></tr>
          <tr><td>Epic</td><td>0.20x</td><td>0.02x</td></tr>
          <tr><td>Legendary</td><td>0.30x</td><td>0.03x</td></tr>
          <tr><td>Mythic</td><td>0.50x</td><td>0.05x</td></tr>
          <tr><td>Exotic</td><td>1.00x</td><td>0.08x</td></tr>
        </table>
        <div class="mv-side-label" style="margin-top:12px">Mutation Stat Boosts</div>
        <div class="mv-mut-legend">
          ${MUTATIONS.map(m => {
            const col = museumMutationColor(m.id);
            const statsStr = m.stats.map(st => {
              const is2x = m.id === 'treasured' && st === 'luck';
              return is2x ? `${STAT_CONFIG[st].label}×2` : STAT_CONFIG[st].label;
            }).join(' + ');
            return `<div class="mv-mut-row">
              <span class="mv-mut-name" style="color:${col}">${escapeHtml(m.label)}</span>
              <span class="mv-mut-stats">${statsStr}</span>
            </div>`;
          }).join('')}
        </div>
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
    const { act, r, i, ore, dd, mut, stat, name } = el.dataset;
    switch (act) {
      case 'target': setTarget(r, +i); break;
      case 'equip': equip(r, ore); break;
      case 'unequip-ore': {
        const oreIdx = museumSlots[r].findIndex(s => s?.ore.name === ore);
        if (oreIdx !== -1) { museumSlots[r][oreIdx] = null; activePreset = null; persistSlots(); rerender(); }
        break;
      }
      case 'clear-slot': clearSlot(r, +i); break;
      case 'clear-all': clearAll(); break;
      case 'dd-toggle': openDropdown = openDropdown === dd ? null : dd; rerender(); break;
      case 'set-mut': setMutation(r, +i, mut || null); break;
      case 'meta-fill': runMetaBuildFill(el.dataset.bid); break;
      case 'use-alt': {
        const slot = museumSlots[r]?.[+i];
        if (!slot?.alts) break;
        const ai = +el.dataset.alt;
        const alt = slot.alts[ai];
        if (!alt) break;
        // Swap: the tapped alt becomes primary; the old primary moves to front of alts list.
        const prevOre = slot.ore, prevMut = slot.mutation;
        slot.ore = alt.ore;
        slot.mutation = alt.mutation;
        slot.alts = [{ ore: prevOre, mutation: prevMut }, ...slot.alts.filter((_, j) => j !== ai)];
        activePreset = null;
        persistSlots(); rerender();
        break;
      }
      case 'equip-alt': {
        // Replace a specific slot with an unequipped same-stat ore (manual alt chip)
        if (museumSlots[r]?.some(s => s?.ore.name === ore)) break;
        const oreObj = ORES[r]?.find(o => o.name === ore);
        if (!oreObj) break;
        const keepMut = museumSlots[r]?.[+i]?.mutation ?? null;
        museumSlots[r][+i] = { ore: oreObj, mutation: keepMut };
        activePreset = null; persistSlots(); rerender();
        break;
      }
      case 'mutate-all': mutateAll(el.dataset.mut || null); break;
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

function rerender() {
  if (!mountRoot) return;
  const sy = window.scrollY;
  renderMuseumTab(mountRoot);
  window.scrollTo({ top: sy, behavior: 'instant' });
}

// Restore the last-edited museum on first load.
applyData(readJSON(LS_SLOTS, null));
