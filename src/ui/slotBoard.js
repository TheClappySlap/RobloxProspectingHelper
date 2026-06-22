// ---------------------------------------------------------------------------
// slotBoard.js — the "Equipped" panel for ONE build (ref 'a' or 'b').
// Dark rarity cards w/ stars + roll%, 8 rings (last 2 lockable), a Runes
// section, and Primary Tools (shovel over pan) with a separate Enchant button.
// ---------------------------------------------------------------------------

import { SLOTS, STAT_BY_KEY, rarityColor, rarityLabel, mutationColor, enchantColor } from '../core/config.js';
import { state, emit, getBuild, clearSlot, clearAllGear, setSlot, setRingsUnlocked } from '../core/store.js';
import { getItem, getMutation, getEnchant, enchantsFor, trinketsFor, itemImage } from '../core/db.js';
import { rolledAccessoryStats, overallQuality } from '../core/engine.js';
import { openPicker } from './picker.js';
import { escapeHtml, fmt } from './helpers.js';

const bySlot = key => SLOTS.find(s => s.key === key);

// --- Hover tooltip ----------------------------------------------------------
let tipEl = null;
function tip() {
  if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'pop-tip'; document.body.appendChild(tipEl); }
  return tipEl;
}
function statRowHtml(name, valueHtml) {
  const color = STAT_BY_KEY[name]?.color || 'var(--dark-ink)';
  return `<div class="tip-row"><span style="color:${color}">${escapeHtml(name)}</span><b>${valueHtml}</b></div>`;
}
function buildTip(slot, item, cfg) {
  let head = '';
  let rows = '';
  if (slot.kind === 'accessory') {
    if (cfg.mutation) {
      const m = getMutation(cfg.mutation);
      if (m) head += `<span class="tip-mut" style="color:${mutationColor(m.id)}">${escapeHtml(m.name)}</span> `;
    }
    rows += `<div class="tip-note">★${cfg.starTier} · ${Math.round(overallQuality(item, cfg))}% quality</div>`;
    rolledAccessoryStats(item, cfg).forEach(l => {
      rows += l.note
        ? `<div class="tip-note">${escapeHtml(l.name)}</div>`
        : statRowHtml(l.name, `${fmt(l.value)}${l.unit === '%' ? '%' : ''} <span class="tip-range">(${fmt(l.min)}–${fmt(l.max)})</span>`);
    });
  } else if (slot.kind === 'tool') {
    (item.toolStats || []).forEach(t => rows += statRowHtml(t.name, t.unit === 'x' ? '×' + t.value : '+' + t.value));
    if (cfg.enchant) rows += `<div class="tip-ench">⚜ ${escapeHtml(getEnchant(cfg.enchant)?.name || '')}</div>`;
    if (item.passive) rows += `<div class="tip-note">${escapeHtml(item.passive)}</div>`;
  } else {
    (item.stats || []).forEach(s => rows += `<div class="tip-note">${escapeHtml(s)}</div>`);
  }
  const rar = item.rarity ? ` <span class="tip-rar" style="color:${rarityColor(item.rarity)}">${escapeHtml(rarityLabel(item.rarity))}</span>` : '';
  return `<div class="tip-name" style="color:${item.color || rarityColor(item.rarity)}">${head}${escapeHtml(item.name)}${rar}</div>${rows}`;
}
function showTip(slot, item, cfg, el) {
  const t = tip();
  t.innerHTML = buildTip(slot, item, cfg);
  t.classList.add('open');
  const r = el.getBoundingClientRect();
  const tw = t.offsetWidth, th = t.offsetHeight, pad = 8;
  let left = r.right + 8;
  if (left + tw > innerWidth - pad) left = r.left - 8 - tw;
  t.style.left = `${Math.max(pad, left)}px`;
  t.style.top = `${Math.max(pad, Math.min(r.top, innerHeight - th - pad))}px`;
}
function hideTip() { tipEl?.classList.remove('open'); }

