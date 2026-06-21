// ---------------------------------------------------------------------------
// optimizerPanel.js — the ⚡ Auto-Optimize modal.
// ---------------------------------------------------------------------------

import { state, applyOptimized, getBuffs, getMuseum, setBuffsAll } from '../core/store.js';
import { optimizeDeep, RUNE_CANDIDATE_IDS } from '../core/optimizer.js';
import { buildMetrics } from '../core/metrics.js';
import { getItem, getMutations, getItems } from '../core/db.js';
import { rarityColor, rarityLabel } from '../core/config.js';
import { escapeHtml, mutColor } from './helpers.js';

let overlay = null;
let openedAt = 0;
let lastResult = null;
let resultsReady = false;

const ROLLS = [80, 85, 90, 95, 100];
const DEFAULT_LOCKED_RUNES = ['rune-summit-seeker', 'rune-speed-1', 'rune-mountain-climber'];

// Coin / Shard / Traveler IDs matching buffsModel.js
const COINS = ['buff_basic_luck','buff_basic_cap','buff_volc_luck','buff_volc_str',
               'buff_frozen_luck','buff_frozen_speed','buff_witches_brew','buff_cosmic'];
const SHARDS = ['buff_greater_luck','buff_greater_cap','buff_supreme_luck',
                'buff_cryonic_brew','buff_ambrosia','buff_stardust_shake','buff_merchant'];
const TRAVELERS = ['buff_instability','buff_quake','buff_blitz'];
const PERMS = ['buff_mvp_economist','buff_spirits','buff_ancient','buff_museum','buff_lighthouse'];

function coinsObj()   { return Object.fromEntries(COINS.map(id    => [id, true])); }
function shardsObj()  { return Object.fromEntries(SHARDS.map(id   => [id, true])); }
function travelObj()  { return Object.fromEntries(TRAVELERS.map(id => [id, true])); }
function permsObj()   { return Object.fromEntries(PERMS.map(id    => [id, true])); }

// Preset buff configurations. Returned objects are consumed read-only.
const BUFF_PRESETS = [
  {
    id: 'build_a',
    label: 'Build A',
    desc: 'Use your current Build A buffs',
    fn: () => null, // sentinel — handled specially
  },
  {
    id: 'no_buffs',
    label: 'No Buffs',
    desc: 'Coin potions only',
    fn: () => ({ ...coinsObj() }),
  },
  {
    id: 'basic',
    label: 'Basic',
    desc: 'Coins · Dredge 10 · Login 3',
    fn: () => ({ ...coinsObj(), buff_dredge: 10, buff_login: 3 }),
  },
  {
    id: 'medium',
    label: 'Medium',
    desc: 'Luck/Str/Lum Totems · Coins · Dredge 50 · Login 10 · 5 Friends',
    fn: () => ({
      totem_luck: true, totem_strength: true, totem_luminant: true,
      ...coinsObj(),
      buff_dredge: 50, buff_login: 10, friend_bonus: 5,
    }),
  },
  {
    id: 'advanced',
    label: 'Advanced',
    desc: 'All Totems (10 friends) · Coins · Dredge 100 · Login 20 · 5 Friends',
    fn: () => ({
      totem_luck: true, totem_strength: true, totem_luminant: true, totem_friendship: 10,
      ...coinsObj(),
      buff_dredge: 100, buff_login: 20, friend_bonus: 5,
    }),
  },
  {
    id: 'max',
    label: 'Max',
    desc: 'Everything (excl. events) · Dredge 500 · Login 50 · All Shards',
    fn: () => ({
      totem_luck: true, totem_strength: true, totem_luminant: true, totem_friendship: 20,
      ...coinsObj(), ...shardsObj(), ...travelObj(), ...permsObj(),
      buff_dredge: 500, buff_login: 50,
      mastery_bonus: '1.25', friend_bonus: 5,
    }),
  },
];

const params = {
  starTier: 6,
  rollPct: 100,
  mutation: 'prismatic',
  lockedRunes: new Set(DEFAULT_LOCKED_RUNES),
  lockedSlots: new Set(),
  buffPreset: 'build_a',
};

function getEffectiveBuffs() {
  const p = BUFF_PRESETS.find(x => x.id === params.buffPreset);
  if (!p || p.fn() === null) return getBuffs('a');
  return p.fn();
}

