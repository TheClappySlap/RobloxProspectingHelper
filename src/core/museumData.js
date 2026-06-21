// ---------------------------------------------------------------------------
// museumData.js — Museum ore / mutation data (miraheze-sourced; the single
// trusted source per the user). Ported verbatim from the standalone planner.
//
// Model: each filled museum slot contributes its ore's per-stat `max` boost,
// plus, if a mutation is set, `MUTATION_MULT[rarity]` for every stat that
// mutation touches. Stat keys here are the museum's own snake_case keys; the
// mapping to the build planner's stat names happens at the integration seam.
//
// Output is a MULTIPLIER per stat: summed boosts → shown as (1 + total)×, and
// museum multipliers stack ADDITIVELY with the rest of the build's pile.
// ---------------------------------------------------------------------------

export const RARITIES = [
  { id: 'common',    label: 'Common Ores',    color: 'var(--c-common)',    slots: 3 },
  { id: 'uncommon',  label: 'Uncommon Ores',  color: 'var(--c-uncommon)',  slots: 3 },
  { id: 'rare',      label: 'Rare Ores',      color: 'var(--c-rare)',      slots: 3 },
  { id: 'epic',      label: 'Epic Ores',      color: 'var(--c-epic)',      slots: 3 },
  { id: 'legendary', label: 'Legendary Ores', color: 'var(--c-legendary)', slots: 3 },
  { id: 'mythic',    label: 'Mythic Ores',    color: 'var(--c-mythic)',    slots: 2 },
  { id: 'exotic',    label: 'Exotic Ores',    color: 'var(--c-exotic)',    slots: 1 },
];

