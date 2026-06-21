// ---------------------------------------------------------------------------
// statsPanel.js — live totals styled after the in-game "Total Stats" screen.
//
// Top: a "build math" card that lays a single stat out as a clear chain —
//   Base + additive bonuses (gear, museum, totems, blessings…) → Subtotal
//   → × Multiplier (the additive multiplier stack) → Final.
// Below: the full colored stat list; click a stat to focus the math card on it.
// ---------------------------------------------------------------------------

import { STATS, STAT_BY_KEY, SLOT_BY_KEY } from '../core/config.js';
import { getBuild, getBuffs, getMuseum } from '../core/store.js';
import { computeBuild } from '../core/engine.js';
import { throughput } from '../core/metrics.js';
import { throughputMathHtml } from './mathBreakdown.js';
import { fmt, escapeHtml } from './helpers.js';

// Which stat the math card details (default to the primary optimization output).
let focusStat = null;
// Whether the Rolls/sec "Advanced math" derivation is expanded (per build).
const mathOpen = { a: false, b: false };

function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

/** Step-by-step derivation of a trinket's contribution (e.g. Beach Umbrella's
 *  Capacity/ModBoost → Luck formula). Returns '' when no trinket is active. */
function trinketFormulaHtml(t) {
  if (!t) return '';
  return `
    <div class="math-sect trinket-formula">
      <div class="math-sect-h">${escapeHtml(t.name)} → ${escapeHtml(t.stat)}</div>
      <div class="bd-row"><span>Capacity</span><b>${fmt(t.capacity)}</b></div>
      <div class="bd-row"><span>Modifier Boost</span><b>${fmt(t.modBoost)}%</b></div>
      <div class="bd-row note">modPct = (5 + 5·(ModBoost/100) − ModBoost/380) / 100 = ${fmt(t.modPct * 100)}%</div>
      <div class="bd-row note">${escapeHtml(t.stat)} += 25 · √Capacity · modPct</div>
      <div class="bd-row subtotal"><span>= 25 · ${fmt(Math.sqrt(Math.max(0, t.capacity)))} · ${fmt(t.modPct)}</span><b>+${fmt(t.flatLuck)}</b></div>
    </div>`;
}

/** The Base → +additive → ×multiplier → Final chain for one stat. */
function mathCardHtml(key, res) {
  const meta = STAT_BY_KEY[key];
  const pct = meta?.percent ? '%' : '';
  const gameBase = meta?.base || 0;
  const subtotal = res.base[key] + res.flat[key];
  const finalVal = res.total[key];

  // --- Additive section: base, gear slots, then buff/museum/blessing sources ---
  const addRows = [];
  const c = `style="color:${meta?.color || '#fff'}"`;
  addRows.push(`<div class="bd-row"><span ${c}>Base</span><b>${fmt(gameBase)}${pct}</b></div>`);
  Object.keys(res.breakdown).forEach(sk => {
    const v = res.breakdown[sk][key];
    if (Math.abs(v) > 1e-9)
      addRows.push(`<div class="bd-row"><span>${escapeHtml(SLOT_BY_KEY[sk]?.label || sk)}</span><b>${v > 0 ? '+' : ''}${fmt(v)}${pct}</b></div>`);
  });
  (res.baseSources[key] || []).forEach(src => {
    const museum = src.label === 'Museum';
    addRows.push(`<div class="bd-row${museum ? ' museum' : ''}"><span ${museum ? c : ''}>${museum ? '🏛️ ' : ''}${escapeHtml(src.label)}</span><b>${src.value > 0 ? '+' : ''}${fmt(src.value)}${pct}</b></div>`);
  });

  // --- Multiplier section: additive stack of (mult - 1) ---
  const sources = res.multSources[key] || [];
  const totalMult = res.mult[key];
  let multBlock;
  if (sources.length) {
    const rows = sources.map(src => {
      const museum = src.label === 'Museum';
      const mc = museum ? `style="color:#7fd0d8"` : '';
      return `<div class="bd-row mult"><span ${mc}>${museum ? '🏛️ ' : ''}${escapeHtml(src.label)}</span><b>${fmt(src.mult)}x</b></div>`;
    }).join('');
    multBlock = `
      <div class="math-sect">
        <div class="math-sect-h">× Multiplier <span class="math-mult-tag">×${fmt(totalMult)}</span></div>
        ${rows}
        <div class="bd-row note">Multipliers stack additively (two 1.5x → 2.0x).</div>
      </div>`;
  } else {
    multBlock = `<div class="math-sect"><div class="math-sect-h">× Multiplier <span class="math-mult-tag">×1</span></div>
      <div class="bd-row note">No multipliers on this stat.</div></div>`;
  }

  let finalMultBlock = '';
  if (res.finalMults && res.finalMults[key] && res.finalMults[key] !== 1) {
    const fm = res.finalMults[key];
    finalMultBlock = `
      <div class="math-sect" style="border-top: 1px dashed #444; padding-top: 6px; margin-top: 6px;">
        <div class="bd-row mult"><span style="color:#ffb86c">Global Buff (Multiplicative)</span><b>${fmt(fm)}x</b></div>
      </div>`;
  }

  return `
    <div class="math-card">
      <div class="math-head">
        <span class="math-title" style="color:${meta?.color || '#fff'}">${escapeHtml(meta?.label || key)}</span>
        <span class="math-final" style="color:${meta?.color || '#fff'}">${fmt(finalVal)}${pct}</span>
      </div>
      <div class="math-sect">
        <div class="math-sect-h">Base + additive bonuses</div>
        ${addRows.join('')}
        <div class="bd-row subtotal"><span ${c}>Subtotal</span><b>${fmt(subtotal)}${pct}</b></div>
      </div>
      ${multBlock}
      ${finalMultBlock}
      ${res.trinket && res.trinket.stat === key ? trinketFormulaHtml(res.trinket) : ''}
      <div class="math-final-row"><span>Final ${escapeHtml(meta?.label || key)}</span><b>${fmt(finalVal)}${pct}</b></div>
    </div>`;
}