export function openOptimizer() {
  ensureOverlay();
  overlay.classList.add('open');
  openedAt = performance.now();
  renderShell();
}
export function closeOptimizer() { overlay?.classList.remove('open'); }

function ensureOverlay() {
  if (overlay) return;
  overlay = document.createElement('div');
  overlay.className = 'opt-overlay';
  overlay.innerHTML = `<div class="opt-modal" role="dialog" aria-modal="true" aria-label="Auto-Optimizer"></div>`;
  overlay.addEventListener('click', e => {
    if (e.target === overlay && performance.now() - openedAt > 300) closeOptimizer();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeOptimizer();
  });
  document.body.appendChild(overlay);
}

const modal = () => overlay.querySelector('.opt-modal');

function head() {
  return `<div class="opt-head">
    <div>
      <h2>⚡ Auto-Optimize</h2>
      <p class="opt-sub">Best loadouts for <b>Rolls/sec</b> — accessories, runes &amp; pan enchant.
      Shows top-10 Trinket builds + top-10 Standard builds.</p>
    </div>
    <button class="opt-close" aria-label="Close">✕</button>
  </div>`;
}

const MUT_SUBSORT = { 'Diamond': 0, 'Granite': 1, 'Overclocked': 2 };
function sortedMutations() {
  return [...getMutations()].sort((a, b) => {
    if (a.multiplier !== b.multiplier) return a.multiplier - b.multiplier;
    return (MUT_SUBSORT[a.name] ?? 99) - (MUT_SUBSORT[b.name] ?? 99);
  });
}

const RUNE_SHORT = {
  'rune-summit-seeker':   'Summit',
  'rune-mountain-climber':'Mountain',
  'rune-speed-1':         'Speed I',
  'rune-purity':          'Purity',
  'rune-solitude':        'Solitude',
  'rune-sunblessed':      'Sunblessed',
  'rune-abyssal':         'Abyssal',
  'rune-eternity':        'Eternity',
};

function seg(paramKey, opts) {
  return opts.map(o =>
    `<button type="button" class="opt-seg-btn${o.on ? ' on' : ''}" data-p="${paramKey}" data-v="${o.v}">${o.label}</button>`
  ).join('');
}

function buildParamsBar(withStartBtn) {
  const muts = sortedMutations();
  const stars = seg('star', [5, 6].map(s => ({ v: s, label: `${s}★`, on: params.starTier === s })));
  const rolls = seg('roll', ROLLS.map(r => ({ v: r, label: `${r}%`, on: params.rollPct === r })));

  const mutChips = [
    `<button type="button" class="opt-mut-chip${!params.mutation ? ' on' : ''}" data-mut="">
      <span class="opt-mut-dot" style="background:#555"></span>None
    </button>`,
    ...muts.map(m => {
      const col = mutColor(m.multiplier);
      return `<button type="button" class="opt-mut-chip${params.mutation === m.id ? ' on' : ''}" data-mut="${m.id}"
        style="--mc:${col}" title="×${m.multiplier}">
        <span class="opt-mut-dot"></span>${escapeHtml(m.name)}<span class="opt-mut-mult"> ×${m.multiplier}</span>
      </button>`;
    }),
  ].join('');

  const runeItems = getItems('runes') || [];
  const runeChips = RUNE_CANDIDATE_IDS.map(id => {
    const item = runeItems.find(r => r.id === id);
    const on = params.lockedRunes.has(id);
    return `<button type="button" class="opt-rune-chip${on ? ' on' : ''}" data-rune="${id}" title="${escapeHtml(item?.name || id)}">
      ${escapeHtml(RUNE_SHORT[id] || id)}
    </button>`;
  }).join('');

  const lc = params.lockedRunes.size;
  const fs = 5 - lc;
  const runeSub = `${lc} locked · ${fs > 0 ? fs + ' flexible' : 'all locked'}`;

  const ringCount = state.ringsUnlocked ? 8 : 6;
  const lockSlots = [
    { key: 'necklace', label: 'Necklace' },
    { key: 'charm',    label: 'Charm' },
    ...Array.from({ length: ringCount }, (_, i) => ({ key: `ring${i + 1}`, label: `Ring ${i + 1}` })),
  ];
  const lockChips = lockSlots.map(s => {
    const on = params.lockedSlots.has(s.key);
    return `<button type="button" class="opt-lock-chip${on ? ' on' : ''}" data-slot="${s.key}">${s.label}</button>`;
  }).join('');

  const buffChips = BUFF_PRESETS.map(p =>
    `<button type="button" class="opt-buff-pill${params.buffPreset === p.id ? ' on' : ''}" data-preset="${p.id}" title="${escapeHtml(p.desc)}">${escapeHtml(p.label)}</button>`
  ).join('');

  const startBtn = withStartBtn
    ? `<button class="opt-start-btn" type="button">⚡ Start Search</button>`
    : '';

  return `<div class="opt-params">
    <div class="opt-pgroup">
      <span class="opt-plabel">Star</span>
      <div class="opt-seg">${stars}</div>
    </div>
    <div class="opt-pgroup">
      <span class="opt-plabel">Roll %</span>
      <div class="opt-seg">${rolls}</div>
    </div>
    <div class="opt-pgroup">
      <span class="opt-plabel">Mutation</span>
      <div class="opt-mut-chips">${mutChips}</div>
    </div>
    <div class="opt-pgroup">
      <span class="opt-plabel">Runes <span class="opt-plabel-sub" id="opt-rune-sub">${runeSub}</span></span>
      <div class="opt-rune-chips">${runeChips}</div>
    </div>
    <div class="opt-pgroup">
      <span class="opt-plabel">Fix slots <span class="opt-plabel-sub">locked = keep current item</span></span>
      <div class="opt-lock-chips">${lockChips}</div>
    </div>
    <div class="opt-pgroup">
      <span class="opt-plabel">Buffs</span>
      <div class="opt-buff-pills">${buffChips}</div>
    </div>
    ${startBtn}
  </div>`;
}

