// ---------------------------------------------------------------------------
// museumPanel.js — the Museum multiplier column for ONE build (ref).
//
// The Museum grants a per-stat MULTIPLIER (e.g. 1.41× Luck). These stack
// additively with other multipliers in the engine. Only the stats the museum
// can actually affect are shown here — non-museum stats (Toughness, Efficiency,
// Inventory, Treasure Map Chance, Status Timer Speed, Jump Power) are excluded.
// ---------------------------------------------------------------------------

import { STATS } from '../core/config.js';
import { state, emit, getMuseum, setMuseum, clearMuseum, setMuseumAll, getBuffs } from '../core/store.js';
import { optimizeMuseumForBuild } from '../core/optimizer.js';
import { fmt, escapeHtml } from './helpers.js';

// Stats the museum can affect — excludes utility/tool stats that have no museum ore bonus.
const MUSEUM_STAT_KEYS = new Set([
  'Luck', 'Capacity', 'Shake Speed', 'Shake Strength',
  'Dig Speed', 'Dig Strength', 'Modifier Boost',
  'Size Boost', 'Sell Boost', 'Walk Speed',
]);

const MUSEUM_STATS = STATS.filter(s => MUSEUM_STAT_KEYS.has(s.key));

function activeStats(ref) {
  const m = getMuseum(ref);
  return MUSEUM_STATS.filter(s => { const v = Number(m[s.key]) || 0; return v && v !== 1; });
}

export function renderMuseumPanel(root, ref = 'a') {
  const open = state.ui.museumOpen[ref] === true;
  const active = activeStats(ref);
  const m = getMuseum(ref);

  const summary = active.length
    ? active.map(s => {
        const abbr = s.label
          .replace(' Strength', ' Str').replace(' Speed', ' Spd')
          .replace('Modifier Boost', 'Mod').replace('Treasure Map Chance', 'Map');
        return `<span style="color:${s.color}">${escapeHtml(abbr)}</span> ×${fmt(Number(m[s.key]))}`;
      }).join(', ')
    : 'none';

  root.innerHTML = `
    <div class="buffs-head">
      <button class="museum-toggle buffs-toggle">
        <span>🏛️ Museum</span>
        <span class="buffs-meta museum-summary">${open ? (active.length ? active.length + ' stat' + (active.length > 1 ? 's' : '') : 'none') : summary} <span class="caret">${open ? '▾' : '▸'}</span></span>
      </button>
      ${active.length ? `<button class="buffs-clear" title="Clear museum bonuses">Clear</button>` : ''}
    </div>
    <div class="buffs-body museum-body" ${open ? '' : 'hidden'}></div>`;

  root.querySelector('.museum-toggle').addEventListener('click', () => { state.ui.museumOpen[ref] = !open; emit(); });
  root.querySelector('.buffs-clear')?.addEventListener('click', () => clearMuseum(ref));

  if (!open) return;
  const body = root.querySelector('.museum-body');
  body.innerHTML = `<p class="museum-hint">Per-stat ×multiplier from your Museum. Stacks additively with totems, runes &amp; mastery.</p>`;

  const list = document.createElement('div');
  list.className = 'museum-list';

  MUSEUM_STATS.forEach(s => {
    const val = Number(m[s.key]) || 0;
    const isActive = val && val !== 1;
    const row = document.createElement('label');
    row.className = 'museum-row' + (isActive ? ' active' : '');

    const displayVal = isActive ? String(val) : '';
    row.innerHTML = `
      <span class="museum-stat-name" style="color:${s.color}">${escapeHtml(s.label)}</span>
      <span class="museum-row-right">
        <span class="museum-mx">×</span>
        <input class="museum-num" type="number" step="0.001" min="0" max="9.999"
               value="${displayVal}" placeholder="1.000"
               aria-label="Museum ${escapeHtml(s.label)} multiplier">
      </span>`;

    const input = row.querySelector('.museum-num');
    input.addEventListener('change', e => {
      const v = parseFloat(e.target.value);
      setMuseum(ref, s.key, isNaN(v) ? 0 : v);
    });
    input.addEventListener('focus', e => { if (!e.target.value) e.target.value = '1.'; });
    input.addEventListener('blur', e => {
      const v = parseFloat(e.target.value);
      if (!v || v === 1) e.target.value = '';
    });

    list.appendChild(row);
  });

  body.appendChild(list);

  const optBtn = document.createElement('button');
  optBtn.className = 'museum-opt-btn';
  optBtn.textContent = '⚡ Optimize Museum';
  optBtn.title = 'Auto-fill museum stats for maximum Rolls/sec given your current build and buffs';
  optBtn.addEventListener('click', async () => {
    optBtn.disabled = true;
    optBtn.textContent = 'Optimizing…';
    try {
      const result = await optimizeMuseumForBuild(
        JSON.parse(JSON.stringify(state[ref === 'b' ? 'buildB' : 'build'])),
        getBuffs(ref),
        6.0, 3.5
      );
      setMuseumAll(ref, result);
    } catch (err) {
      console.error('[museumOptimize]', err);
      optBtn.textContent = 'Error — check console';
      optBtn.disabled = false;
      return;
    }
    // setMuseumAll already emits — panel will re-render.
  });
  body.appendChild(optBtn);
}