export const ORES = {
  common: [
    { name: 'Amethyst', kg: 20, effects: [{ stat: 'dig_speed', max: 0.05 }] },
    { name: 'Blue Ice', kg: 40, effects: [{ stat: 'dig_speed', max: 0.05 }] },
    { name: 'Copper', kg: 60, effects: [{ stat: 'size_boost', max: 0.04 }] },
    { name: 'Gold', kg: 40, effects: [{ stat: 'sell_boost', max: 0.05 }] },
    { name: 'Obsidian', kg: 30, effects: [{ stat: 'size_boost', max: 0.04 }] },
    { name: 'Pearl', kg: 20, effects: [{ stat: 'shake_speed', max: 0.05 }] },
    { name: 'Platinum', kg: 40, effects: [{ stat: 'dig_speed', max: 0.05 }] },
    { name: 'Pyrite', kg: 60, effects: [{ stat: 'capacity', max: 0.05 }] },
    { name: 'Seashell', kg: 20, effects: [{ stat: 'capacity', max: 0.05 }] },
    { name: 'Silver', kg: 40, effects: [{ stat: 'shake_speed', max: 0.05 }] },
  ],
  uncommon: [
    { name: 'Coral', kg: 10, effects: [{ stat: 'capacity', max: 0.08 }] },
    { name: 'Electrum', kg: 40, effects: [{ stat: 'sell_boost', max: 0.08 }] },
    { name: 'Glowberry', kg: 40, effects: [{ stat: 'sell_boost', max: 0.08 }] },
    { name: 'Malachite', kg: 20, effects: [{ stat: 'mod_boost', max: 0.08 }] },
    { name: 'Neodymium', kg: 40, effects: [{ stat: 'shake_amount', max: 0.08 }] },
    { name: 'Nickel', kg: 40, effects: [{ stat: 'capacity', max: 0.08 }] },
    { name: 'Rock Candy', kg: 60, effects: [{ stat: 'size_boost', max: 0.05 }] },
    { name: 'Sapphire', kg: 20, effects: [{ stat: 'dig_speed', max: 0.08 }] },
    { name: 'Smoky Quartz', kg: 20, effects: [{ stat: 'shake_amount', max: 0.08 }] },
    { name: 'Titanium', kg: 40, effects: [{ stat: 'dig_speed', max: 0.08 }] },
    { name: 'Topaz', kg: 20, effects: [{ stat: 'capacity', max: 0.08 }] },
    { name: 'Zircon', kg: 20, effects: [{ stat: 'size_boost', max: 0.05 }] },
  ],
  rare: [
    { name: 'Amber', kg: 20, effects: [{ stat: 'sell_boost', max: 0.13 }] },
    { name: 'Azuralite', kg: 30, effects: [{ stat: 'dig_speed', max: 0.13 }] },
    { name: 'Candy Cane', kg: 40, effects: [{ stat: 'size_boost', max: 0.09 }] },
    { name: 'Diopside', kg: 20, effects: [{ stat: 'mod_boost', max: 0.13 }] },
    { name: 'Glacial Quartz', kg: 40, effects: [{ stat: 'dig_speed', max: 0.13 }] },
    { name: 'Gloomberry', kg: 40, effects: [{ stat: 'dig_speed', max: 0.13 }] },
    { name: 'Jade', kg: 40, effects: [{ stat: 'mod_boost', max: 0.13 }] },
    { name: 'Lapis Lazuli', kg: 30, effects: [{ stat: 'dig_speed', max: 0.13 }] },
    { name: 'Meteoric Iron', kg: 40, effects: [{ stat: 'shake_amount', max: 0.13 }] },
    { name: 'Onyx', kg: 30, effects: [{ stat: 'mod_boost', max: 0.13 }] },
    { name: 'Peridot', kg: 20, effects: [{ stat: 'luck', max: 0.13 }] },
    { name: 'Pyrelith', kg: 30, effects: [{ stat: 'sell_boost', max: 0.13 }] },
    { name: 'Ruby', kg: 20, effects: [{ stat: 'shake_amount', max: 0.13 }] },
    { name: 'Silver Clamshell', kg: 20, effects: [{ stat: 'shake_speed', max: 0.13 }] },
  ],
  epic: [
    { name: 'Ammonite Fossil', kg: 50, effects: [{ stat: 'capacity', max: 0.20 }] },
    { name: 'Ashvein', kg: 20, effects: [{ stat: 'size_boost', max: 0.14 }] },
    { name: 'Aurorite', kg: 30, effects: [{ stat: 'dig_speed', max: 0.20 }] },
    { name: 'Bone', kg: 50, effects: [{ stat: 'size_boost', max: 0.14 }] },
    { name: 'Borealite', kg: 20, effects: [{ stat: 'dig_speed', max: 0.20 }] },
    { name: 'Cobalt', kg: 40, effects: [{ stat: 'dig_speed', max: 0.20 }] },
    { name: 'Emerald', kg: 20, effects: [{ stat: 'luck', max: 0.20 }] },
    { name: 'Glowmoss', kg: 60, effects: [{ stat: 'mod_boost', max: 0.20 }] },
    { name: 'Golden Pearl', kg: 20, effects: [{ stat: 'capacity', max: 0.20 }] },
    { name: 'Iridium', kg: 40, effects: [{ stat: 'dig_speed', max: 0.20 }] },
    { name: 'Lightshard', kg: 20, effects: [{ stat: 'dig_speed', max: 0.20 }] },
    { name: 'Mercury', kg: 80, effects: [{ stat: 'shake_amount', max: 0.20 }] },
    { name: 'Meteoric Gold', kg: 40, effects: [{ stat: 'sell_boost', max: 0.20 }] },
    { name: 'Moonstone', kg: 50, effects: [{ stat: 'shake_speed', max: 0.20 }] },
    { name: 'Opal', kg: 20, effects: [{ stat: 'shake_speed', max: 0.20 }] },
    { name: 'Osmium', kg: 80, effects: [{ stat: 'size_boost', max: 0.20 }] },
    { name: 'Pyronium', kg: 50, effects: [{ stat: 'sell_boost', max: 0.20 }] },
  ],
  legendary: [
    { name: 'Aetherite', kg: 20, effects: [{ stat: 'dig_speed', max: 0.30 }] },
    { name: 'Aquamarine', kg: 20, effects: [{ stat: 'dig_speed', max: 0.30 }] },
    { name: 'Bismuth', kg: 80, effects: [{ stat: 'dig_speed', max: 0.30 }] },
    { name: 'Catseye', kg: 20, effects: [{ stat: 'capacity', max: 0.30 }] },
    { name: 'Cinnabar', kg: 20, effects: [{ stat: 'size_boost', max: 0.21 }] },
    { name: 'Depleted Shard', kg: 40, effects: [{ stat: 'size_boost', max: 0.21 }] },
    { name: 'Diamond', kg: 20, effects: [{ stat: 'luck', max: 0.30 }] },
    { name: 'Dragon Bone', kg: 50, effects: [{ stat: 'size_boost', max: 0.21 }] },
    { name: 'Fire Opal', kg: 20, effects: [{ stat: 'size_boost', max: 0.21 }] },
    { name: 'Firefly Stone', kg: 60, effects: [{ stat: 'capacity', max: 0.30 }] },
    { name: 'Gloomcap', kg: 20, effects: [{ stat: 'dig_speed', max: 0.30 }] },
    { name: 'Lost Soul', kg: 20, effects: [{ stat: 'dig_speed', max: 0.30 }] },
    { name: 'Luminum', kg: 40, effects: [{ stat: 'capacity', max: 0.30 }] },
    { name: 'Nautilus Shell', kg: 50, effects: [{ stat: 'capacity', max: 0.30 }] },
    { name: 'Palladium', kg: 40, effects: [{ stat: 'sell_boost', max: 0.30 }] },
    { name: 'Peppermint Prism', kg: 20, effects: [{ stat: 'mod_boost', max: 0.30 }] },
    { name: 'Radium', kg: 60, effects: [{ stat: 'mod_boost', max: 0.30 }] },
    { name: 'Rose Gold', kg: 40, effects: [{ stat: 'shake_amount', max: 0.30 }] },
    { name: 'Specterite', kg: 10, effects: [{ stat: 'shake_speed', max: 0.30 }] },
    { name: 'Starshine', kg: 20, effects: [{ stat: 'dig_speed', max: 0.15 }, { stat: 'shake_speed', max: 0.15 }] },
    { name: 'Tourmaline', kg: 24, effects: [{ stat: 'sell_boost', max: 0.30 }] },
    { name: 'Uranium', kg: 60, effects: [{ stat: 'mod_boost', max: 0.30 }] },
    { name: 'Volcanic Key', kg: 20, effects: [{ stat: 'size_boost', max: 0.21 }] },
  ],
  mythic: [
    { name: 'Aetherium', kg: 20, effects: [{ stat: 'dig_speed', max: 0.5 }] },
    { name: 'Chrysoberyl', kg: 20, effects: [{ stat: 'luck', max: 0.5 }] },
    { name: 'Flarebloom', kg: 20, effects: [{ stat: 'luck', max: 0.75 }, { stat: 'size_boost', max: -0.5 }] },
    { name: 'Frostshard', kg: 20, effects: [{ stat: 'dig_strength', max: 0.5 }] },
    { name: 'Inferlume', kg: 20, effects: [{ stat: 'luck', max: 0.5 }] },
    { name: 'Mythril', kg: 60, effects: [{ stat: 'shake_amount', max: 0.5 }] },
    { name: 'Painite', kg: 20, effects: [{ stat: 'size_boost', max: 0.35 }] },
    { name: 'Pink Diamond', kg: 20, effects: [{ stat: 'luck', max: 0.5 }] },
    { name: 'Prismara', kg: 20, effects: [{ stat: 'luck', max: 0.25 }, { stat: 'capacity', max: 0.25 }, { stat: 'dig_strength', max: 0.25 }, { stat: 'shake_amount', max: 0.25 }] },
    { name: 'Radiant Gold', kg: 60, effects: [{ stat: 'sell_boost', max: 0.5 }] },
    { name: 'Red Beryl', kg: 20, effects: [{ stat: 'size_boost', max: 0.35 }] },
    { name: 'Star Garnet', kg: 20, effects: [{ stat: 'size_boost', max: 0.35 }] },
    { name: 'Sunstone', kg: 40, effects: [{ stat: 'sell_boost', max: 0.5 }] },
    { name: 'Volcanic Core', kg: 20, effects: [{ stat: 'dig_strength', max: 0.25 }, { stat: 'size_boost', max: 0.20 }] },
    { name: 'Vortessence', kg: 20, effects: [{ stat: 'capacity', max: 0.5 }] },
  ],
  exotic: [
    { name: 'Adamantine', kg: 40, effects: [{ stat: 'mod_boost', max: 0.8 }] },
    { name: 'Astral Spore', kg: 20, effects: [{ stat: 'dig_speed', max: 0.8 }] },
    { name: 'Bloodstone', kg: 40, effects: [{ stat: 'size_boost', max: 0.56 }] },
    { name: 'Celestium', kg: 40, effects: [{ stat: 'luck', max: 0.48 }, { stat: 'shake_speed', max: 0.48 }] },
    { name: 'Cryonic Artifact', kg: 20, effects: [{ stat: 'dig_strength', max: 1.2 }, { stat: 'shake_amount', max: 1.2 }, { stat: 'dig_speed', max: -0.8 }, { stat: 'shake_speed', max: -0.8 }] },
    { name: 'Dinosaur Skull', kg: 100, effects: [{ stat: 'sell_boost', max: 0.4 }, { stat: 'size_boost', max: 0.32 }] },
    { name: 'Eternium', kg: 20, effects: [{ stat: 'luck', max: 0.32 }, { stat: 'dig_speed', max: 0.32 }, { stat: 'shake_speed', max: 0.32 }] },
    { name: 'Forgotten Totem', kg: 40, effects: [{ stat: 'sell_boost', max: 0.8 }] },
    { name: 'North Star', kg: 40, effects: [{ stat: 'luck', max: 0.32 }, { stat: 'capacity', max: 0.32 }, { stat: 'dig_speed', max: 0.32 }, { stat: 'shake_speed', max: 0.32 }] },
  ],
};

