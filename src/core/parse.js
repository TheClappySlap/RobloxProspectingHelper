// ---------------------------------------------------------------------------
// parse.js — turns wiki-style stat strings into structured ranges.
// Example inputs:
//   "Luck: 1-2.5 (★6: 0.5–2.2)"
//   "Dig Speed: 20-40% (★6: 20-42%)"
//   "Size Boost: 0–45% (★6: 0–50%)"
// ---------------------------------------------------------------------------

const NUM = String.raw`-?[\d,]+(?:\.\d+)?%?`;
const RANGE_RE = new RegExp(String.raw`^(${NUM})\s*-\s*(${NUM})$`);
const STAT_RE = /^([^:]+):\s*(.+?)(?:\s*\((?:★)?6:\s*(.+?)\))?\s*$/;

/** Normalize the various dash glyphs the wiki uses to a plain hyphen. */
export function cleanDash(t) {
  return t.replace(/[–—−]/g, '-');
}

function parseUnitValue(t) {
  const n = t.trim();
  return n.endsWith('%') ? { value: n.slice(0, -1).trim(), unit: '%' } : { value: n, unit: '' };
}

function parseToFloat(t) {
  const { value } = parseUnitValue(t.trim());
  const n = parseFloat(value.replace(/,/g, ''));
  return isNaN(n) ? null : n;
}

/** @returns {{min:number,max:number,unit:string}|null} */
export function parseStatRange(t) {
  const cleaned = cleanDash(t.trim());
  const m = cleaned.match(RANGE_RE);
  if (m) {
    const unit = parseUnitValue(m[1]).unit || parseUnitValue(m[2]).unit;
    const lo = parseToFloat(m[1]);
    const hi = parseToFloat(m[2]);
    if (lo !== null && hi !== null) return { min: lo, max: hi, unit };
  }
  const single = parseUnitValue(cleaned);
  const v = parseToFloat(single.value);
  return v !== null ? { min: v, max: v, unit: single.unit } : null;
}

/**
 * Parse a full "Name: range (★6: range)" string.
 * @returns {{kind:'range',name:string,base:object,star6:object}|{kind:'note',raw:string}}
 */
export function parseWikiStatString(t) {
  const m = cleanDash(t).match(STAT_RE);
  if (!m) return { kind: 'note', raw: t };
  const base = parseStatRange(m[2].trim());
  if (!base) return { kind: 'note', raw: t };
  const star6 = m[3] ? parseStatRange(m[3].trim()) : null;
  return { kind: 'range', name: m[1].trim(), base, star6: star6 ?? base };
}
