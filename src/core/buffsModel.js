// ---------------------------------------------------------------------------
// buffsModel.js — buffs / potions / totems / events for the engine AND panel.
//
// Potions are sourced from equipment_database.js (`DB.buffs`) for their values;
// here we split them by CURRENCY (coins / shards / traveling merchant) and add
// the Totems and Events (defined locally).
//
// Effects the engine applies:
//   { stat, add }                 → flat additive bonus (× stack count for counters)
//   { stat, mult }                → ADDITIVE multiplier (1.5 → +0.5 into the pile)
//   { stat, mult, global: true }  → GLOBAL multiplicative (applied after the pile)
// ---------------------------------------------------------------------------

import { DB } from './db.js';

const NORM = { WalkSpeed: 'Walk Speed', walkspeed: 'Walk Speed' };
const norm = s => NORM[s] || s;

/** Map an equipment_database buff entry into an engine-friendly buff. */
function fromDb(b) {
  const counter = !!(b.maxStacks && b.maxStacks > 1);
  const effects = (b.effects || []).map(e => ({ stat: norm(e.stat), add: e.value }));
  const desc = effects.length
    ? (b.effects || []).map(e => `+${e.value}${e.perStack ? '/stack' : ''} ${norm(e.stat)}`).join(' · ')
    : undefined;
  return {
    id: b.id, name: b.name, emoji: b.emoji, category: b.category,
    type: counter ? 'counter' : 'toggle', max: counter ? b.maxStacks : undefined,
    effects, desc,
  };
}

const dbBuffs = (DB.buffs || []).map(fromDb);
const byId = id => dbBuffs.find(b => b.id === id);
const pick = ids => ids.map(byId).filter(Boolean);
const inCat = cat => dbBuffs.filter(b => b.category === cat);

// Potions split by where you buy them (coins / shards / traveling merchant).
const COIN_POTIONS = ['buff_basic_luck', 'buff_basic_cap', 'buff_volc_luck', 'buff_volc_str',
  'buff_frozen_luck', 'buff_frozen_speed', 'buff_witches_brew', 'buff_cosmic'];
const SHARD_POTIONS = ['buff_greater_luck', 'buff_greater_cap', 'buff_supreme_luck',
  'buff_cryonic_brew', 'buff_ambrosia', 'buff_stardust_shake', 'buff_merchant'];
const TRAVELER_POTIONS = ['buff_instability', 'buff_quake', 'buff_blitz'];

// Totems are MULTIPLIERS (verified) and stack additively into the mult pile.
const TOTEMS = [
  { id: 'totem_luck',       name: 'Luck Totem',       type: 'toggle',
    effects: [{ stat: 'Luck', mult: 2 }], desc: '2× Luck' },
  { id: 'totem_strength',   name: 'Strength Totem',   type: 'toggle',
    effects: [{ stat: 'Dig Strength', mult: 2 }, { stat: 'Shake Strength', mult: 2 }], desc: '2× Dig & Shake Strength' },
  { id: 'totem_luminant',   name: 'Luminant Totem',   type: 'toggle',
    effects: [{ stat: 'Capacity', mult: 1.5 }, { stat: 'Dig Speed', mult: 1.5 }, { stat: 'Shake Speed', mult: 1.5 }], desc: '1.5× Capacity, Dig & Shake Speed' },
  { id: 'totem_friendship', name: 'Friendship Totem', type: 'counter', max: 20,
    effects: [{ stat: 'Luck', mult: 1.2 }], desc: '+0.2× Luck per nearby player' },
];

// Events — mostly GLOBAL multiplicative (luck / modifier / size). Several are
// location-gated and/or also give an "items from panning" multiplier that isn't
// a tracked stat (noted in the description). Shifting Tides is ADDITIVE.
const EVENTS = [
  { id: 'event_blizzard', name: 'Blizzard', type: 'toggle',
    effects: [{ stat: 'Luck', mult: 1.5, global: true }],
    desc: '1.5× Luck & 1.5× items — Frostbite River / Waterfall / Frozen Peak' },
  { id: 'event_meteor_shower', name: 'Meteor Shower', type: 'toggle',
    effects: [{ stat: 'Luck', mult: 2, global: true }], desc: '2× Luck (multiplicative)' },
  { id: 'event_nimue', name: "Nimue's Blessing", type: 'toggle',
    effects: [{ stat: 'Luck', mult: 1.5, global: true }],
    desc: '1.5× Luck — Overgrown Grotto / Deeproot Spring / Enchanted Ruins' },
  { id: 'event_river_rapids', name: 'River Rapids', type: 'toggle',
    effects: [], desc: '2× items — Fortune River / Fortune River Delta' },
  { id: 'event_solar_flare', name: 'Solar Flare', type: 'toggle',
    effects: [{ stat: 'Size Boost', mult: 2, global: true }, { stat: 'Modifier Boost', mult: 2, global: true }],
    desc: '2× Size & 2× Modifier chance' },
  { id: 'event_volcanic_eruption', name: 'Volcanic Eruption', type: 'toggle',
    effects: [{ stat: 'Size Boost', mult: 2, global: true }],
    desc: '2× mineral size; 1.5× items — Volcanic Sands / Windswept Beach / Volcanic Springs / Magma Furnace / Infernal Heart' },
  { id: 'event_swamp_fog', name: 'Swamp Fog', type: 'toggle',
    effects: [{ stat: 'Luck', mult: 1.5, global: true }], desc: '1.5× — Rotwood Swamp / Fungal Marsh' },
  { id: 'buff_mod_surge', name: 'Modifier Surge', type: 'toggle',
    effects: [{ stat: 'Modifier Boost', mult: 2, global: true }], desc: '2× Modifier chance' },
  { id: 'event_starfall', name: 'Starfall', type: 'toggle',
    effects: [{ stat: 'Luck', mult: 1.5, global: true }, { stat: 'Modifier Boost', mult: 1.5, global: true }],
    desc: '1.5× Luck & 1.5× Modifier chance' },
  { id: 'buff_shifting', name: 'Shifting Tides', type: 'toggle',
    effects: [{ stat: 'Luck', mult: 2 }], desc: '+1× Luck (additive)' },
  { id: 'event_bonfire', name: 'Night of the Bonfire', type: 'toggle',
    effects: [], desc: 'Limited event' },
];

