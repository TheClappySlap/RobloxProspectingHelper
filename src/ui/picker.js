// ---------------------------------------------------------------------------
// picker.js — compact, anchored item selector.
// Two columns: a square item grid (with hover tooltips) on the left, and a
// sticky config (stars / per-stat rolls + ranges / mutation / enchant) on the
// right so the controls are reachable without scrolling past the list.
// Edits apply live to the build behind it.
// ---------------------------------------------------------------------------

import { SLOTS, SLOT_BY_KEY, STAT_BY_KEY, STAR_MULT, RARITY_ORDER, rarityColor, rarityLabel, mutationColor, enchantColor, isUniqueEquip } from '../core/config.js';
import { state, emptySlot, getBuild, setSlot } from '../core/store.js';
import { getItems, getItem, getMutations, enchantsFor, itemImage, getEnchant, trinketsFor } from '../core/db.js';
import { rolledAccessoryStats, overallQuality, getToolStats } from '../core/engine.js';
import { parseWikiStatString } from '../core/parse.js';
import { escapeHtml, fmt, h } from './helpers.js';

let dom = null;
let anchorRect = null;
let limitedOnly = false;
const QUALITY_PRESETS = [50, 70, 75, 80, 85, 90, 95, 100];

function build() {
  const overlay = h(`<div class="pop-overlay"></div>`);
  const pop = h(`
    <div class="popover" role="dialog">
      <div class="pop-head"><span class="pop-title"></span><button class="pop-close" aria-label="Close">✕</button></div>
      <div class="pop-grid">
        <div class="pop-left">
          <div class="pop-tabs"></div>
          <input class="pop-search" type="text" autocomplete="off">
          <div class="pop-rarities"></div>
          <div class="pop-tiles"></div>
        </div>
        <div class="pop-right"><div class="pop-config"></div></div>
      </div>
      <div class="pop-foot"><button class="pop-equip">✓ Equip</button></div>
    </div>`);
  const tip = h(`<div class="pop-tip"></div>`);
  document.body.append(overlay, pop, tip);

  overlay.addEventListener('click', close);
  pop.querySelector('.pop-close').addEventListener('click', close);
  pop.querySelector('.pop-equip').addEventListener('click', close);
  const search = pop.querySelector('.pop-search');
  search.addEventListener('input', () => { state.ui.search = search.value; renderTiles(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && state.ui.pickerOpen) close(); });

  dom = {
    overlay, pop, tip, search,
    title: pop.querySelector('.pop-title'),
    tabs: pop.querySelector('.pop-tabs'),
    rarities: pop.querySelector('.pop-rarities'),
    tiles: pop.querySelector('.pop-tiles'),
    config: pop.querySelector('.pop-config'),
  };
}

function slot() { return SLOT_BY_KEY[state.ui.activeSlot]; }

function commit() {
  setSlot(state.ui.activeRef, state.ui.activeSlot, { ...state.ui.draft, statRolls: { ...state.ui.draft.statRolls } });
}

export function openPicker(ref, slotKey, anchorEl) {
  if (!dom) build();
  anchorRect = anchorEl ? anchorEl.getBoundingClientRect() : null;
  const s = SLOT_BY_KEY[slotKey];
  state.ui.pickerOpen = true;
  state.ui.activeRef = ref;
  state.ui.activeSlot = slotKey;
  const cur = getBuild(ref)[slotKey];
  state.ui.draft = { ...emptySlot(), ...cur, statRolls: { ...(cur.statRolls || {}) } };
  state.ui.search = '';
  state.ui.rarityFilter = 'all';
  limitedOnly = false;

  dom.title.textContent = s.label;
  dom.search.value = '';
  dom.search.placeholder = `Search ${s.label.toLowerCase()}…`;
  dom.overlay.classList.add('open');
  dom.pop.classList.add('open');

  if (s.kind === 'rune') {
    dom.pop.classList.add('rune-mode');
  } else {
    dom.pop.classList.remove('rune-mode');
  }

  renderTabs();
  renderRarities();
  renderTiles();
  renderConfig();
  reposition();
  dom.search.focus();
}

export function close() {
  if (!dom) return;
  state.ui.pickerOpen = false;
  state.ui.activeSlot = null;
  state.ui.draft = null;
  hideTip();
  dom.overlay.classList.remove('open');
  dom.pop.classList.remove('open');
}

