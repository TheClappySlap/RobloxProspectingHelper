// ---------------------------------------------------------------------------
// main.js — bootstrap + layout orchestration.
// Single mode: one build editor + its stats sidebar.
// Compare mode: build A | center diff | build B, all on one screen.
// ---------------------------------------------------------------------------

import {
  state, load, subscribe,
  resetBuild, addBuild, loadSavedBuild, deleteSavedBuild, setName,
  setCompareMode, setTab, copyBuild, swapBuilds, clearAllGear,
} from '../core/store.js';
import { renderSlotBoard } from './slotBoard.js';
import { renderBuffsPanel } from './buffsPanel.js';
import { renderMuseumPanel } from './museumPanel.js';
import { renderStatsPanel } from './statsPanel.js';
import { renderCompareDiff } from './compareView.js';
import { renderMuseumTab } from './museumTab.js';
import { openOptimizer } from './optimizerPanel.js';
import { openBulkEditor } from './bulkEditor.js';
import { openPresetsModal } from './presetsModal.js';
import { $, $$, escapeHtml } from './helpers.js';

function buildHead(ref) {
  const saved = state.savedBuilds;
  const loadOpts = [`<option value="">Load…</option>`]
    .concat(saved.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`)).join('');
  return `<div class="build-head">
    <div class="bh-top">
      <input class="build-name" data-ref="${ref}" value="${escapeHtml(state.names[ref])}" aria-label="Build name">
      <button class="mini bh-presets" data-act="presets" data-ref="${ref}" title="Load a meta build into this build">📋 Meta Builds</button>
    </div>
    <div class="bh-acts">
      <select class="load-sel" data-ref="${ref}" title="Load a saved build">${loadOpts}</select>
      <button class="bh-btn bh-save" data-act="save" data-ref="${ref}" title="Save this build">💾 Save</button>
      <button class="bh-btn bh-reset" data-act="reset" data-ref="${ref}" title="Reset gear + buffs">↺ Reset</button>
      <button class="bh-btn bh-unequip" data-act="unequip-all" data-ref="${ref}" title="Unequip all gear slots">✕ Unequip All</button>
      <button class="bh-btn bh-bulk" data-act="bulk" data-ref="${ref}" title="Bulk-edit star tier, roll % and mutation for all accessories">✏️ Edit All</button>
    </div>
  </div>`;
}

function renderSingle(app) {
  app.innerHTML = `
    <div class="layout">
      <div class="editor">
        ${buildHead('a')}
        <div id="board-a" class="board"></div>
        <div id="buffs-a" class="buffs"></div>
        <div id="museum-a" class="museum"></div>
      </div>
      <aside id="stats-a" class="stats-panel"></aside>
    </div>`;
  renderSlotBoard($('#board-a'), 'a');
  renderBuffsPanel($('#buffs-a'), 'a');
  renderMuseumPanel($('#museum-a'), 'a');
  renderStatsPanel($('#stats-a'), 'a');
  wireHeads(app);
}

function renderCompare(app) {
  // Layout: [gear A] [A total stats] [center compare] [B total stats] [gear B].
  // Each build keeps the full single-mode stats panel; the two face the middle.
  app.innerHTML = `
    <div class="compare-5col">
      <div class="cmp-col">
        ${buildHead('a')}
        <div id="board-a" class="board"></div>
        <div id="buffs-a" class="buffs"></div>
        <div id="museum-a" class="museum"></div>
      </div>
      <aside id="stats-a" class="stats-panel cmp-stats"></aside>
      <div class="cmp-center">
        <div class="cmp-center-acts">
          <button class="btn ghost tiny" id="copyAB">Copy A →</button>
          <button class="btn ghost tiny" id="swapAB">⇄</button>
          <button class="btn ghost tiny" id="copyBA">← Copy B</button>
        </div>
        <div id="diff" class="cmp-diff"></div>
      </div>
      <aside id="stats-b" class="stats-panel cmp-stats"></aside>
      <div class="cmp-col">
        ${buildHead('b')}
        <div id="board-b" class="board"></div>
        <div id="buffs-b" class="buffs"></div>
        <div id="museum-b" class="museum"></div>
      </div>
    </div>`;
  renderSlotBoard($('#board-a'), 'a');
  renderBuffsPanel($('#buffs-a'), 'a');
  renderMuseumPanel($('#museum-a'), 'a');
  renderStatsPanel($('#stats-a'), 'a');
  renderSlotBoard($('#board-b'), 'b');
  renderBuffsPanel($('#buffs-b'), 'b');
  renderMuseumPanel($('#museum-b'), 'b');
  renderStatsPanel($('#stats-b'), 'b');
  renderCompareDiff($('#diff'));
  wireHeads(app);

  $('#copyAB').addEventListener('click', () => { if (confirm('Copy build A over build B?')) copyBuild('a', 'b'); });
  $('#copyBA').addEventListener('click', () => { if (confirm('Copy build B over build A?')) copyBuild('b', 'a'); });
  $('#swapAB').addEventListener('click', swapBuilds);
}

function wireHeads(root) {
  root.querySelectorAll('.build-name').forEach(inp =>
    inp.addEventListener('change', () => setName(inp.dataset.ref, inp.value)));
  root.querySelectorAll('.load-sel').forEach(sel =>
    sel.addEventListener('change', () => { if (sel.value) loadSavedBuild(sel.value, sel.dataset.ref); }));
  root.querySelectorAll('[data-act]').forEach(btn => btn.addEventListener('click', () => {
    const ref = btn.dataset.ref;
    if (btn.dataset.act === 'save') {
      const name = prompt('Save this build as:', state.names[ref]);
      if (name !== null) addBuild(name, ref);
    } else if (btn.dataset.act === 'reset') {
      if (confirm('Reset this build (gear + buffs)?')) resetBuild(ref);
    } else if (btn.dataset.act === 'bulk') {
      openBulkEditor(ref);
    } else if (btn.dataset.act === 'unequip-all') {
      if (confirm('Unequip all gear from this build?')) clearAllGear(ref);
    } else if (btn.dataset.act === 'presets') {
      openPresetsModal(ref);
    }
  }));
}

function renderAll() {
  const app = $('#app');

  // Tab chrome: active state + hide the compare switch outside the planner.
  $$('#tabs .tab').forEach(b => b.classList.toggle('active', b.dataset.tab === state.tab));
  const cmp = $('#compareSwitch');
  if (cmp) cmp.style.display = state.tab === 'planner' ? '' : 'none';
  const optBtn = $('#optimizeBtn');
  if (optBtn) optBtn.style.display = state.tab === 'planner' ? '' : 'none';
  document.body.classList.toggle('on-museum', state.tab === 'museum');

  if (state.tab === 'museum') {
    renderMuseumTab(app);
    return;
  }

  if (state.compareMode) renderCompare(app); else renderSingle(app);
  const toggle = $('#compareToggle');
  if (toggle) toggle.checked = state.compareMode;
}

function init() {
  load();
  $('#compareToggle')?.addEventListener('change', e => setCompareMode(e.target.checked));
  $('#optimizeBtn')?.addEventListener('click', openOptimizer);
  $$('#tabs .tab').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
  subscribe(renderAll);
  renderAll();
  document.body.classList.add('ready');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