// --- Slot card --------------------------------------------------------------
function slotCard(slot, ref, opts = {}) {
  const cfg = getBuild(ref)[slot.key];
  const item = cfg.itemId ? getItem(slot.cat, cfg.itemId) : null;
  const card = document.createElement('button');
  card.type = 'button';
  card.className = `slot kind-${slot.kind}` + (item ? ' filled' : ' empty') + (opts.locked ? ' locked' : '');
  card.dataset.slot = slot.key;
  card.style.setProperty('--rarity', item ? (item.color || rarityColor(item.rarity)) : 'transparent');

  if (opts.locked) {
    card.innerHTML = `<span class="lock-ico">🔒</span><span class="slot-empty-label">Locked</span>`;
    card.disabled = true;
    return card;
  }
  if (!item) {
    card.innerHTML = `<span class="slot-plus">+</span><span class="slot-empty-label">${escapeHtml(slot.label)}</span>`;
    card.addEventListener('click', () => openPicker(ref, slot.key, card));
    return card;
  }

  const img = itemImage(item);
  const bg = img ? `<img class="slot-bg" src="${escapeHtml(img)}" alt="" onerror="this.remove()">` : '';
  let stars = '', roll = '', sub = '';
  if (slot.kind === 'accessory') {
    stars = `<span class="slot-stars">${'★'.repeat(cfg.starTier)}</span>`;
    roll = `<span class="slot-roll">${Math.round(overallQuality(item, cfg))}%</span>`;
    if (cfg.mutation) {
      const m = getMutation(cfg.mutation);
      if (m) sub = `<span class="slot-mut" style="color:${mutationColor(m.id)}">${escapeHtml(m.name)}</span>`;
    }
  } else if (slot.kind === 'tool' && cfg.enchant) {
    const enc = getEnchant(cfg.enchant);
    if (enc) sub = `<i style="color:${enchantColor(enc.id)}">${escapeHtml(enc.name)}</i> `;
  }
  card.innerHTML = `${bg}${stars}<span class="slot-name" style="color:${item.color || rarityColor(item.rarity)}">${sub}${escapeHtml(item.name)}</span>${roll}<span class="slot-x" title="Unequip">✕</span>`;

  card.addEventListener('mouseenter', () => showTip(slot, item, cfg, card));
  card.addEventListener('mouseleave', hideTip);
  card.addEventListener('click', (e) => {
    hideTip();
    if (e.target.classList.contains('slot-x')) { e.stopPropagation(); clearSlot(ref, slot.key); return; }
    openPicker(ref, slot.key, card);
  });
  return card;
}

function labelledSlot(slot, ref) {
  const wrap = document.createElement('div');
  wrap.className = 'slot-labelled';
  wrap.innerHTML = `<div class="slot-cap${slot.group === 'trinkets' ? ' slot-cap-accent' : ''}">${escapeHtml(slot.label)}</div>`;
  wrap.appendChild(slotCard(slot, ref));
  return wrap;
}

// --- Tool block (card + Enchant button + optional trinket sub-slot) ---------
function toolBlock(slotKey, shapeClass, ref) {
  const slot = bySlot(slotKey);
  const cfg = getBuild(ref)[slotKey];
  const wrap = document.createElement('div');
  wrap.className = `tool-block ${shapeClass}`;
  wrap.innerHTML = `<div class="slot-cap">${escapeHtml(slot.label)}</div>`;
  const card = slotCard(slot, ref);
  card.classList.add(shapeClass);
  wrap.appendChild(card);

  const ench = cfg.enchant ? getEnchant(cfg.enchant) : null;
  const enchBtn = document.createElement('button');
  enchBtn.className = 'ench-btn' + (ench ? ' set' : '');
  enchBtn.disabled = !cfg.itemId;
  enchBtn.innerHTML = `<span class="ench-ico">⚜</span>${ench ? `<span style="color:${enchantColor(cfg.enchant)}">${escapeHtml(ench.name)}</span>` : 'Enchant'}`;
  enchBtn.addEventListener('click', (e) => { e.stopPropagation(); if (cfg.itemId) openEnchantMenu(slotKey, enchBtn, ref); });
  wrap.appendChild(enchBtn);

  // Trinket sub-slot — only shown for slots that have applicable trinkets
  const tList = trinketsFor(slot.label);
  if (tList.length > 0) {
    const curTrinket = cfg.trinket ? tList.find(t => t.id === cfg.trinket) : null;
    const trinketBtn = document.createElement('button');
    trinketBtn.className = 'trinket-btn' + (curTrinket ? ' set' : '');
    trinketBtn.disabled = !cfg.itemId;
    trinketBtn.innerHTML = curTrinket
      ? `<span class="trinket-ico">💎</span><span class="trinket-name">${escapeHtml(curTrinket.name)}</span><span class="trinket-x" title="Remove trinket">✕</span>`
      : `<span class="trinket-ico">💎</span>Add Trinket`;
    trinketBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!cfg.itemId) return;
      if (e.target.classList.contains('trinket-x')) {
        setSlot(ref, slotKey, { ...getBuild(ref)[slotKey], trinket: '' });
        return;
      }
      openTrinketMenu(slotKey, trinketBtn, ref);
    });
    wrap.appendChild(trinketBtn);
  }

  return wrap;
}