function reposition() {
  const pw = dom.pop.offsetWidth, ph = dom.pop.offsetHeight, pad = 10, gap = 10;
  if (!anchorRect) {
    dom.pop.style.left = `${Math.max(pad, (innerWidth - pw) / 2)}px`;
    dom.pop.style.top = `${Math.max(pad, (innerHeight - ph) / 2)}px`;
    return;
  }
  let left = anchorRect.right + gap;
  if (left + pw > innerWidth - pad) left = anchorRect.left - gap - pw;
  if (left < pad) left = Math.max(pad, (innerWidth - pw) / 2);
  let top = anchorRect.top;
  if (top + ph > innerHeight - pad) top = Math.max(pad, innerHeight - pad - ph);
  dom.pop.style.left = `${left}px`;
  dom.pop.style.top = `${top}px`;
}

// --- limited / all tabs -----------------------------------------------------
function renderTabs() {
  const hasLimited = getItems(slot().cat).some(i => i.limited);
  if (!hasLimited) { dom.tabs.style.display = 'none'; return; }
  dom.tabs.style.display = '';
  const base = s.label + 's';
  dom.tabs.innerHTML = [
    { ltd: false, label: base },
    { ltd: true,  label: `Limited ${base}` },
  ].map(t => `<button class="pop-tab${limitedOnly === t.ltd ? ' active' : ''}" data-ltd="${t.ltd}">${t.label}</button>`).join('');
  dom.tabs.querySelectorAll('.pop-tab').forEach(b => {
    b.addEventListener('click', () => {
      limitedOnly = b.dataset.ltd === 'true';
      state.ui.rarityFilter = 'all';
      renderTabs();
      renderRarities();
      renderTiles();
    });
  });
}

// --- rarity filter ----------------------------------------------------------
function renderRarities() {
  const items = getItems(slot().cat);
  const present = RARITY_ORDER.filter(r => items.some(i => (i.rarity || '').toLowerCase() === r));
  dom.rarities.innerHTML = '';
  if (!present.length) { dom.rarities.style.display = 'none'; return; }
  dom.rarities.style.display = '';
  const chip = (val, label, color) => {
    const b = h(`<button class="rar-chip${state.ui.rarityFilter === val ? ' active' : ''}">${label}</button>`);
    if (color) b.style.setProperty('--rc', color);
    b.addEventListener('click', () => { state.ui.rarityFilter = val; renderRarities(); renderTiles(); });
    return b;
  };
  dom.rarities.appendChild(chip('all', 'All'));
  present.forEach(r => dom.rarities.appendChild(chip(r, rarityLabel(r), rarityColor(r))));
}

// --- hover tooltip (PoE / Last Epoch style) --------------------------------
function tipStat(name, valueHtml) {
  const color = STAT_BY_KEY[name]?.color || 'var(--dark-ink)';
  return `<div class="tip-row"><span style="color:${color}">${escapeHtml(name)}</span><b>${valueHtml}</b></div>`;
}
function tipHtml(s, item) {
  let rows = '';
  if (s.kind === 'accessory') {
    // Show achievable ranges at ★5, no mutation.
    rolledAccessoryStats(item, { starTier: 5, rollPct: 100, statRolls: {} }).forEach(l => {
      rows += l.note
        ? `<div class="tip-note">${escapeHtml(l.name)}</div>`
        : tipStat(l.name, `${fmt(l.min)}–${fmt(l.max)}${l.unit === '%' ? '%' : ''}`);
    });
  } else if (s.kind === 'tool') {
    (item.toolStats || []).forEach(t => rows += tipStat(t.name, t.unit === 'x' ? '×' + t.value : '+' + t.value));
    if (item.passive) rows += `<div class="tip-note">${escapeHtml(item.passive)}</div>`;
  } else {
    (item.stats || []).forEach(str => rows += `<div class="tip-note">${escapeHtml(str)}</div>`);
  }
  const rar = item.rarity ? ` <span class="tip-rar" style="color:${rarityColor(item.rarity)}">${escapeHtml(rarityLabel(item.rarity))}</span>` : '';
  return `<div class="tip-name" style="color:${item.color || rarityColor(item.rarity)}">${escapeHtml(item.name)}${rar}</div>${rows}`;
}

function showTip(item, tileEl) {
  dom.tip.innerHTML = tipHtml(slot(), item);
  dom.tip.classList.add('open');
  const r = tileEl.getBoundingClientRect();
  const tw = dom.tip.offsetWidth, th = dom.tip.offsetHeight, pad = 8;
  let left = r.right + 8;
  if (left + tw > innerWidth - pad) left = r.left - 8 - tw;
  if (left < pad) left = pad;
  let top = Math.min(r.top, innerHeight - th - pad);
  dom.tip.style.left = `${Math.max(pad, left)}px`;
  dom.tip.style.top = `${Math.max(pad, top)}px`;
}
function hideTip() { dom.tip?.classList.remove('open'); }