function wireParamsBar(container, onStart) {
  container.querySelectorAll('.opt-seg-btn').forEach(btn => btn.addEventListener('click', () => {
    const v = Number(btn.dataset.v);
    if (btn.dataset.p === 'star') params.starTier = v; else params.rollPct = v;
    btn.parentElement.querySelectorAll('.opt-seg-btn').forEach(x => x.classList.toggle('on', x === btn));
  }));

  container.querySelectorAll('.opt-mut-chip').forEach(chip => chip.addEventListener('click', () => {
    params.mutation = chip.dataset.mut;
    container.querySelectorAll('.opt-mut-chip').forEach(x => x.classList.toggle('on', x === chip));
  }));

  container.querySelectorAll('.opt-rune-chip').forEach(chip => chip.addEventListener('click', () => {
    const id = chip.dataset.rune;
    if (params.lockedRunes.has(id)) params.lockedRunes.delete(id);
    else params.lockedRunes.add(id);
    chip.classList.toggle('on', params.lockedRunes.has(id));
    const sub = container.querySelector('#opt-rune-sub');
    if (sub) {
      const lc2 = params.lockedRunes.size, fs2 = 5 - lc2;
      sub.textContent = `${lc2} locked · ${fs2 > 0 ? fs2 + ' flexible' : 'all locked'}`;
    }
  }));

  container.querySelectorAll('.opt-lock-chip').forEach(chip => chip.addEventListener('click', () => {
    const k = chip.dataset.slot;
    if (params.lockedSlots.has(k)) params.lockedSlots.delete(k); else params.lockedSlots.add(k);
    chip.classList.toggle('on', params.lockedSlots.has(k));
  }));

  container.querySelectorAll('.opt-buff-pill').forEach(btn => btn.addEventListener('click', () => {
    params.buffPreset = btn.dataset.preset;
    container.querySelectorAll('.opt-buff-pill').forEach(x => x.classList.toggle('on', x === btn));
  }));

  container.querySelector('.opt-start-btn')?.addEventListener('click', onStart);
}

function renderShell() {
  const m = modal();
  m.innerHTML = `${head()}${buildParamsBar(true)}<div class="opt-results"></div>`;
  m.querySelector('.opt-close').addEventListener('click', closeOptimizer);
  wireParamsBar(m, () => solve());

  if (resultsReady && lastResult) {
    const area = m.querySelector('.opt-results');
    const ringCount = state.ringsUnlocked ? 8 : 6;
    const current = buildMetrics(state.build, getBuffs('a'), getMuseum('a')).rollsPerSec || 0;
    renderResults(area, lastResult, ringCount, current);
  }
}

