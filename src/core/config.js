// ---------------------------------------------------------------------------
// config.js — single source of truth for stats, slots, rarities, constants.
// Tweak NUM_RINGS / NUM_RUNES here if the in-game kit layout differs.
// ---------------------------------------------------------------------------

/**
 * The core stats tracked by the planner. `key` MUST match the stat names used
 * in the game data (equipment_database.js). `base` is the game's starting value
 * before any gear. `percent` controls display formatting only.
 */
// Order, colors, and stat list mirror the in-game Total Stats screen.
// `base` = zero-gear defaults; values marked /* ? */ are approximate (no data
// yet) and will be confirmed in the math/correctness pass.
export const STATS = [
  { key: 'Luck',               label: 'Luck',               base: 0,   percent: false, color: '#6bd968' },
  { key: 'Dig Strength',       label: 'Dig Strength',       base: 1,   percent: false, color: '#dcb588' },
  { key: 'Capacity',           label: 'Capacity',           base: 0,   percent: false, color: '#f0c84a' },
  { key: 'Dig Speed',          label: 'Dig Speed',          base: 100, percent: true,  color: '#5aa9e6' },
  { key: 'Toughness',          label: 'Toughness',          base: 0,   percent: false, color: '#eee6d4' },
  { key: 'Shake Strength',     label: 'Shake Strength',     base: 0,   percent: false, color: '#dcb588' },
  { key: 'Inventory Size',     label: 'Inventory Size',     base: 0,   percent: false, color: '#e89a3c' },
  { key: 'Shake Speed',        label: 'Shake Speed',        base: 100, percent: true,  color: '#eee6d4' },
  { key: 'Efficiency',         label: 'Efficiency',         base: 1,   percent: false, color: '#eee6d4' },
  { key: 'Treasure Map Chance', label: 'Treasure Map Chance', base: 5, percent: true, color: '#f0c84a' },
  { key: 'Sell Boost',         label: 'Sell Boost',         base: 0,   percent: true,  color: '#f2d64a' },
  { key: 'Size Boost',         label: 'Size Boost',         base: 100, percent: true,  color: '#e8604c' },
  { key: 'Status Timer Speed', label: 'Status Timer Speed', base: 100, percent: true,  color: '#b07de0' },
  { key: 'Modifier Boost',     label: 'Modifier Boost',     base: 100, percent: true,  color: '#6bd968' },
  { key: 'Walk Speed',         label: 'Walk Speed',         base: 3,   percent: false, color: '#eee6d4' },
  { key: 'Jump Power',         label: 'Jump Power',         base: 1,   percent: false, color: '#dcb588' },
];

export const STAT_KEYS = STATS.map(s => s.key);
export const STAT_BY_KEY = Object.fromEntries(STATS.map(s => [s.key, s]));

/** Star-tier multiplier applied to accessory roll ranges (★1 … ★6). */
export const STAR_MULT = [0.5, 0.625, 0.75, 0.875, 1.0, 1.0];

// --- Kit layout -------------------------------------------------------------
// The game has 8 ring slots; the last 2 unlock late, so they start locked
// behind the "Unlock extra ring slots" button (see store.ringsUnlocked).
export const NUM_RINGS = 8;
export const RINGS_LOCKED_FROM = 7; // ring7 & ring8 are lockable
export const NUM_RUNES = 5;

// --- Equip-once items --------------------------------------------------------
// Some items can only be worn ONE at a time (no duplicates across slots). The
// data carries no flag for this, so it's maintained here by id. Every Ascended
// item is unique by rule; add other limited items below.
// Confirmed equip-once items from gear_data.json descriptions ("ONLY ONE CAN BE
// WORN"). Ring of Champions / Ring of the Stars are Ascended (also caught by the
// rarity rule below) but listed explicitly so the rule is robust to data fixes.
export const UNIQUE_EQUIP_IDS = new Set([
  'dredge-masters-ring', // Dredge Master's Ring (Exotic) — limit 1
  'ring-of-champions',   // Ascended — limit 1
  'ring-of-the-stars',   // Ascended — limit 1
]);

/** True if `item` can only be equipped once across a build. */
export function isUniqueEquip(item) {
  if (!item) return false;
  return (item.rarity || '').toLowerCase() === 'ascended' || UNIQUE_EQUIP_IDS.has(item.id);
}

/**
 * @typedef {Object} SlotDef
 * @property {string} key   unique slot id used in state (e.g. "ring1")
 * @property {string} label human label shown in UI
 * @property {string} cat   key into the equipment database (e.g. "rings")
 * @property {'tool'|'accessory'|'rune'} kind  how the engine scores it
 * @property {string} group section grouping for the board layout
 */