/** Equip-once items already worn in OTHER accessory slots of this build. */
function uniqueEquippedElsewhere() {
  const b = getBuild(state.ui.activeRef);
  const set = new Set();
  SLOTS.forEach(sl => {
    if (sl.kind !== 'accessory' || sl.key === state.ui.activeSlot) return;
    const id = b[sl.key]?.itemId;
    if (!id) return;
    const it = getItem(sl.cat, id);
    if (it && isUniqueEquip(it)) set.add(id);
  });
  return set;
}

// --- item tiles (squares) ---------------------------------------------------
function renderTiles() {
  const s = slot();
  const search = (state.ui.search || '').toLowerCase();
  const rf = state.ui.rarityFilter;
  const items = getItems(s.cat).filter(i =>
    i.name.toLowerCase().includes(search) &&
    (rf === 'all' || (i.rarity || '').toLowerCase() === rf) &&
    (!limitedOnly || i.limited));
  // Equip-once rule: a unique item already worn elsewhere can't be picked again.
  const blocked = s.kind === 'accessory' ? uniqueEquippedElsewhere() : new Set();

  dom.tiles.innerHTML = '';
  const none = h(`<button class="tile none${!state.ui.draft.itemId ? ' selected' : ''}">
    <span class="tile-ico">∅</span><span class="tile-name">Empty slot</span></button>`);
  none.addEventListener('click', () => { state.ui.draft = emptySlot(); commit(); renderTiles(); renderConfig(); });
  dom.tiles.appendChild(none);

  items.forEach(item => {
    const selected = state.ui.draft.itemId === item.id;
    const dup = blocked.has(item.id); // equip-once item already worn in another slot
    const img = itemImage(item);
    let nameHtml = escapeHtml(item.name);
    if (selected && state.ui.draft.enchant && (s.kind === 'tool' || s.kind === 'accessory')) {
      const enc = getEnchant(state.ui.draft.enchant);
      if (enc) nameHtml = `<i style="color:${enchantColor(enc.id)}">${escapeHtml(enc.name)}</i> ${nameHtml}`;
    }

    const tile = h(`<button class="tile${selected ? ' selected' : ''}${dup ? ' disabled' : ''}"${dup ? ' aria-disabled="true" title="Only one can be equipped — already worn in another slot"' : ''}>
        <span class="tile-ico">${img ? `<img src="${escapeHtml(img)}" alt="" onerror="this.replaceWith(document.createTextNode('◆'))">` : '◆'}</span>
        <span class="tile-name" style="color:${item.color || rarityColor(item.rarity)}">${nameHtml}</span>
        ${item.limited ? `<span class="tile-ltd" title="Limited / Seasonal">✦</span>` : ''}
        ${dup ? `<span class="tile-lock" aria-hidden="true">1×</span>` : ''}
      </button>`);
    tile.style.setProperty('--rc', item.color || rarityColor(item.rarity));
    tile.addEventListener('mouseenter', () => showTip(item, tile));
    tile.addEventListener('mouseleave', hideTip);
    tile.addEventListener('click', () => {
      if (dup) return; // equip-once: block adding a second copy
      if (state.ui.draft.itemId !== item.id) state.ui.draft = { ...emptySlot(), itemId: item.id };
      hideTip();
      commit();
      renderTiles();
      renderConfig();
      reposition();
    });
    dom.tiles.appendChild(tile);
  });

  if (!items.length) dom.tiles.appendChild(h(`<div class="list-empty">No items match.</div>`));
}