// ---------------------------------------------------------------------------
// Extra permanent buffs not in the DB (defined locally).
// ---------------------------------------------------------------------------

const MASTERY_BUFF = {
  id: 'mastery_bonus',
  name: 'Mastery Bonus',
  type: 'select',
  options: [
    { value: 'none',  label: 'None',  effects: [] },
    { value: '1.05',  label: '×1.05', effects: [{ stat: 'Luck', mult: 1.05 }] },
    { value: '1.1',   label: '×1.1',  effects: [{ stat: 'Luck', mult: 1.1  }] },
    { value: '1.15',  label: '×1.15', effects: [{ stat: 'Luck', mult: 1.15 }] },
    { value: '1.2',   label: '×1.2',  effects: [{ stat: 'Luck', mult: 1.2  }] },
    { value: '1.25',  label: '×1.25', effects: [{ stat: 'Luck', mult: 1.25 }] },
  ],
  effects: [], // resolved dynamically by the engine via resolveBuffEffects()
  desc: 'Mastery rank bonus — additive Luck multiplier',
};

const FRIEND_BUFF = {
  id: 'friend_bonus',
  name: 'Friend Bonus',
  type: 'counter',
  max: 5,
  effects: [{ stat: 'Luck', mult: 1.1 }], // +0.1× Luck per friend (additive, ×N for N friends)
  desc: '+10% Luck per friend (up to 5 friends = +50%)',
};

// ---------------------------------------------------------------------------
// Build permanent group: pull from DB then inject local buffs.
// Order: MASTERY_BUFF first, then DB permanents (with Dredge Master & Daily Login
// adjacent), then FRIEND_BUFF at end.
// ---------------------------------------------------------------------------

function buildPermanentGroup() {
  const dbPerms = inCat('Permanent');
  // Split out Dredge Master so we can place it next to the login bonus (which is
  // in the Misc category in the DB but logically belongs adjacent to Dredge Master).
  // We reconstruct the order: [MASTERY_BUFF, ...dbPerms with dredge inserted before
  // any trailing items, FRIEND_BUFF].
  // The DB permanent order: MVP Economist, Mastery Bonus (DB stub), Dredge Master,
  // Blessing of the Spirits, Ancient Blessing, Trader's Recommendation, Museum,
  // Lighthouse Blessing.
  // We replace the DB's "Mastery Bonus" stub with our MASTERY_BUFF select type.
  const withoutDbMastery = dbPerms.filter(b => b.id !== 'buff_mastery');
  // Daily Login is in DB as Misc ("buff_login") — pull it and place after Dredge Master.
  const dailyLogin = byId('buff_login');
  // Insert Daily Login right after Dredge Master so they are adjacent.
  const result = [];
  for (const b of withoutDbMastery) {
    result.push(b);
    if (b.id === 'buff_dredge' && dailyLogin) result.push(dailyLogin);
  }
  return [MASTERY_BUFF, ...result, FRIEND_BUFF];
}

// Misc group: exclude buff_login since we moved it to permanent.
function buildMiscGroup() {
  return inCat('Misc').filter(b => b.id !== 'buff_login');
}

// Group order (per spec): Totems → Permanent → Coin → Shard → Traveler → Events → Misc.
export const BUFF_GROUPS = [
  { id: 'totems',    title: 'Totems',            buffs: TOTEMS },
  { id: 'permanent', title: 'Permanent',         buffs: buildPermanentGroup() },
  { id: 'coins',     title: 'Coin Potions',      buffs: pick(COIN_POTIONS) },
  { id: 'shards',    title: 'Shard Potions',     buffs: pick(SHARD_POTIONS) },
  { id: 'travelers', title: 'Traveler Potions',  buffs: pick(TRAVELER_POTIONS) },
  { id: 'events',    title: 'Events',            buffs: EVENTS },
  { id: 'misc',      title: 'Misc',              buffs: buildMiscGroup() },
];

/** Flat list for the engine. */
export const ALL_BUFFS = BUFF_GROUPS.flatMap(g => g.buffs);
export const BUFF_BY_ID = Object.fromEntries(ALL_BUFFS.map(b => [b.id, b]));

/**
 * Resolve the active effects for a buff given the stored value.
 * For 'select' type: look up the matching option's effects.
 * For all other types: return b.effects directly (counter factoring is done by the engine).
 */
export function resolveBuffEffects(buff, val) {
  if (buff.type === 'select') {
    const opt = (buff.options || []).find(o => String(o.value) === String(val));
    return opt ? opt.effects : [];
  }
  return buff.effects || [];
}
