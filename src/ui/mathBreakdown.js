// ---------------------------------------------------------------------------
// mathBreakdown.js — renders a throughput `breakdown` (from throughputMath.js)
// as a clean step-by-step derivation. Shared by the Math validator tab and the
// gear planner's "Advanced math" section so both show identical, validatable math.
// ---------------------------------------------------------------------------

import { escapeHtml } from './helpers.js';

const nf = (x, dp = 2) => (x == null || isNaN(x)) ? '—' : Number(x).toLocaleString(undefined, { maximumFractionDigits: dp });

function stepRow(s) {
  // seconds & rates get more precision; counts stay tidy
  const dp = (s.unit === 's' || s.kind === 'result' || s.unit === '/s') ? 3 : 2;
  const unit = s.unit && s.unit !== '/s' ? s.unit : (s.unit === '/s' ? ' /s' : '');
  return `<div class="tp-step tp-${escapeHtml(s.kind)}">
    <div class="tp-step-h">
      <span class="tp-step-label">${escapeHtml(s.label)}</span>
      <span class="tp-step-val">${nf(s.value, dp)}${unit}</span>
    </div>
    <div class="tp-step-expr">${escapeHtml(s.expr)}</div>
    ${s.note ? `<div class="tp-step-note">${escapeHtml(s.note)}</div>` : ''}
  </div>`;
}

/** HTML string for a breakdown (or empty string if none). */
export function throughputMathHtml(breakdown) {
  if (!breakdown || !breakdown.steps) return '';
  const method = breakdown.method === 'sand' ? 'Sand (no autopan)' : 'Autopan';
  const body = breakdown.steps.map(stepRow).join('');
  const stop = breakdown.stopped ? `<div class="tp-stop">⚠️ ${escapeHtml(breakdown.stopped)}</div>` : '';
  return `<div class="tp-math">
    <div class="tp-method">Method: <b>${escapeHtml(method)}</b></div>
    ${body}${stop}
  </div>`;
}

export function renderThroughputMath(root, breakdown) {
  root.innerHTML = throughputMathHtml(breakdown);
}