// --- config (right column) --------------------------------------------------
function renderConfig() {
  const s = slot();
  const cfg = state.ui.draft;
  if (!cfg.itemId) { dom.config.innerHTML = `<div class="config-empty">Hover items to preview, click to equip.</div>`; return; }
  const item = getItem(s.cat, cfg.itemId);
  if (!item) { dom.config.innerHTML = ''; return; }

  let html = `<div class="cfg-head"><h3 style="color:${item.color || rarityColor(item.rarity)}">${escapeHtml(item.name)}</h3>${item.rarity ? `<span class="cfg-rarity" style="color:${rarityColor(item.rarity)}">${escapeHtml(item.rarity)}</span>` : ''}</div>`;

  if (cfg.enchant && (s.kind === 'tool' || s.kind === 'accessory')) {
    const enc = getEnchant(cfg.enchant);
    if (enc) {
      html += `<div class="cfg-ench-sub">Enchant: <span style="color:${enchantColor(enc.id)}">${escapeHtml(enc.name)}</span></div>`;
    }
  }

  if (s.kind === 'accessory') {
    const starChips = [1,2,3,4,5,6].map(n => `<button class="chip star-chip${cfg.starTier === n ? ' active' : ''}" data-star="${n}" title="${n} Stars">${n}<span class="sc-stars">${'★'.repeat(n)}</span></button>`).join('');
    const presets = QUALITY_PRESETS.map(q => `<button class="chip${Math.round(overallQuality(item, cfg)) === q ? ' active' : ''}" data-q="${q}">${q}%</button>`).join('');
    const muts = [`<button class="chip${!cfg.mutation ? ' active' : ''}" data-mut="">None</button>`]
      .concat(getMutations().slice().sort((a, b) => a.multiplier - b.multiplier)
        .map(m => `<button class="chip${cfg.mutation === m.id ? ' active' : ''}" data-mut="${m.id}" style="--mc:${mutationColor(m.id)}"><span>${escapeHtml(m.name)}</span> ×${m.multiplier}</button>`)).join('');

    // Per-stat roll table with ranges.
    const lines = rolledAccessoryStats(item, cfg);
    const rows = lines.map(l => l.note
      ? `<tr class="rs-note"><td colspan="5">${escapeHtml(l.name)}</td></tr>`
      : `<tr>
          <td class="rs-name" style="color:${STAT_BY_KEY[l.name]?.color || 'var(--text)'}">${escapeHtml(l.name)}</td>
          <td class="rs-range">${fmt(l.min)} &ndash; ${fmt(l.max)}${l.unit === '%' ? '%' : ''}</td>
          <td class="rs-acts">
            <button class="rs-btn" data-act="min" data-stat="${escapeHtml(l.name)}">Min</button>
            <button class="rs-btn" data-act="minus" data-stat="${escapeHtml(l.name)}">-</button>
            <button class="rs-btn" data-act="plus" data-stat="${escapeHtml(l.name)}">+</button>
            <button class="rs-btn" data-act="max" data-stat="${escapeHtml(l.name)}">Max</button>
          </td>
          <td class="rs-input-td">
            <input class="rs-input-val${l.roll > 100 ? ' over-roll' : ''}" type="number" step="0.01" value="${Number(l.value.toFixed(2))}" data-stat="${escapeHtml(l.name)}" data-min="${l.min}" data-max="${l.max}">
            <span class="rs-unit">${l.unit === '%' ? '%' : ''}</span>
          </td>
          <td class="rs-pct-td${l.roll > 100 ? ' over-roll' : ''}" data-stat="${escapeHtml(l.name)}">(${Math.round(l.roll)}%)</td>
        </tr>`).join('');

    html += `
      <div class="cfg-row"><label>Stars</label><div class="chip-row">${starChips}</div></div>
      <div class="cfg-row"><label>Quality <b class="qty-label">${Math.round(overallQuality(item, cfg))}%</b></label>
        <input class="roll-slider" type="range" min="1" max="${item.overRollable ? 200 : 100}" value="${Math.round(cfg.rollPct)}">
        <div class="chip-row">${presets}</div></div>
      <div class="cfg-row"><label>Mutation</label><div class="chip-row wrap">${muts}</div></div>
      <div class="cfg-row"><label>Stat rolls <span class="rs-hint">individual %, averages to overall</span></label>
        <table class="roll-table">${rows}</table></div>`;
  } else if (s.kind === 'tool') {
    const ts = getToolStats(item, cfg);
    const lines = [];
    Object.keys(ts.finalFlats).forEach(stat => {
      const base = ts.baseFlats[stat] || 0;
      const bonus = ts.bonuses[stat] || 0;
      const valStr = bonus ? `${fmt(base)} <span class="sb-bonus">(+${fmt(bonus)})</span>` : fmt(base);
      lines.push(`<div class="stat-bar"><span class="sb-label" style="color:${STAT_BY_KEY[stat]?.color || ''}">${escapeHtml(stat)}</span><span class="sb-val">${valStr}</span></div>`);
    });
    ts.mults.forEach(m => {
      lines.push(`<div class="stat-bar"><span class="sb-label">${escapeHtml(m.name)}</span><span class="sb-val">×${m.value}</span></div>`);
    });
    
    const list = enchantsFor(s.label);
    const enchChips = [`<button class="chip${!cfg.enchant ? ' active' : ''}" data-ench="">None</button>`]
      .concat(list.map(en => `<button class="chip${cfg.enchant === en.id ? ' active' : ''}" data-ench="${en.id}" data-tooltip="${escapeHtml(en.rawEffects ? en.rawEffects.join('\n') : en.name)}"><span style="color:${enchantColor(en.id)}">${escapeHtml(en.name)}</span></button>`)).join('');

    const tList = trinketsFor(s.label);
    let trinketHtml = '';
    if (tList.length > 0) {
      const trChips = [`<button class="chip${!cfg.trinket ? ' active' : ''}" data-trinket="">None</button>`]
        .concat(tList.map(t => `<button class="chip${cfg.trinket === t.id ? ' active' : ''}" data-trinket="${t.id}" data-tooltip="${escapeHtml(t.stats ? t.stats.join('\n') : t.name)}">${escapeHtml(t.name)}</button>`)).join('');
      trinketHtml = `<div class="cfg-row"><div class="cfg-lbl">TRINKET</div><div class="chip-row wrap">${trChips}</div></div>`;
    }

    html += `
      <div class="cfg-row"><div class="cfg-lbl">ENCHANT</div><div class="chip-row wrap">${enchChips}</div></div>
      ${trinketHtml}
      <div class="stat-bar-list">${lines.join('')}</div>
      ${item.passive ? `<div class="cfg-passive"><b>Passive:</b> ${escapeHtml(item.passive)}</div>` : ''}`;
  } else {
    const lines = (item.stats || []).map(str => `<li class="pl note">${escapeHtml(str)}</li>`).join('');
    html += `<ul class="preview-list">${lines}</ul>`;
  }

  dom.config.innerHTML = html;
  wireConfig();
}

