// ---------------------------------------------------------------------------
// buffsPanel.js — buffs & potions for ONE build (ref). Grouped like the
// planning spreadsheet; the right control per buff (toggle / counter / select).
// ---------------------------------------------------------------------------

import { BUFF_GROUPS, ALL_BUFFS } from '../core/buffsModel.js';
import { state, emit, getBuffs, setBuff, clearBuffs } from '../core/store.js';
import { escapeHtml } from './helpers.js';

function isActive(v) {
  return v !== undefined && v !== null && v !== false && v !== 0 && v !== '' && v !== 'none';
}
function activeCount(ref) {
  const buffs = getBuffs(ref);
  return ALL_BUFFS.filter(b => isActive(buffs[b.id])).length;
}

function toggleCell(buff, ref) {
  const on = !!getBuffs(ref)[buff.id];
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'bf bf-toggle' + (on ? ' active' : '');
  if (buff.desc) el.dataset.tooltip = buff.desc;
  el.innerHTML = `<span class="bf-check">${on ? '✓' : ''}</span>
    <span class="bf-body"><span class="bf-name">${escapeHtml(buff.name)}</span></span>`;
  el.addEventListener('click', () => setBuff(ref, buff.id, !on));
  return el;
}

function counterCell(buff, ref) {
  const n = Number(getBuffs(ref)[buff.id]) || 0;
  const el = document.createElement('div');
  el.className = 'bf bf-counter' + (n > 0 ? ' active' : '');
  if (buff.desc) el.dataset.tooltip = buff.desc;
  el.innerHTML = `<span class="bf-body"><span class="bf-name">${escapeHtml(buff.name)}</span></span>
    <div class="bf-stepper">
      <button class="bf-step" data-d="-1">−</button>
      <input class="bf-num" type="number" value="${n}" min="${buff.min ?? 0}" max="${buff.max ?? 999}">
      <button class="bf-step" data-d="1">+</button>
    </div>`;
  const clamp = v => Math.max(buff.min ?? 0, Math.min(buff.max ?? 999, v || 0));
  el.querySelectorAll('.bf-step').forEach(b => b.addEventListener('click', () => setBuff(ref, buff.id, clamp(n + (+b.dataset.d)))));
  el.querySelector('.bf-num').addEventListener('change', e => setBuff(ref, buff.id, clamp(parseInt(e.target.value, 10))));
  return el;
}

function selectCell(buff, ref) {
  const cur = getBuffs(ref)[buff.id] ?? buff.options[0].value;
  const el = document.createElement('div');
  el.className = 'bf bf-select' + (String(cur) !== String(buff.options[0].value) ? ' active' : '');
  if (buff.desc) el.dataset.tooltip = buff.desc;
  const opts = buff.options.map(o => `<option value="${escapeHtml(String(o.value))}"${String(o.value) === String(cur) ? ' selected' : ''}>${escapeHtml(o.label)}</option>`).join('');
  el.innerHTML = `<span class="bf-body"><span class="bf-name">${escapeHtml(buff.name)}</span></span>
    <select class="bf-dd">${opts}</select>`;
  el.querySelector('.bf-dd').addEventListener('change', e => setBuff(ref, buff.id, e.target.value));
  return el;
}

function cell(buff, ref) {
  if (buff.type === 'counter') return counterCell(buff, ref);
  if (buff.type === 'select') return selectCell(buff, ref);
  return toggleCell(buff, ref);
}

export function renderBuffsPanel(root, ref = 'a') {
  const open = state.ui.buffsOpen[ref] === true;
  const count = activeCount(ref);

  root.innerHTML = `
    <div class="buffs-head">
      <button class="buffs-toggle">
        <span>Buffs &amp; Potions</span>
        <span class="buffs-meta">${count ? count + ' active' : 'none'} <span class="caret">${open ? '▾' : '▸'}</span></span>
      </button>
      ${count ? `<button class="buffs-clear" title="Clear all buffs">Clear</button>` : ''}
    </div>
    <div class="buffs-body" ${open ? '' : 'hidden'}></div>`;

  root.querySelector('.buffs-toggle').addEventListener('click', () => { state.ui.buffsOpen[ref] = !open; emit(); });
  root.querySelector('.buffs-clear')?.addEventListener('click', () => clearBuffs(ref));

  if (!open) return;
  const body = root.querySelector('.buffs-body');
  BUFF_GROUPS.forEach(group => {
    const section = document.createElement('section');
    section.className = 'buff-group' + (group.admin ? ' admin' : '');
    section.innerHTML = `<div class="buff-group-title">${group.admin ? '⚠ ' : ''}${escapeHtml(group.title)}</div>`;
    const grid = document.createElement('div');
    grid.className = 'buff-grid';
    group.buffs.forEach(b => grid.appendChild(cell(b, ref)));
    section.appendChild(grid);
    body.appendChild(section);
  });
}