// --- Trinket sub-slot (below Pan / Shovel) ----------------------------------
let trinketMenu = null;
function closeTrinketMenu() { trinketMenu?.classList.remove('open'); }
function openTrinketMenu(slotKey, anchorEl, ref) {
  if (!trinketMenu) {
    trinketMenu = document.createElement('div');
    trinketMenu.className = 'ench-menu trinket-menu';
    document.body.appendChild(trinketMenu);
    document.addEventListener('click', (e) => {
      if (trinketMenu.classList.contains('open') && !trinketMenu.contains(e.target)) closeTrinketMenu();
    });
  }
  const slot = bySlot(slotKey);
  const cfg = getBuild(ref)[slotKey];
  const list = trinketsFor(slot.label);
  trinketMenu.innerHTML = `<div class="em-title">${escapeHtml(slot.label)} Trinket</div>`
    + [`<button class="em-item${!cfg.trinket ? ' active' : ''}" data-trinket="">None</button>`]
      .concat(list.map(t => `<button class="em-item${cfg.trinket === t.id ? ' active' : ''}" data-trinket="${t.id}"><b>${escapeHtml(t.name)}</b><span>${escapeHtml((t.stats || []).join(' · '))}</span></button>`)).join('');
  trinketMenu.querySelectorAll('[data-trinket]').forEach(b => b.addEventListener('click', () => {
    setSlot(ref, slotKey, { ...getBuild(ref)[slotKey], trinket: b.dataset.trinket });
    closeTrinketMenu();
  }));
  trinketMenu.classList.add('open');
  const r = anchorEl.getBoundingClientRect();
  const mw = trinketMenu.offsetWidth, mh = trinketMenu.offsetHeight, pad = 8;
  let left = r.right + 8;
  if (left + mw > innerWidth - pad) left = r.left - 8 - mw;
  trinketMenu.style.left = `${Math.max(pad, left < pad ? r.left : left)}px`;
  trinketMenu.style.top = `${Math.max(pad, Math.min(r.top, innerHeight - mh - pad))}px`;
}

