// ---------------------------------------------------------------------------
// presetsModal.js — "Meta Builds" browser modal.
// Builds grouped by type (Luck, Hybrid, Size…), with credit + color badges.
// ---------------------------------------------------------------------------

import { META_BUILDS, loadMetaBuild } from '../core/store.js';
import { escapeHtml } from './helpers.js';

let overlay = null;

export function openPresetsModal(ref = 'a') {
  ensureOverlay();
  render(ref);
  overlay.classList.add('open');
}

function closePresetsModal() {
  overlay?.classList.remove('open');
}

function ensureOverlay() {
  if (overlay) return;
  overlay = document.createElement('div');
  overlay.className = 'presets-overlay';
  overlay.innerHTML = `<div class="presets-modal" role="dialog" aria-modal="true" aria-label="Meta Builds"></div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) closePresetsModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay?.classList.contains('open')) closePresetsModal();
  });
  document.body.appendChild(overlay);
}

function render(ref) {
  const modal = overlay.querySelector('.presets-modal');

  // Group by type, preserving first-seen order.
  const groups = [];
  const groupIdx = {};
  for (const mb of META_BUILDS) {
    const t = mb.type || 'Other';
    if (groupIdx[t] === undefined) {
      groupIdx[t] = groups.length;
      groups.push({ type: t, color: mb.typeColor || 'var(--muted)', builds: [] });
    }
    groups[groupIdx[t]].builds.push(mb);
  }

  const sectionsHtml = groups.map(g => {
    const cardsHtml = g.builds.map(mb => {
      const tags = (mb.tags || [])
        .map(t => `<span class="preset-tag">${escapeHtml(t)}</span>`).join('');
      const credit = mb.credit
        ? `<span class="preset-credit">by ${escapeHtml(mb.credit)}</span>`
        : '';
      return `
        <button type="button" class="preset-card" data-id="${escapeHtml(mb.id)}">
          <div class="preset-card-header">
            <span class="preset-card-name">${escapeHtml(mb.name)}</span>
            ${credit}
          </div>
          ${mb.description ? `<div class="preset-card-desc">${escapeHtml(mb.description)}</div>` : ''}
          ${tags ? `<div class="preset-tags">${tags}</div>` : ''}
        </button>`;
    }).join('');

    return `<div class="preset-group">
      <div class="preset-group-title">
        <span class="preset-type-dot" style="background:${g.color}"></span>
        ${escapeHtml(g.type)}
      </div>
      <div class="presets-grid">${cardsHtml}</div>
    </div>`;
  }).join('');

  modal.innerHTML = `
    <div class="presets-head">
      <span class="presets-title">📋 Meta Builds</span>
      <button class="presets-close" aria-label="Close">✕</button>
    </div>
    <div class="presets-body">
      <p class="presets-hint">Click a build to load it into Build A.</p>
      ${sectionsHtml}
    </div>`;

  modal.querySelector('.presets-close').addEventListener('click', closePresetsModal);

  modal.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', () => {
      if (loadMetaBuild(card.dataset.id, ref)) closePresetsModal();
    });
  });
}