// Each mutation boosts a fixed set of stats; the per-stat amount is the rarity's
// MUTATION_MULT. `stats` is the flat list of stats this mutation can boost.
export const MUTATIONS = [
  { id: 'perfect',    label: 'Perfect',    stats: ['luck', 'capacity', 'size_boost'] },
  { id: 'treasured',  label: 'Treasured',  stats: ['luck'] },
  { id: 'lunar',      label: 'Lunar',      stats: ['dig_speed', 'shake_speed', 'walk_speed'] },
  { id: 'voidtorn',   label: 'Voidtorn',   stats: ['luck', 'capacity'] },
  { id: 'mutated',    label: 'Mutated',    stats: ['luck', 'dig_strength', 'mod_boost'] },
  { id: 'cosmic',     label: 'Cosmic',     stats: ['capacity', 'shake_amount'] },
  { id: 'electrified', label: 'Electrified', stats: ['dig_speed', 'shake_speed'] },
  { id: 'iridescent', label: 'Iridescent', stats: ['luck'] },
  { id: 'crystalline', label: 'Crystalline', stats: ['size_boost'] },
  { id: 'irradiated', label: 'Irradiated', stats: ['mod_boost'] },
  { id: 'scorching',  label: 'Scorching',  stats: ['dig_strength'] },
  { id: 'glowing',    label: 'Glowing',    stats: ['shake_speed'] },
  { id: 'pure',       label: 'Pure',       stats: ['dig_speed'] },
  { id: 'shiny',      label: 'Shiny',      stats: ['shake_amount'] },
];