let enchMenu = null;
function closeEnchMenu() { enchMenu?.classList.remove('open'); }
function openEnchantMenu(slotKey, anchorEl, ref) {
  const slot = bySlot(slotKey);
  if (!enchMenu) {
    enchMenu = document.createElement('div');
    enchMenu.className = 'ench-menu';
    document.body.appendChild(enchMenu);
    document.addEventListener('click', (e) => { if (enchMenu.classList.contains('open') && !enchMenu.contains(e.target)) closeEnchMenu(); });
  }
  const cfg = getBuild(ref)[slotKey];
  const list = enchantsFor(slot.label);
  enchMenu.innerHTML = `<div class="em-title">${escapeHtml(slot.label)} Enchant</div>`
    + [`<button class="em-item${!cfg.enchant ? ' active' : ''}" data-ench="">None</button>`]
      .concat(list.map(en => `<button class="em-item${cfg.enchant === en.id ? ' active' : ''}" data-ench="${en.id}"><b>${escapeHtml(en.name)}</b><span>${escapeHtml((en.rawEffects || []).join(' · '))}</span></button>`)).join('');
  enchMenu.querySelectorAll('[data-ench]').forEach(b => b.addEventListener('click', () => {
    setSlot(ref, slotKey, { ...getBuild(ref)[slotKey], enchant: b.dataset.ench });
    closeEnchMenu();
  }));
  enchMenu.classList.add('open');
  const r = anchorEl.getBoundingClientRect();
  const mw = enchMenu.offsetWidth, mh = enchMenu.offsetHeight, pad = 8;
  let left = r.right + 8;
  if (left + mw > innerWidth - pad) left = r.left - 8 - mw;
  enchMenu.style.left = `${Math.max(pad, left < pad ? r.left : left)}px`;
  enchMenu.style.top = `${Math.max(pad, Math.min(r.top, innerHeight - mh - pad))}px`;
}


// --- Board ------------------------------------------------------------------
export function renderSlotBoard(root, ref = 'a') {
  root.innerHTML = '';
  const kit = document.createElement('div');
  kit.className = 'kit';

  // Primary tools — a clean horizontal strip ABOVE the equipped accessories.
  const tools = document.createElement('div');
  tools.className = 'tools-strip';
  tools.appendChild(toolBlock('pan', 'tool-horizontal', ref));
  tools.appendChild(toolBlock('shovel', 'tool-horizontal', ref));
  kit.appendChild(tools);

  // Equipped gold panel
  const eq = document.createElement('div');
  eq.className = 'equipped';
  eq.innerHTML = `<div class="eq-title">Equipped</div>`;

  const trinkets = document.createElement('div');
  trinkets.className = 'trinket-row';
  ['necklace', 'charm'].forEach(k => trinkets.appendChild(labelledSlot(bySlot(k), ref)));
  eq.appendChild(trinkets);

  const ringsWrap = document.createElement('div');
  ringsWrap.className = 'rings-block';
  ringsWrap.innerHTML = `<div class="block-title slot-cap-accent">Rings</div>`;
  const ringGrid = document.createElement('div');
  ringGrid.className = 'ring-grid';
  SLOTS.filter(s => s.group === 'rings').forEach(s => ringGrid.appendChild(slotCard(s, ref, { locked: s.lockable && !state.ringsUnlocked })));
  ringsWrap.appendChild(ringGrid);
  const unlockBtn = document.createElement('button');
  unlockBtn.className = 'unlock-btn';
  unlockBtn.innerHTML = state.ringsUnlocked ? `🔓 Lock extra ring slots` : `🔒 Unlock extra ring slots`;
  unlockBtn.addEventListener('click', () => setRingsUnlocked(!state.ringsUnlocked));
  ringsWrap.appendChild(unlockBtn);
  eq.appendChild(ringsWrap);

  const runesWrap = document.createElement('div');
  runesWrap.className = 'runes-block';
  const runesOpen = state.ui.runesOpen !== false;
  runesWrap.innerHTML = `<button class="runes-toggle">Runes <span class="caret">${runesOpen ? '▾' : '▸'}</span></button>`;
  runesWrap.querySelector('.runes-toggle').addEventListener('click', () => { state.ui.runesOpen = !runesOpen; emit(); });
  if (runesOpen) {
    const runeGrid = document.createElement('div');
    runeGrid.className = 'rune-grid';
    SLOTS.filter(s => s.group === 'runes').forEach(s => runeGrid.appendChild(slotCard(s, ref)));
    runesWrap.appendChild(runeGrid);
  }
  eq.appendChild(runesWrap);

  const clearBtn = document.createElement('button');
  clearBtn.className = 'btn ghost tiny eq-clear';
  clearBtn.textContent = 'Unequip all';
  clearBtn.addEventListener('click', () => { if (confirm('Unequip everything in this build?')) clearAllGear(ref); });
  eq.appendChild(clearBtn);

  kit.appendChild(eq);
  root.appendChild(kit);
}
