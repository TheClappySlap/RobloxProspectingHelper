// ---------------------------------------------------------------------------
// compareView.js — the CENTER comparison column between the two full Total
// Stats panels. Shows the single % verdict and a per-row delta with an arrow
// pointing at the winning build (◀ A wins, ▶ B wins).
// ---------------------------------------------------------------------------

import { STATS } from '../core/config.js';
import { state, getBuild, getBuffs, getMuseum } from '../core/store.js';
import { buildMetrics } from '../core/metrics.js';
import { fmt, escapeHtml } from './helpers.js';

const METRICS = [
  { key: 'rollsPerSec',  label: 'Rolls / sec', higher: true,  unit: '' },
  { key: 'pansPerMin',   label: 'Pans / min',  higher: true,  unit: '' },
  { key: 'cycleSeconds', label: 'Cycle time',  higher: false, unit: 's' },
];

function verdict(mA, mB) {
  const a = mA.rollsPerSec, b = mB.rollsPerSec;
  if (a <= 0 && b <= 0) return `<div class="verdict even">Equip gear to compare</div>`;
  if (Math.abs(a - b) < 1e-9) return `<div class="verdict even">Builds are even</div>`;
  const bWins = b > a;
  const pct = bWins ? (a > 0 ? (b / a - 1) * 100 : 100) : (b > 0 ? (a / b - 1) * 100 : 100);
  return `<div class="verdict ${bWins ? 'b' : 'a'}">
    <span class="v-who">${bWins ? '▶ ' : '◀ '}${escapeHtml(bWins ? state.names.b : state.names.a)} wins</span>
    <span class="v-pct">+${fmt(pct)}%</span>
    <span class="v-sub">Rolls / sec</span>
  </div>`;
}

function deltaRow(label, a, b, higher, unit, color) {
  const d = b - a;
  const c = color ? ` style="color: ${color};"` : '';
  if (Math.abs(d) <= 1e-9) {
    return `<div class="cd-row"><span class="cd-name"${c}>${escapeHtml(label)}</span><span class="cd-delta zero">=</span></div>`;
  }
  const bWins = higher ? d > 0 : d < 0;
  const extraStyle = color ? ` style="color: ${color};"` : '';
  return `<div class="cd-row">
    <span class="cd-name"${c}>${escapeHtml(label)}</span>
    <span class="cd-delta ${bWins ? 'b' : 'a'}"${extraStyle}>${bWins ? '' : '◀ '}${fmt(Math.abs(d))}${unit}${bWins ? ' ▶' : ''}</span>
  </div>`;
}

export function renderCompareDiff(root) {
  const mA = buildMetrics(getBuild('a'), getBuffs('a'), getMuseum('a'));
  const mB = buildMetrics(getBuild('b'), getBuffs('b'), getMuseum('b'));
  const showAll = state.ui.cmpShowAll === true;

  const outRows = METRICS.map(m => deltaRow(m.label, mA[m.key], mB[m.key], m.higher, m.unit)).join('');
  const statRows = STATS.map(s => {
    const av = mA.totals[s.key], bv = mB.totals[s.key];
    if (!showAll && Math.abs(av - bv) < 1e-9) return '';
    return deltaRow(s.label, av, bv, true, s.percent ? '%' : '', s.color);
  }).join('');

  root.innerHTML = `
    ${verdict(mA, mB)}
    <div class="cd-block">
      <div class="cd-head">Output Δ</div>
      ${outRows}
    </div>
    <div class="cd-block">
      <div class="cd-head">Stats Δ <button class="mini" id="cmpToggleAll">${showAll ? 'diffs only' : 'all'}</button></div>
      ${statRows || `<div class="cd-row muted">No stat differences</div>`}
    </div>`;

  root.querySelector('#cmpToggleAll')?.addEventListener('click', () => {
    state.ui.cmpShowAll = !state.ui.cmpShowAll;
    renderCompareDiff(root);
  });
}