/** @returns {SlotDef[]} */
function buildSlots() {
  const slots = [
    { key: 'pan',      label: 'Pan',      cat: 'pans',      kind: 'tool',      group: 'tools'    },
    { key: 'shovel',   label: 'Shovel',   cat: 'shovels',   kind: 'tool',      group: 'tools'    },
    { key: 'necklace', label: 'Neck',     cat: 'necklaces', kind: 'accessory', group: 'trinkets' },
    { key: 'charm',    label: 'Charm', cat: 'charms',    kind: 'accessory', group: 'trinkets' },
  ];
  for (let i = 1; i <= NUM_RUNES; i++) {
    slots.push({ key: `rune${i}`, label: `Rune ${i}`, cat: 'runes', kind: 'rune', group: 'runes' });
  }
  for (let i = 1; i <= NUM_RINGS; i++) {
    slots.push({
      key: `ring${i}`, label: `Ring ${i}`, cat: 'rings', kind: 'accessory', group: 'rings',
      lockable: i >= RINGS_LOCKED_FROM,
    });
  }
  return slots;
}

/** Ring slots that are hidden until the user unlocks the extra slots. */
export const LOCKABLE_SLOT_KEYS = SLOTSLockable();
function SLOTSLockable() {
  const keys = [];
  for (let i = RINGS_LOCKED_FROM; i <= NUM_RINGS; i++) keys.push(`ring${i}`);
  return keys;
}

export const SLOTS = buildSlots();
export const SLOT_BY_KEY = Object.fromEntries(SLOTS.map(s => [s.key, s]));

// --- Rarities ---------------------------------------------------------------
export const RARITY_ORDER = [
  'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'exotic', 'ascended',
];

export const RARITY_COLORS = {
  common:    '#9ca3af',
  uncommon:  '#22c55e',
  rare:      '#3b82f6',
  epic:      '#a855f7',
  legendary: '#f59e0b',
  mythic:    '#ec4899',
  exotic:    '#ef4444',
  ascended:  '#e5e7eb',
};

export function rarityColor(r) {
  return RARITY_COLORS[(r || '').toLowerCase()] || '#7c8cff';
}

export const RARITY_LABELS = {
  common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic',
  legendary: 'Legendary', mythic: 'Mythic', exotic: 'Exotic', ascended: 'Ascended',
};
export function rarityLabel(r) {
  const k = (r || '').toLowerCase();
  return RARITY_LABELS[k] || (r || '');
}

// --- Mutation colors (match the in-game tinting on item names) --------------
export const MUTATION_COLORS = {
  silver:      '#cfd4da',
  gold:        '#f2c14e',
  diamond:     '#5fd3e0',
  prismatic:   '#c77dff',
  festive:     '#ff5d73',
  overclocked: '#ff8a3d',
  granite:     '#9a9085',
};
export function mutationColor(id) {
  return MUTATION_COLORS[id] || '#f7a8cf';
}

/** Enchants map directly to their in-game colored prefixes */
export const ENCHANT_COLORS = {
  // Pans
  'forceful': '#e58e8e',
  'strong': '#e6b981',
  'swift': '#d4dbd6',
  'lucky': '#b3ff66',
  'boosting': '#e88e4c',
  'destructive': '#e58e8e',
  'gigantic': '#d67926',
  'glowing': '#e6c966',
  'greedy': '#e6f066',
  'unstable': '#b366ff',
  'blessed': '#e6e666',
  'midas': '#e6e619',
  'titanic': '#66a3ff',
  'cosmic': '#ff33ff',
  'divine': '#ffd633',
  'infernal': '#ff6600',
  'prismatic': '#ff66ff',
  'cursed': '#4d0099',
  'devouring': '#990000',
  'hyperspeed': '#6699ff',
  'irregular': '#33cc33',
  'mystical': '#9933ff',
  'starstruck': '#ff3399',
  // Shovels
  'excavating': '#b38f66',
  'geothermal': '#ff9933',
  'mastered': '#9900ff',
  'mythical': '#ff6666',
  'non euclidean': '#ffff99',
  'rhythmic': '#33ff33',
  'synergized': '#ff0066',
  'toughened': '#997a4d',
  'treasure hunter': '#ffcc66',
  'void touched': '#cc66ff',
  'well balanced': '#99ff99',
  'wormhole': '#3399ff',
};

export function enchantColor(id) {
  if (!id) return '#c084fc';
  const name = String(id).toLowerCase();
  return ENCHANT_COLORS[name] || '#c084fc';
}