function solve() {
  const area = modal().querySelector('.opt-results');
  area.innerHTML = `
    <div class="opt-loading">
      <div class="opt-spinner"></div>
      <p class="opt-status">Sweeping gear combinations…</p>
      <div class="opt-progress-wrap"><div class="opt-progress-bar" style="width:0%"></div></div>
    </div>`;

  const ringCount = state.ringsUnlocked ? 8 : 6;
  const current = buildMetrics(state.build, getBuffs('a'), getMuseum('a')).rollsPerSec || 0;
  const effectiveBuffs = getEffectiveBuffs();
  const isPreset = params.buffPreset !== 'build_a';

  const setProgress = (pct, bestRPS) => {
    const bar    = area.querySelector('.opt-progress-bar');
    const status = area.querySelector('.opt-status');
    if (bar) bar.style.width = pct + '%';
    if (status) {
      if (pct < 5)       status.textContent = 'Sweeping gear combinations…';
      else if (pct < 70) status.textContent = `Coarse museum for all builds…${bestRPS > 0 ? '  ' + bestRPS.toFixed(2) + ' rolls/s best so far' : ''}`;
      else               status.textContent = 'Refining top builds…';
    }
  };

  optimizeDeep({
    contextBuild: state.build,
    buffs: effectiveBuffs,
    ringCount,
    lockedSlots: [...params.lockedSlots],
    lockedRunes: [...params.lockedRunes],
    candidateConfig: { starTier: params.starTier, rollPct: params.rollPct, mutation: params.mutation },
    museumBudget: 6.0,
    museumCap: 3.5,
    searchRunes: true,
    searchEnchant: true,
  }, setProgress).then(result => {
    lastResult = result;
    lastResult._effectiveBuffs = isPreset ? effectiveBuffs : null;
    lastResult._buffPreset = params.buffPreset;
    resultsReady = true;
    renderResults(area, result, ringCount, current);
  }).catch(err => {
    console.error('[optimizer]', err);
    area.innerHTML = `<div class="opt-empty">Optimizer error.<br><code>${escapeHtml(err.message || String(err))}</code></div>`;
  });
}

// ---- Results rendering -----------------------------------------------------

function catOf(slotKey) {
  if (slotKey === 'necklace') return 'necklaces';
  if (slotKey === 'charm')    return 'charms';
  return 'rings';
}

function accessoryChip(acc) {
  if (!acc.itemId) return `<span class="opt-chip empty">${escapeHtml(acc.slotLabel)}: —</span>`;
  const item  = getItem(catOf(acc.slotKey), acc.itemId);
  const color = item ? rarityColor(item.rarity) : 'var(--muted)';
  return `<span class="opt-chip" style="--rc:${color}" title="${escapeHtml(acc.slotLabel)} · ${escapeHtml(rarityLabel(item?.rarity))}">
    ${escapeHtml(item?.name || acc.itemId)}</span>`;
}

function museumSummary(m) {
  return Object.entries(m || {})
    .map(([stat, v]) => ({ stat, pct: Math.round((Number(v) - 1) * 100) }))
    .filter(x => x.pct > 0)
    .sort((a, b) => b.pct - a.pct)
    .map(x => `+${x.pct}% ${x.stat}`)
    .join(' · ') || 'none';
}

function runeComboLabel(rc) {
  if (!rc?.length) return 'unchanged';
  return rc.map(r => RUNE_SHORT[r.id] || r.name).join(', ');
}