export function renderStatsPanel(root, ref = 'a') {
  const res = computeBuild(getBuild(ref), getBuffs(ref), getMuseum(ref));
  const tp = throughput(res.total);
  // focusStat is null by default so no math card is shown initially.

  root.innerHTML = `<div class="stats-head">Total Stats</div>`;
  
  if (res.warnings && res.warnings.length > 0) {
    const warns = res.warnings.map(w => `<div class="warning-banner">⚠️ ${escapeHtml(w)}</div>`).join('');
    root.innerHTML += `<div style="padding: 12px 12px 0;">${warns}</div>`;
  }

  const out = document.createElement('div');
  out.className = 'output-block';
  out.innerHTML = `
    <div class="out-main"><span class="out-val">${fmt(tp.rollsPerSec)}</span><span class="out-label">Rolls / sec</span></div>
    <div class="out-sub">
      <span><b>${fmt(tp.cycleSeconds)}s</b> cycle</span>
      <span><b>${fmt(tp.pansPerMin)}</b> pans/min</span>
    </div>
    ${tp.times ? `
    <div class="cb-wrapper">
      <div class="cb-title">PAN TIME CYCLE</div>
      <div class="cycle-bar">
        <div class="cb-segment cb-shake" style="width:${(tp.times.shake / tp.cycleSeconds) * 100}%">${Math.round((tp.times.shake / tp.cycleSeconds) * 100)}%</div>
        <div class="cb-segment cb-overhead" style="width:${(tp.times.overhead / tp.cycleSeconds) * 100}%">${Math.round((tp.times.overhead / tp.cycleSeconds) * 100)}%</div>
        <div class="cb-segment cb-dig" style="width:${(tp.times.dig / tp.cycleSeconds) * 100}%">${Math.round((tp.times.dig / tp.cycleSeconds) * 100)}%</div>
      </div>
      <div class="cycle-legend">
        <div class="cl-item"><span class="cl-box cb-shake"></span> Shaking ( ${fmt(tp.times.shake)}s )</div>
        <div class="cl-item"><span class="cl-box cb-overhead"></span> Overhead ( ${fmt(tp.times.overhead)}s )</div>
        <div class="cl-item"><span class="cl-box cb-dig"></span> Digging ( ${fmt(tp.times.dig)}s )</div>
      </div>
    </div>` : ''}`;
  root.appendChild(out);

  const list = document.createElement('div');
  list.className = 'stats-list';

  STATS.forEach(s => {
    const pct = s.percent ? '%' : '';
    const total = res.total[s.key];
    const pre = res.base[s.key] + res.flat[s.key];
    const isFocus = focusStat === s.key;

    const row = document.createElement('div');
    row.className = 'stat-row' + (isFocus ? ' focus' : '');
    const isLuck = s.key === 'Luck';
    row.innerHTML = `
      <button class="stat-main">
        <span class="stat-name" style="color:${s.color}">${escapeHtml(s.label)}:</span>
        <span class="stat-vals">
          <span class="stat-total${isLuck ? ' luck' : ''}" style="color:${s.color}">${fmt(total)}${pct}</span>
          <span class="stat-base">(${fmt(pre)}${pct})</span>
        </span>
      </button>`;
    row.querySelector('.stat-main').addEventListener('click', () => {
      focusStat = focusStat === s.key ? null : s.key;
      renderStatsPanel(root, ref);
    });
    if (isFocus) {
      row.appendChild(h(mathCardHtml(focusStat, res)));
    }
    list.appendChild(row);
  });

  root.appendChild(list);
  root.appendChild(h(`<p class="stats-hint">Click a stat to break down its base, bonuses &amp; multipliers above.</p>`));

  // Advanced math: the full Rolls/sec derivation (same breakdown as the Math tab).
  const advOpen = mathOpen[ref] === true;
  const adv = document.createElement('div');
  adv.className = 'adv-math';
  adv.innerHTML = `
    <button class="adv-math-toggle">🧮 Advanced math <span class="caret">${advOpen ? '▾' : '▸'}</span></button>
    <div class="adv-math-body" ${advOpen ? '' : 'hidden'}>${advOpen ? (res.trinket ? `<div class="math-card">${trinketFormulaHtml(res.trinket)}</div>` : '') + throughputMathHtml(tp.breakdown) : ''}</div>`;
  adv.querySelector('.adv-math-toggle').addEventListener('click', () => { mathOpen[ref] = !advOpen; renderStatsPanel(root, ref); });
  root.appendChild(adv);
}
