// ---------------------------------------------------------------------------
// mathTab.js — the "🧮 Math" validator tab.
//
// Plug in raw stats (Luck, Capacity, Shake Speed/Strength, Dig Speed/Strength,
// and optionally Digs-to-max n directly) and see the exact Rolls/sec derivation
// — the SAME throughputMath.js the planner and optimizer use. "Load Build A
// totals" pulls your current build's computed totals so you can cross-check the
// validator against the planner for the identical inputs.
// ---------------------------------------------------------------------------

import { computeThroughput } from '../core/throughputMath.js';
import { buildMetrics } from '../core/metrics.js';
import { state, getBuild, getBuffs, getMuseum } from '../core/store.js';
import { throughputMathHtml } from './mathBreakdown.js';
import { escapeHtml } from './helpers.js';

// Local, ephemeral validator state (not persisted — it's a scratchpad).
const S = {
  luck: 1000, capacity: 500, shakeSpeed: 800, shakeStrength: 100,
  digSpeed: 300, digStrength: 100, nOverride: '', useN: false, method: 'autopan',
};

const FIELDS = [
  { key: 'luck', label: 'Luck' },
  { key: 'capacity', label: 'Capacity' },
  { key: 'shakeSpeed', label: 'Shake Speed', unit: '%' },
  { key: 'shakeStrength', label: 'Shake Strength' },
  { key: 'digSpeed', label: 'Dig Speed', unit: '%' },
  { key: 'digStrength', label: 'Dig Strength' },
];

const nf = (x, dp = 2) => (x == null || isNaN(x)) ? '0' : Number(x).toLocaleString(undefined, { maximumFractionDigits: dp });

function compute() {
  return computeThroughput({
    luck: S.luck, capacity: S.capacity, shakeSpeed: S.shakeSpeed,
    shakeStrength: S.shakeStrength, digSpeed: S.digSpeed, digStrength: S.digStrength,
  }, S.method, { nOverride: S.useN ? S.nOverride : null });
}

function outputHtml() {
  const tp = compute();
  return `
    <div class="mv-result">
      <div class="mv-rps-row"><span class="mv-rps">${nf(tp.rollsPerSec, 3)}</span><span class="mv-rps-label">Rolls / sec</span></div>
      <div class="mv-result-sub">
        <span><b>${nf(tp.cycleSeconds, 3)}s</b> cycle</span>
        <span><b>${nf(tp.pansPerMin, 2)}</b> pans/min</span>
        <span><b>${nf(tp.rollsPerPan, 0)}</b> rolls/pan</span>
      </div>
    </div>
    ${throughputMathHtml(tp.breakdown)}`;
}

export function renderMathTab(app) {
  app.innerHTML = `
  <div class="math-view">
    <div class="mv-head">
      <h2>🧮 Math Validator</h2>
      <p>Plug in raw totals to see the exact <b>Rolls/sec</b> derivation — the same formula the planner and optimizer run. Use it to validate the model before trusting the numbers.</p>
    </div>
    <div class="math-grid">
      <div class="mv-inputs">
        <div class="mv-fields">
          ${FIELDS.map(f => `<label class="mv-field">
            <span>${escapeHtml(f.label)}${f.unit ? ` <i>(${f.unit})</i>` : ''}</span>
            <input type="number" data-k="${f.key}" value="${S[f.key]}" step="any" inputmode="decimal">
          </label>`).join('')}
        </div>
        <label class="mv-ncheck">
          <input type="checkbox" data-k="useN" ${S.useN ? 'checked' : ''}>
          <span>Set <b>Digs to max (n)</b> directly <i>(bypass ⌈Capacity / Dig Strength⌉)</i></span>
        </label>
        <label class="mv-field mv-nfield" ${S.useN ? '' : 'hidden'}>
          <span>Digs to max (n)</span>
          <input type="number" data-k="nOverride" value="${S.nOverride}" step="1" min="0" inputmode="numeric">
        </label>
        <div class="mv-method">
          <span>Method</span>
          <div class="mv-seg">
            <button type="button" data-m="autopan" class="${S.method === 'autopan' ? 'on' : ''}">Autopan</button>
            <button type="button" data-m="sand" class="${S.method === 'sand' ? 'on' : ''}">Sand</button>
          </div>
        </div>
        <div class="mv-loadrow">${state.compareMode
          ? `<button type="button" class="mv-load btn" data-ref="a">⬇ Load Build A</button>
             <button type="button" class="mv-load btn" data-ref="b">⬇ Load Build B</button>`
          : `<button type="button" class="mv-load btn" data-ref="a">⬇ Load Build A totals</button>`}</div>
        <p class="mv-hint">Tip: load a build, then compare this Rolls/sec to the planner's — they should match exactly.</p>
      </div>
      <div class="mv-output">${outputHtml()}</div>
    </div>
  </div>`;

  const out = app.querySelector('.mv-output');
  const refresh = () => { out.innerHTML = outputHtml(); };

  app.querySelectorAll('input[data-k]').forEach(inp => {
    inp.addEventListener('input', () => {
      const k = inp.dataset.k;
      if (k === 'useN') {
        S.useN = inp.checked;
        // Seed the field with the current derived n so ticking the box doesn't
        // silently keep using the formula while looking like an override.
        if (S.useN && (S.nOverride === '' || S.nOverride == null)) {
          S.nOverride = String(Math.max(0, Math.ceil((S.capacity || 0) / Math.max(1, S.digStrength || 0))));
          const nf2 = app.querySelector('input[data-k="nOverride"]');
          if (nf2) nf2.value = S.nOverride;
        }
        app.querySelector('.mv-nfield').toggleAttribute('hidden', !S.useN);
      } else if (k === 'nOverride') {
        S.nOverride = inp.value;
      } else {
        S[k] = parseFloat(inp.value) || 0;
      }
      refresh();
    });
  });

  app.querySelectorAll('.mv-seg button').forEach(b => b.addEventListener('click', () => {
    S.method = b.dataset.m;
    app.querySelectorAll('.mv-seg button').forEach(x => x.classList.toggle('on', x.dataset.m === S.method));
    refresh();
  }));

  app.querySelectorAll('.mv-load').forEach(btn => btn.addEventListener('click', () => {
    // Load a build's FULL-PRECISION totals (no rounding) and drop any manual n
    // override, so the validator's Rolls/sec exactly matches the planner's.
    const ref = btn.dataset.ref || 'a';
    const t = buildMetrics(getBuild(ref), getBuffs(ref), getMuseum(ref)).totals;
    S.luck = t['Luck'] || 0; S.capacity = t['Capacity'] || 0;
    S.shakeSpeed = t['Shake Speed'] || 0; S.shakeStrength = t['Shake Strength'] || 0;
    S.digSpeed = t['Dig Speed'] || 0; S.digStrength = t['Dig Strength'] || 0;
    S.useN = false; S.nOverride = '';
    renderMathTab(app); // re-render so the input fields reflect the loaded totals
  }));
}
