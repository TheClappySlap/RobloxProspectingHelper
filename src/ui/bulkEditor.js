// ---------------------------------------------------------------------------
// bulkEditor.js — "Edit All Gear" floating modal.
// Sets starTier, rollPct, and mutation on all occupied accessory slots at once.
// ---------------------------------------------------------------------------

import { getBuild, setSlot } from '../core/store.js';
import { getMutations } from '../core/db.js';
import { escapeHtml, mutColor } from './helpers.js';

const ACCESSORY_KEYS = ['necklace', 'charm', 'ring1', 'ring2', 'ring3', 'ring4', 'ring5', 'ring6', 'ring7', 'ring8'];

let overlay = null;

const sel = { starTier: 6, rollPct: 100, mutation: '' };

const STAR_OPTS = [5, 6];
const ROLL_OPTS = [80, 85, 90, 95, 100];

export function openBulkEditor(ref = 'a') {
  ensureOverlay();
  render(ref);
  overlay.classList.add('open');
}

function closeBulkEditor() {
  overlay?.classList.remove('open');
}

function ensureOverlay() {
  if (overlay) return;
  overlay = document.createElement('div');
  overlay.className = 'bulk-overlay';
  overlay.innerHTML = `<div class="bulk-modal" role="dialog" aria-modal="true" aria-label="Edit All Gear"></div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeBulkEditor(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay?.classList.contains('open')) closeBulkEditor();
  });
  document.body.appendChild(overlay);
}

function countOccupied(ref) {
  const build = getBuild(ref);
  return ACCESSORY_KEYS.filter(k => build[k]?.itemId).length;
}

const MUT_SUBSORT = { 'Diamond': 0, 'Granite': 1, 'Overclocked': 2 };
function sortedMutations() {
  return [...getMutations()].sort((a, b) => {
    if (a.multiplier !== b.multiplier) return a.multiplier - b.multiplier;
    return (MUT_SUBSORT[a.name] ?? 99) - (MUT_SUBSORT[b.name] ?? 99);
  });
}

function render(ref) {
  const modal = overlay.querySelector('.bulk-modal');
  const muts = sortedMutations();

  const segStar = STAR_OPTS.map(s =>
    `<button type="button" class="bulk-seg-btn${sel.starTier === s ? ' on' : ''}" data-field="starTier" data-val="${s}">${s}★</button>`
  ).join('');

  const segRoll = ROLL_OPTS.map(r =>
    `<button type="button" class="bulk-seg-btn${sel.rollPct === r ? ' on' : ''}" data-field="rollPct" data-val="${r}">${r}%</button>`
  ).join('');

  const mutChips = [
    `<button type="button" class="bulk-mut-chip${sel.mutation === '' ? ' on' : ''}" data-mut="">None</button>`,
    ...muts.map(m => {
      const col = mutColor(m.multiplier);
      return `<button type="button" class="bulk-mut-chip${sel.mutation === m.id ? ' on' : ''}" data-mut="${m.id}" style="--mc:${col}">
        <span class="bulk-mut-dot"></span>${escapeHtml(m.name)} <span class="bulk-mut-x">×${m.multiplier}</span>
      </button>`;
    }),
  ].join('');

  const occupied = countOccupied(ref);

  modal.innerHTML = `
    <div class="bulk-head">
      <span class="bulk-title">✏️ Edit All Gear</span>
      <button class="bulk-close" aria-label="Close">✕</button>
    </div>
    <div class="bulk-body">
      <div class="bulk-row">
        <span class="bulk-label">Star Tier</span>
        <div class="bulk-seg">${segStar}</div>
      </div>
      <div class="bulk-row">
        <span class="bulk-label">Roll %</span>
        <div class="bulk-seg">${segRoll}</div>
      </div>
      <div class="bulk-row bulk-row-col">
        <span class="bulk-label">Mutation</span>
        <div class="bulk-mut-chips">${mutChips}</div>
      </div>
      <p class="bulk-preview">Applies to <b>${occupied}</b> equipped accessory slot${occupied !== 1 ? 's' : ''}</p>
      <div class="bulk-actions">
        <button class="bulk-apply btn primary" type="button">Apply</button>
        <button class="bulk-cancel btn" type="button">Cancel</button>
      </div>
    </div>`;

  modal.querySelectorAll('.bulk-seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.dataset.field;
      sel[field] = field === 'starTier' || field === 'rollPct' ? Number(btn.dataset.val) : btn.dataset.val;
      render(ref);
    });
  });

  modal.querySelectorAll('.bulk-mut-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      sel.mutation = chip.dataset.mut;
      modal.querySelectorAll('.bulk-mut-chip').forEach(x => x.classList.toggle('on', x === chip));
    });
  });

  modal.querySelector('.bulk-close').addEventListener('click', closeBulkEditor);
  modal.querySelector('.bulk-cancel').addEventListener('click', closeBulkEditor);

  modal.querySelector('.bulk-apply').addEventListener('click', () => {
    const build = getBuild(ref);
    ACCESSORY_KEYS.forEach(k => {
      if (!build[k]?.itemId) return;
      setSlot(ref, k, {
        ...build[k],
        starTier: sel.starTier,
        rollPct: sel.rollPct,
        mutation: sel.mutation,
      });
    });
    closeBulkEditor();
  });
}
