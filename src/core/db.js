// ---------------------------------------------------------------------------
// db.js — thin access layer over the raw game data files.
// Keeps the rest of the app from caring about how the data is shaped/stored.
// ---------------------------------------------------------------------------

import { equipmentDatabaseRaw } from '../../data/equipment_database.js';
import { gearDataRaw } from '../../data/gear_data.js';

export const DB = equipmentDatabaseRaw;

// Pre-index every category by item id for O(1) lookups.
const byId = {};
for (const cat of Object.keys(DB)) {
  if (Array.isArray(DB[cat])) {
    byId[cat] = {};
    for (const item of DB[cat]) {
      if (item && item.id) byId[cat][item.id] = item;
    }
  }
}

export function getItem(cat, id) {
  if (!id) return null;
  return byId[cat]?.[id] || null;
}

export function getItems(cat) {
  return DB[cat] || [];
}

export function getMutation(id) {
  return (DB.mutations || []).find(m => m.id === id) || null;
}

/**
 * Return an enchant by id, with an `effects` array in engine format derived
 * from the DB's `toolStats` if `effects` isn't already present.
 * Engine format: { kind: 'mult', stat, multiplier } | { kind: 'add', stat, value }
 */
export function getEnchant(id) {
  const enc = (DB.enchants || []).find(e => e.id === id);
  if (!enc) return null;
  if (enc.effects) return enc; // already in engine format
  // Translate toolStats → effects on the fly.
  const effects = (enc.toolStats || []).map(ts => {
    if (ts.unit === 'x') return { kind: 'mult', stat: ts.name, multiplier: ts.value };
    return { kind: 'add', stat: ts.name, value: ts.value };
  });
  return { ...enc, effects };
}

/** Enchants valid for a given slot label ("Pan" / "Shovel"). */
export function enchantsFor(slotLabel) {
  return (DB.enchants || []).filter(e => !e.appliesTo || e.appliesTo === slotLabel);
}

export function trinketsFor(slotLabel) {
  return (DB.trinkets || []).filter(t => !t.appliesTo || t.appliesTo === slotLabel);
}

export function getMutations() {
  return DB.mutations || [];
}

// --- Images -----------------------------------------------------------------
// Many database entries store a placeholder image (an array like [0]); fall
// back to the richer gear_data list, matched by name.
const gearImgByName = {};
for (const g of gearDataRaw || []) {
  if (g && g.name && g.image_url) gearImgByName[g.name.toLowerCase()] = g.image_url;
}

export function itemImage(item) {
  if (!item) return '';
  if (typeof item.image === 'string' && item.image) return item.image;
  const named = gearImgByName[(item.name || '').toLowerCase()];
  return named || '';
}