// Per-mutation-stat boost, by ore rarity.
export const MUTATION_MULT = { common: 0.01, uncommon: 0.01, rare: 0.01, epic: 0.02, legendary: 0.03, mythic: 0.05, exotic: 0.08 };

// Display order + colors for stats. `css` matches the scoped .museum-view palette.
export const STAT_CONFIG = {
  luck:         { label: 'Luck',        css: 'c-luck' },
  capacity:     { label: 'Capacity',    css: 'c-capacity' },
  dig_speed:    { label: 'DigSpeed',    css: 'c-digspeed' },
  shake_amount: { label: 'ShakeAmount', css: 'c-shakeamount' },
  shake_speed:  { label: 'ShakeSpeed',  css: 'c-shakespeed' },
  size_boost:   { label: 'SizeBoost',   css: 'c-sizeboost' },
  mod_boost:    { label: 'ModBoost',    css: 'c-modboost' },
  dig_strength: { label: 'DigStrength', css: 'c-digstrength' },
  dig_amount:   { label: 'DigAmount',   css: 'c-digamount' },
  sell_boost:   { label: 'SellBoost',   css: 'c-sellboost' },
  walk_speed:   { label: 'WalkSpeed',   css: 'c-walkspeed' },
};

// Stat display order for the totals readout + filter bar.
export const STAT_ORDER = ['luck', 'capacity', 'dig_speed', 'shake_amount', 'shake_speed', 'size_boost', 'mod_boost', 'dig_strength', 'dig_amount', 'sell_boost', 'walk_speed'];

/** The mutation that best matches a target stat (for autofill): one that boosts
 *  the target and the FEWEST off-target stats (most concentrated). */
export function bestMutationFor(targetStat) {
  return MUTATIONS
    .filter(m => m.stats.includes(targetStat))
    .sort((a, b) => a.stats.length - b.stats.length)[0] || null;
}