function wireConfig() {
  const c = dom.config;
  const cfg = state.ui.draft;
  const change = () => { commit(); renderConfig(); };
  const item = getItem(slot().cat, cfg.itemId);
  const overRollMax = item?.overRollable ? 200 : 100;

  c.querySelectorAll('[data-star]').forEach(b => b.addEventListener('click', () => { cfg.starTier = +b.dataset.star; change(); }));
  c.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => { cfg.rollPct = +b.dataset.q; cfg.statRolls = {}; change(); }));
  c.querySelectorAll('[data-mut]').forEach(b => b.addEventListener('click', () => { cfg.mutation = b.dataset.mut; change(); }));
  c.querySelectorAll('[data-ench]').forEach(b => b.addEventListener('click', () => { cfg.enchant = b.dataset.ench; change(); }));
  c.querySelectorAll('[data-trinket]').forEach(b => b.addEventListener('click', () => { cfg.trinket = b.dataset.trinket; change(); }));
  const slider = c.querySelector('.roll-slider');
  if (slider) {
    slider.addEventListener('input', () => { 
      cfg.rollPct = +slider.value; 
      cfg.statRolls = {}; 
      const itemNode = getItem(slot().cat, cfg.itemId);
      const lab = c.querySelector('.qty-label');
      if (lab) lab.textContent = Math.round(overallQuality(itemNode, cfg)) + '%';
      
      // Update specific DOM elements instantly without destroying the slider!
      const lines = rolledAccessoryStats(itemNode, cfg);
      lines.forEach(l => {
        if (l.note) return;
        const inp = c.querySelector(`.rs-input-val[data-stat="${escapeHtml(l.name)}"]`);
        if (inp) inp.value = Number(l.value.toFixed(2));
        const pct = c.querySelector(`.rs-pct-td[data-stat="${escapeHtml(l.name)}"]`);
        if (pct) pct.textContent = `(${Math.round(l.roll)}%)`;
      });
      commit();
    });
    // Remove the change event so we don't clobber the slider on mouseup, 
    // real-time commit() handles the background data updates.
  }
  c.querySelectorAll('.rs-btn').forEach(btn => btn.addEventListener('click', () => {
    const act = btn.dataset.act;
    const stat = btn.dataset.stat;
    let r = cfg.statRolls[stat];
    if (r === undefined) r = cfg.rollPct; // Start from overall rollPct if unset
    if (act === 'max') r = 100;
    else if (act === 'min') r = 0;
    else if (act === 'plus')  r = Math.min(overRollMax, r + 1);
    else if (act === 'minus') r = Math.max(0, r - 1);
    cfg.statRolls = { ...cfg.statRolls, [stat]: r };
    change();
  }));
  c.querySelectorAll('.rs-input-val').forEach(inp => inp.addEventListener('change', () => {
    const val = parseFloat(inp.value);
    const min = parseFloat(inp.dataset.min);
    const max = parseFloat(inp.dataset.max);
    if (!isNaN(val) && max > min) {
      let roll = ((val - min) / (max - min)) * 100;
      cfg.statRolls = { ...cfg.statRolls, [inp.dataset.stat]: Math.max(0, Math.min(overRollMax, roll)) };
    }
    change();
  }));
}