function card(b, current, globalBest) {
  const isTop = b === globalBest;
  const relPct = globalBest?.rollsPerSec > 0 ? (b.rollsPerSec / globalBest.rollsPerSec) * 100 : 100;
  const vsCurrent = current > 0 ? ((b.rollsPerSec / current - 1) * 100) : 0;
  const deltaTag = current > 0
    ? `<span class="opt-delta ${vsCurrent >= 0 ? 'up' : 'down'}">${vsCurrent >= 0 ? '+' : ''}${vsCurrent.toFixed(1)}% vs current</span>`
    : '';
  const trinketBadge = b.hasUmbrella ? `<span class="opt-trinket-badge">🏖 Trinket</span>` : '';
  return `<button class="opt-card${isTop ? ' best' : ''}" data-rank="${b.rank}">
    <div class="opt-card-top">
      <span class="opt-rank">#${b.rank}</span>
      ${trinketBadge}
      <span class="opt-rps">${b.rollsPerSec.toFixed(2)}<small>rolls/s</small></span>
      <span class="opt-rel">${relPct.toFixed(1)}%</span>
    </div>
    <div class="opt-chips">${b.accessories.map(accessoryChip).join('')}</div>
    <div class="opt-rune-row"><span class="opt-museum-tag">Runes</span> ${escapeHtml(runeComboLabel(b.runeCombo))}</div>
    <div class="opt-enchant-row"><span class="opt-museum-tag">Pan enchant</span> ${escapeHtml(b.enchantItem?.name || 'None')}</div>
    <div class="opt-museum"><span class="opt-museum-tag">Museum</span> ${escapeHtml(museumSummary(b.museum))}</div>
    <div class="opt-card-foot">${deltaTag}<span class="opt-apply">Load into Build B →</span></div>
  </button>`;
}

function buildSection(title, builds, current, globalBest) {
  if (!builds.length) return '';
  return `<div class="opt-section">
    <div class="opt-section-title">${title} <span class="opt-section-count">${builds.length}</span></div>
    <div class="opt-cards">${builds.map(b => card(b, current, globalBest)).join('')}</div>
  </div>`;
}

function renderResults(area, result, ringCount, current) {
  if (!result.ok || !result.topBuilds.length) {
    area.innerHTML = `<div class="opt-empty">No loadouts to suggest. Add some item data or unlock slots and try again.</div>`;
    return;
  }

  const all = result.topBuilds;
  const globalBest = all[0];
  const trinket    = all.filter(b =>  b.hasUmbrella).slice(0, 10);
  const nonTrinket = all.filter(b => !b.hasUmbrella).slice(0, 10);

  const s = result.stats;
  const mutName = params.mutation
    ? (sortedMutations().find(m => m.id === params.mutation)?.name || params.mutation)
    : 'no mutation';
  const budgetPct = Math.round((s.museumBudget ?? 3) * 100);
  const capPct    = Math.round((s.museumCap    ?? 0.8) * 100);
  const presetLabel = BUFF_PRESETS.find(p => p.id === result._buffPreset)?.label || '';
  const buffNote = result._buffPreset && result._buffPreset !== 'build_a'
    ? ` · Buffs: ${presetLabel} (applied to Build B on copy)`
    : '';

  area.innerHTML = `
    <div class="opt-context">
      Optimizing <b>Necklace, Charm, ${ringCount} Rings, Runes &amp; Pan Enchant</b> · keeping your Shovel fixed.
      ${current > 0 ? `Current: <b>${current.toFixed(2)} rolls/s</b>.` : ''}
      <br><small class="opt-budget-note">Museum budget: +${budgetPct}% total · +${capPct}% max per stat${escapeHtml(buffNote)}</small>
    </div>
    <div class="opt-sections">
      ${buildSection('🏖 Trinket Builds', trinket, current, globalBest)}
      ${buildSection('⛏ Standard Builds', nonTrinket, current, globalBest)}
    </div>
    <div class="opt-foot-note">
      <span class="opt-badge">${escapeHtml(s.label)}</span>
      Searched ${s.evaluated.toLocaleString()} gear combos across
      ${s.runeCombos} rune combos × ${s.enchantCandidates} pan enchants.
      Coarse museum for top-${all.length} combos (${(s.workerEvals ?? 0).toLocaleString()} evals).
      Assumes ★${params.starTier} / ${params.rollPct}% rolls / ${escapeHtml(mutName)}.
    </div>`;

  area.querySelectorAll('.opt-card').forEach(el => el.addEventListener('click', () => {
    const rank = Number(el.dataset.rank);
    const b = all.find(x => x.rank === rank);
    if (!b) return;
    applyOptimized(b.build, b.museum, 'a', 'b', `⚡ Optimized #${rank}`);
    if (result._effectiveBuffs) {
      setBuffsAll('b', result._effectiveBuffs);
    }
    closeOptimizer();
  }));
}
