// ---------------------------------------------------------------------------
// helpers.js — small shared UI utilities (formatting, DOM, escaping).
// ---------------------------------------------------------------------------

import { STAT_BY_KEY } from '../core/config.js';

/** Format a number compactly: trims decimals, adds thousands separators. */
export function fmt(v) {
  if (v == null || isNaN(v)) return '0';
  const rounded = Math.round(v * 100) / 100;
  return rounded.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/** Format a stat value with its unit (e.g. "140%" or "1,250"). */
export function fmtStat(key, v) {
  const meta = STAT_BY_KEY[key];
  return meta?.percent ? `${fmt(v)}%` : fmt(v);
}

/** Format a multiplier chip, blank when it's just x1. */
export function fmtMult(m) {
  if (!m || Math.abs(m - 1) < 1e-9) return '';
  return `×${fmt(m)}`;
}

/**
 * Map a mutation multiplier to its display color.
 * Used by optimizer chips, bulk editor chips, and anywhere mutations are shown.
 */
export function mutColor(mult) {
  if (mult >= 1.6)  return '#b060ee'; // Prismatic
  if (mult >= 1.4)  return '#ffd740'; // Festive
  if (mult >= 1.35) return '#4da8f5'; // Diamond/Granite/Overclocked
  if (mult >= 1.2)  return '#f0c84a'; // Gold
  return '#9e9e9e';                   // Silver
}

export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** querySelector shorthand. */
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Build an element from html string (first child). */
export function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
