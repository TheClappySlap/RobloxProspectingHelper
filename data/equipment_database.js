export const equipmentDatabaseRaw = {
  "buffs": [
    { "id": "buff_login", "name": "Daily Login Bonus", "type": "Buff", "category": "Misc", "maxStacks": 10, "effects": [{ "stat": "Luck", "value": 5, "perStack": true }], "emoji": "🎁" },
    { "id": "buff_mvp_economist", "name": "MVP: Economist", "type": "Buff", "category": "Permanent", "maxStacks": 1, "effects": [], "emoji": "💰" },
    { "id": "buff_mastery", "name": "Mastery Bonus", "type": "Buff", "category": "Permanent", "maxStacks": 1, "effects": [], "emoji": "👑" },
    { "id": "buff_dredge", "name": "Dredge Master", "type": "Buff", "category": "Permanent", "maxStacks": 20, "effects": [{ "stat": "Luck", "value": 3, "perStack": true }], "emoji": "⚓" },
    { "id": "buff_spirits", "name": "Blessing of the Spirits", "type": "Buff", "category": "Permanent", "maxStacks": 1, "effects": [{ "stat": "Luck", "value": 50 }], "emoji": "👻" },
    { "id": "buff_ancient", "name": "Ancient Blessing", "type": "Buff", "category": "Permanent", "maxStacks": 1, "effects": [{ "stat": "Luck", "value": 5 }], "emoji": "🏺" },
    { "id": "buff_trader", "name": "Trader's Recommendation", "type": "Buff", "category": "Permanent", "maxStacks": 1, "effects": [{ "stat": "Sell Boost", "value": 20 }], "emoji": "🤝" },
    { "id": "buff_museum", "name": "Museum", "type": "Buff", "category": "Permanent", "maxStacks": 1, "effects": [], "emoji": "🏛️" },
    { "id": "buff_lighthouse", "name": "Lighthouse Blessing", "type": "Buff", "category": "Permanent", "maxStacks": 1, "effects": [{ "stat": "Luck", "value": 3 }], "emoji": "🏮" },
    { "id": "buff_basic_luck", "name": "Basic Luck Potion", "type": "Potion", "category": "Potion", "maxStacks": 1, "effects": [{ "stat": "Luck", "value": 5 }], "emoji": "🧪" },
    { "id": "buff_basic_cap", "name": "Basic Capacity Potion", "type": "Potion", "category": "Potion", "maxStacks": 1, "effects": [{ "stat": "Capacity", "value": 25 }], "emoji": "🎒" },
    { "id": "buff_greater_luck", "name": "Greater Luck Potion", "type": "Potion", "category": "Potion", "maxStacks": 1, "effects": [{ "stat": "Luck", "value": 10 }], "emoji": "🧪" },
    { "id": "buff_greater_cap", "name": "Greater Capacity Potion", "type": "Potion", "category": "Potion", "maxStacks": 1, "effects": [{ "stat": "Capacity", "value": 50 }], "emoji": "🎒" },
    { "id": "buff_volc_luck", "name": "Volcanic Luck Potion", "type": "Potion", "category": "Potion", "maxStacks": 1, "effects": [{ "stat": "Luck", "value": 20 }], "emoji": "🔥" },
    { "id": "buff_volc_str", "name": "Volcanic Strength Potion", "type": "Potion", "category": "Potion", "maxStacks": 1, "effects": [{ "stat": "Dig Strength", "value": 5 }], "emoji": "🌋" },
    { "id": "buff_supreme_luck", "name": "Supreme Luck Potion", "type": "Potion", "category": "Potion", "maxStacks": 1, "effects": [{ "stat": "Luck", "value": 50 }], "emoji": "🔥" },
    { "id": "buff_frozen_luck", "name": "Frozen Luck Potion", "type": "Potion", "category": "Potion", "maxStacks": 1, "effects": [{ "stat": "Luck", "value": 100 }], "emoji": "❄️" },
    { "id": "buff_frozen_speed", "name": "Frozen Speed Potion", "type": "Potion", "category": "Potion", "maxStacks": 1, "effects": [{ "stat": "Dig Speed", "value": 20 }, { "stat": "Shake Speed", "value": 20 }], "emoji": "💨" },
    { "id": "buff_cryonic_brew", "name": "Cryonic Brew", "type": "Potion", "category": "Potion", "maxStacks": 1, "effects": [{ "stat": "Luck", "value": 300 }, { "stat": "Capacity", "value": 200 }, { "stat": "WalkSpeed", "value": 3 }], "emoji": "🧊" },
    { "id": "buff_witches_brew", "name": "Witches Brew", "type": "Potion", "category": "Potion", "maxStacks": 1, "effects": [{ "stat": "Luck", "value": 500 }, { "stat": "Dig Strength", "value": 50 }], "emoji": "🧙" },
    { "id": "buff_ambrosia", "name": "Ambrosia", "type": "Potion", "category": "Potion", "maxStacks": 1, "effects": [{ "stat": "Luck", "value": 1111 }], "emoji": "🍷" },
    { "id": "buff_cosmic", "name": "Cosmic Potion", "type": "Potion", "category": "Potion", "maxStacks": 1, "effects": [{ "stat": "Luck", "value": 250 }, { "stat": "Dig Strength", "value": 75 }, { "stat": "Dig Speed", "value": 20 }, { "stat": "Modifier Boost", "value": 20 }], "emoji": "🌌" },
    { "id": "buff_stardust_shake", "name": "Stardust Shake", "type": "Potion", "category": "Potion", "maxStacks": 1, "effects": [{ "stat": "Luck", "value": 1500 }, { "stat": "Size Boost", "value": 30 }], "emoji": "✨" },
    { "id": "buff_merchant", "name": "Merchant’s Potion", "type": "Potion", "category": "Potion", "maxStacks": 1, "effects": [{ "stat": "Sell Boost", "value": 100 }], "emoji": "💎" },
    { "id": "buff_instability", "name": "Instability Potion", "type": "Potion", "category": "Potion", "maxStacks": 1, "effects": [{ "stat": "Modifier Boost", "value": 100 }], "emoji": "🌀" },
    { "id": "buff_quake", "name": "Quake Potion", "type": "Potion", "category": "Potion", "maxStacks": 1, "effects": [{ "stat": "Dig Strength", "value": 30 }, { "stat": "Shake Strength", "value": 5 }], "emoji": "🌍" },
    { "id": "buff_blitz", "name": "Blitz Potion", "type": "Potion", "category": "Potion", "maxStacks": 1, "effects": [{ "stat": "Dig Speed", "value": 60 }, { "stat": "Shake Speed", "value": 60 }], "emoji": "⚡" },
    { "id": "buff_mod_surge", "name": "Modifier Surge", "type": "Potion", "category": "Potion", "maxStacks": 1, "effects": [], "emoji": "⚡" },
    { "id": "buff_shifting", "name": "Shifting Tides", "type": "Potion", "category": "Potion", "maxStacks": 1, "effects": [], "emoji": "🌊" }
  ],
  "runes": [
    { "id": "rune-abyssal", "name": "Abyssal", "type": "Rune", "color": "#6A5ACD", "stats": ["Gain 20% more luck during the night. Darkness increases 50% slower."], "toolStats": [{ "name": "Luck", "value": 1.2, "unit": "x" }], "image": "https://static.wikitide.net/prospectingwiki/4/4b/Abyssal_Rune.png" },
    { "id": "rune-annihilation-1", "name": "Annihilation I", "type": "Rune", "color": "#FF4040", "stats": ["Automatically destroy Common and Uncommon ores when panning."], "image": "https://static.wikitide.net/prospectingwiki/8/86/Annihilation_I_rune.png" },
    { "id": "rune-annihilation-2", "name": "Annihilation II", "type": "Rune", "color": "#FF4040", "stats": ["Automatically destroy Rare and Epic ores when panning."], "image": "https://static.wikitide.net/prospectingwiki/9/90/Annihilation_II_rune.png" },
    { "id": "rune-annihilation-3", "name": "Annihilation III", "type": "Rune", "color": "#FF4040", "stats": ["Automatically destroy Legendary ores when panning."], "image": "https://static.wikitide.net/prospectingwiki/d/dd/Rune_Annihilation_III.png" },
    { "id": "rune-critical-1", "name": "Critical I", "type": "Rune", "color": "#FFFF00", "stats": ["Digging has a 20% chance to have 2x strength."], "image": "https://static.wikitide.net/prospectingwiki/2/25/Rune_Critical_I.png" },
    { "id": "rune-critical-2", "name": "Critical II", "type": "Rune", "color": "#FFFF00", "stats": ["Digging has a 20% chance to have 2x strength."], "image": "https://static.wikitide.net/prospectingwiki/4/40/Rune_Critical_II.png" },
    { "id": "rune-discovery", "name": "Discovery", "type": "Rune", "color": "#FFFF00", "stats": ["Chance of obtaining undiscovered ores is increased by 50%."], "image": "https://static.wikitide.net/prospectingwiki/f/f6/Rune_Discovery.png" },
    { "id": "rune-eternity", "name": "Eternity", "type": "Rune", "color": "#7CFF7C", "stats": ["Your totem timers decrease 20% slower."], "image": "https://static.wikitide.net/prospectingwiki/3/30/Rune_Eternity.png" },
    { "id": "rune-equalizer", "name": "Equalizer", "type": "Rune", "color": "#FFC0CB", "stats": ["Your dig speed and shake speed are equalized to their average."], "image": "https://static.wikitide.net/prospectingwiki/4/4c/Rune_Equalizer.png" },
    { "id": "rune-explorer", "name": "Explorer", "type": "Rune", "color": "#F5DEB3", "stats": ["When collecting geodes, gain a 20% chance to collect another geode."], "image": "https://static.wikitide.net/prospectingwiki/7/7b/Rune_Explorer.png" },
    { "id": "rune-mountain-climber", "name": "Mountain Climber", "type": "Rune", "color": "#ADD8E6", "stats": ["Gain 3 walkspeed."], "toolStats": [{ "name": "Walk Speed", "value": 3 }], "image": "https://static.wikitide.net/prospectingwiki/c/c2/Rune_Mountain_Climber.png" },
    { "id": "rune-purity", "name": "Purity", "type": "Rune", "color": "#ADD8E6", "stats": ["+1x Luck multiplier, BUT MODIFIERS CAN NO LONGER BE OBTAINED."], "toolStats": [{ "name": "Luck", "value": 2, "unit": "x" }], "image": "https://static.wikitide.net/prospectingwiki/a/af/Rune_Purity.png" },
    { "id": "rune-solitude", "name": "Solitude", "type": "Rune", "color": "#D8BFD8", "stats": ["+20% Luck, but lose 10% Luck for every other player within 50 studs."], "toolStats": [{ "name": "Luck", "value": 1.2, "unit": "x" }], "image": "https://static.wikitide.net/prospectingwiki/b/b3/Rune_Solitude.png" },
    { "id": "rune-speed-1", "name": "Speed I", "type": "Rune", "color": "#FFFFFF", "stats": ["Gain 2 walkspeed."], "toolStats": [{ "name": "Walk Speed", "value": 2 }], "image": "https://static.wikitide.net/prospectingwiki/0/05/Rune_Speed_I.png" },
    { "id": "rune-summit-seeker", "name": "Summit Seeker", "type": "Rune", "color": "#ADD8E6", "stats": ["Gain 5% dig and shake speed for every +1 bonus walkspeed."], "image": "https://static.wikitide.net/prospectingwiki/7/7f/Rune_Summit_Seeker.png" },
    { "id": "rune-sunblessed", "name": "Sunblessed", "type": "Rune", "color": "#FFFF00", "stats": ["Gain 20% more luck in the sunlight."], "toolStats": [{ "name": "Luck", "value": 1.2, "unit": "x" }], "image": "https://static.wikitide.net/prospectingwiki/7/76/Rune_Sunblessed.png" },
    { "id": "rune-volcanic", "name": "Volcanic", "type": "Rune", "color": "#FF4500", "stats": ["Ores with the scorched modifier gain 25% size."], "image": "https://static.wikitide.net/prospectingwiki/9/91/Rune_Volcanic.png" }
  ],
  "enchants": [
    { "id": "enchant-fortune", "name": "Fortune", "type": "Enchant", "appliesTo": "Pan", "stats": ["+20% Luck"], "toolStats": [{ "name": "Luck", "value": 1.2, "unit": "x" }] },
    { "id": "enchant-haste", "name": "Haste", "type": "Enchant", "appliesTo": "Pan", "stats": ["+20% Dig Speed"], "toolStats": [{ "name": "Dig Speed", "value": 1.2, "unit": "x" }] },
    { "id": "enchant-efficiency", "name": "Efficiency", "type": "Enchant", "appliesTo": "Pan", "stats": ["+50% Capacity"], "toolStats": [{ "name": "Capacity", "value": 1.5, "unit": "x" }] },
    { "id": "enchant-voidtouched", "name": "Voidtouched", "type": "Enchant", "appliesTo": "Shovel", "stats": ["+50 Dig Strength"], "toolStats": [{ "name": "Dig Strength", "value": 50 }] },
    { "id": "enchant-swiftness", "name": "Swiftness", "type": "Enchant", "appliesTo": "Shovel", "stats": ["+2 Walk Speed"], "toolStats": [{ "name": "Walk Speed", "value": 2 }] }
  ],
  "trinkets": [
    { "id": "beach-umbrella", "name": "Beach Umbrella", "type": "Trinket", "appliesTo": "Pan", "stats": ["Capacity to flat Luck conversion (Warning: Conflicts with Purity Rune)"] },
    { "id": "lucky-charm", "name": "Lucky Charm", "type": "Trinket", "appliesTo": "Shovel", "stats": ["+100 Flat Luck"], "toolStats": [{ "name": "Luck", "value": 100 }] }
  ],
  "necklaces": [
    {
      "id": "amethyst-pendant",
      "name": "Amethyst Pendant",
      "type": "Necklace",
      "rarity": "Common",
      "stats": [
        "Luck: 1-2.5 (★6: 0.5–2.2)",
        "Sell Boost: 0–15% (★6: 0–18%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "amulet-of-life",
      "name": "Amulet of Life",
      "type": "Necklace",
      "rarity": "Mythic",
      "stats": [
        "Luck: 200–400 (★6: 100–425)",
        "Modifier Boost: 50–150% (★6: 50–160%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "amulet-of-spirits",
      "name": "Amulet of Spirits",
      "type": "Necklace",
      "rarity": "Mythic",
      "stats": [
        "Luck: 50-140 (★6: 50-150)",
        "Dig Speed: 20-40% (★6: 20-42%)",
        "Shake Speed: 20-40% (★6: 20-42%)",
        "Size Boost: 10-30% (★6: 10-32%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "celestial-rings",
      "name": "Celestial Rings",
      "type": "Necklace",
      "rarity": "Mythic",
      "stats": [
        "Luck: 30–90 (★6: 30–100)",
        "Capacity: 50–250 (★6: 50–275)",
        "Size Boost: 0–45% (★6: 0–50%)",
        "Modifier Boost: 20–140% (★6: 20–150%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "frostthorn-pendant",
      "name": "Frostthorn Pendant",
      "type": "Necklace",
      "rarity": "Exotic",
      "stats": [
        "Luck: 100–400 (★6: 100–450)",
        "Dig Strength: 100–200 (★6: 100–215)",
        "Capacity: 50–200 (★6: 50–225)",
        "Dig Speed: −50 – −30% (★6: −50 – −28%)",
        "Size Boost: 30–100% (★6: 30–110%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "mass-accumulator",
      "name": "Mass Accumulator",
      "type": "Necklace",
      "rarity": "Legendary",
      "stats": [
        "Capacity: 20–60 (★6: 20–65)",
        "Inventory Size: 150-400 (★6: 150-450)",
        "Size Boost: 10–80% (★6: 10–90%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "meteor-core",
      "name": "Meteor Core",
      "type": "Necklace",
      "rarity": "Exotic",
      "stats": [
        "Luck: 200-800 (★6: 200-900)",
        "Capacity: 200-600 (★6: 200-650)",
        "Inventory Size: 100-400 (★6: 100-450)",
        "Size Boost: 20-100% (★6: 20-115%)",
        "Status Timer Speed: -30 - -30% (★6: -30 - -30%)",
        "Modifier Boost: 10-40% (★6: 10-45%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "opal-amulet",
      "name": "Opal Amulet",
      "type": "Necklace",
      "rarity": "Epic",
      "stats": [
        "Luck: 5–16 (★6: 5–18)",
        "Inventory Size: 10-80 (★6: 10-90)",
        "Modifier Boost: 0–90% (★6: 0–100%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "pearl-necklace",
      "name": "Pearl Necklace",
      "type": "Necklace",
      "rarity": "Uncommon",
      "stats": [
        "Luck: 2-5 (★6: 2–5.5)",
        "Dig Strength: 0–4 (★6: 0–4.5)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "phoenix-heart",
      "name": "Phoenix Heart",
      "type": "Necklace",
      "rarity": "Mythic",
      "stats": [
        "Luck: 100–300 (★6: 100–325)",
        "Inventory Size: 100-400 (★6: 100-450)",
        "Size Boost: −70 – −40% (★6: −70 – −35%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "santas-bag",
      "name": "Santa's Bag",
      "type": "Necklace",
      "rarity": "Exotic",
      "stats": [
        "Luck: 200-600 (★6: 675)",
        "Capacity: 200-500 (★6: 550)",
        "Inventory Size: 100-500 (★6: 550)",
        "Size Boost: 20-80% (★6: 90%)",
        "Status Timer Speed: -50 - -50% (★6: -50%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "spider-bowtie",
      "name": "Spider Bowtie",
      "type": "Necklace",
      "rarity": "Legendary",
      "stats": [
        "Luck: 10-80 (★6: 10-85)",
        "Capacity: 40-100 (★6: 40-110)",
        "Sell Boost: 20-50% (★6: 20-55%)",
        "Modifier Boost: 20-50% (★6: 20-55%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "topaz-necklace",
      "name": "Topaz Necklace",
      "type": "Necklace",
      "rarity": "Uncommon",
      "stats": [
        "Luck: 1–5 (★6: 1–5.5)",
        "Dig Strength: 1–4 (★6: 1–4.5)",
        "Shake Strength: 0.2–1 (★6: 0.2–1.1)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "waverider",
      "name": "Waverider",
      "type": "Necklace",
      "rarity": "Mythic",
      "stats": [
        "Luck: 50-180 (★6: 50-200)",
        "Dig Speed: 20-60% (★6: 20-65%)",
        "Shake Speed: 20-60% (★6: 20-65%)",
        "Modifier Boost: 30-140% (★6: 30-150%)",
        "Size Boost: 20-110% (★6: 20-120%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "venomshank",
      "name": "Venomshank",
      "type": "Necklace",
      "rarity": "Exotic",
      "stats": [
        "Luck: 600-1200 (★6: 600-1300)",
        "Dig Strength: -100 – -50 (★6: -100 – -45)",
        "Dig Speed: -60 – -40% (★6: -60 – -38%)",
        "Inventory Size: 100-300 (★6: 100-325)",
        "Size Boost: 20-50% (★6: 20-55%)",
        "Sell Boost: 20-50% (★6: 20-55%)"
      ],
      "image": [
        0
      ]
    }
  ],
  "charms": [
    {
      "id": "antlers-of-life",
      "name": "Antlers of Life",
      "type": "Charm",
      "rarity": "Exotic",
      "stats": [
        "Dig Speed: 10–40% (★6: 10–44%)",
        "Luck: 100–580 (★6: 100–640)",
        "Size Boost: 20–60% (★6: 20–65%)",
        "Modifier Boost: 50–200% (★6: 50–220%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "bunny-ears",
      "name": "Bunny Ears",
      "type": "Charm",
      "rarity": "Mythic",
      "stats": [
        "Luck: 50-180 (★6: 50-220)",
        "Inventory Size: 50-180 (★6: 50-220)",
        "Modifier Boost: 20%-50% (★6: 20%-60%)",
        "Walkspeed: 2-6 (★6: 2-7)",
        "Jump Power: 2-10 (★6: 2-12)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "candy-sack",
      "name": "Candy Sack",
      "type": "Charm",
      "rarity": "Mythic",
      "stats": [
        "Luck: 30–100 (★6: 30–110)",
        "Capacity: 100-300 (★6: 100-325)",
        "Inventory Size: 300-1,000 (★6: 300-1,100)",
        "Size Boost: 30-70% (★6: 30-75%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "crown",
      "name": "Crown",
      "type": "Charm",
      "rarity": "Legendary",
      "stats": [
        "Luck: 5–30 (★6: 5–35)",
        "Size Boost: 0–45% (★6: 0–50%)",
        "Sell Boost: 0–90% (★6: 0–100%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "cryogenic-preserver",
      "name": "Cryogenic Preserver",
      "type": "Charm",
      "rarity": "Mythic",
      "stats": [
        "Luck: 100–250 (★6: 100–275)",
        "Shake Strength: 10–40 (★6: 10–45)",
        "Shake Speed: −40 – −20% (★6: −40 – −18%)",
        "Sell Boost: 0–50% (★6: 0–55%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "dragon-claw",
      "name": "Dragon Claw",
      "type": "Charm",
      "rarity": "Legendary",
      "stats": [
        "Dig Strength: 10–30 (★6: 10–32)",
        "Shake Strength: 1–8 (★6: 1–9)",
        "Inventory Size: 100-400 (★6: 100-450)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "excalibur",
      "name": "Excalibur",
      "type": "Charm",
      "rarity": "Exotic",
      "stats": [
        "Luck: 100–500 (★6: 100–550)",
        "Dig Strength: 75–300 (★6: 75–325)",
        "Treasure Map Chance: 50–160% (★6: 50–175%)",
        "Modifier Boost: 50–150% (★6: 50–160%)",
        "WalkSpeed: 1–5 (★6: 1–5.5)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "fossilized-crown",
      "name": "Fossilized Crown",
      "type": "Charm",
      "rarity": "Exotic",
      "stats": [
        "Luck: 100–250 (★6: 100–260)",
        "Capacity: 50–200 (★6: 50–225)",
        "Shake Speed: 10–30% (★6: 10–32%)",
        "Size Boost: 0–50% (★6: 0–55%)",
        "Sell Boost: 0–100% (★6: 0–110%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "garden-glove",
      "name": "Garden Glove",
      "type": "Charm",
      "rarity": "Common",
      "stats": [
        "Dig Strength: 0.2–1 (★6: 0.2–1.1)",
        "Capacity: 0–5 (★6: 0–5.5)",
        "Inventory Size: 10-50 (★6: 10-55)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "gravity-coil",
      "name": "Gravity Coil",
      "type": "Charm",
      "rarity": "Epic",
      "stats": [
        "Capacity: 10–140 (★6: 10–160)",
        "Inventory Size: 10-250 (★6: 10-275)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "guiding-light",
      "name": "Guiding Light",
      "type": "Charm",
      "rarity": "Legendary",
      "stats": [
        "Luck: 5–20 (★6: 5–22)",
        "Capacity: 10–40 (★6: 10–45)",
        "Inventory Size: 50-200 (★6: 50-225)",
        "Modifier Boost: 0–45% (★6: 0–50%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "jade-armband",
      "name": "Jade Armband",
      "type": "Charm",
      "rarity": "Uncommon",
      "stats": [
        "Luck: 2–9 (★6: 2-10)",
        "Capacity: 1–10 (★6: 1–11)",
        "Inventory Size: 10-70 (★6: 10-80)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "lapis-armband",
      "name": "Lapis Armband",
      "type": "Charm",
      "rarity": "Rare",
      "stats": [
        "Luck: 3–10 (★6: 3–11)",
        "Dig Speed: 0–40% (★6: 0–45%)",
        "Shake Speed: 0–40% (★6: 0–45%)",
        "Inventory Size: 10-70 (★6: 10-80)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "helm-of-the-round",
      "name": "Helm of the Round",
      "type": "Charm",
      "rarity": "Mythic",
      "stats": [
        "Luck: 15–90 (★6: 15–100)",
        "Capacity: 15–90 (★6: 15–100)",
        "Size Boost: 50–150% (★6: 50–160%)",
        "WalkSpeed: -4 – -0.75"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "lava-lantern",
      "name": "Lava Lantern",
      "type": "Charm",
      "rarity": "Epic",
      "stats": [
        "Luck: 5–22 (★6: 5-25)",
        "Capacity: 10-40 (★6: 10-45)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "phoenix-wings",
      "name": "Phoenix Wings",
      "type": "Charm",
      "rarity": "Mythic",
      "stats": [
        "Luck: 100–300 (★6: 100–325)",
        "Capacity: −80 – −40 (★6: −80 – −35)",
        "Inventory Size: 100-400 (★6: 100-450)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "pumpkin-lord",
      "name": "Pumpkin Lord",
      "type": "Charm",
      "rarity": "Exotic",
      "stats": [
        "Dig Strength: 80-200 (★6: 80-220)",
        "Shake Strength: 20-50 (★6: 20-54)",
        "Inventory Size: 200-500 (★6: 200-550)",
        "Size Boost: 30-180% (★6: 50-220%)",
        "WalkSpeed: 1-4 (★6: 1-4.5)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "royal-federation-crown",
      "name": "Royal Federation Crown",
      "type": "Charm",
      "rarity": "Mythic",
      "stats": [
        "Luck: 10–90 (★6: 10–100)",
        "Size Boost: 0–90% (★6: 0–100%)",
        "Sell Boost: 0–180% (★6: 0–200%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "santa-hat",
      "name": "Santa Hat",
      "type": "Charm",
      "rarity": "Mythic",
      "stats": [
        "Luck: 5-140 (★6: 150)",
        "Capacity: 50-200 (★6: 225)",
        "Shake Strength: 2-8 (★6: 9)",
        "WalkSpeed: 0.5-2 (★6: 2.2)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "speed-coil",
      "name": "Speed Coil",
      "type": "Charm",
      "rarity": "Rare",
      "stats": [
        "Dig Speed: 0–70% (★6: 0–80%)",
        "Shake Speed: 0–70% (★6: 0–80%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "starlight-wings",
      "name": "Starlight Wings",
      "type": "Charm",
      "rarity": "Exotic",
      "stats": [
        "Luck: 300-900 (★6: 300-1000)",
        "Dig Strength: 200-500 (★6: 200-550)",
        "Shake Strength: 60-180 (★6: 60-200)",
        "Size Boost: 10-40% (★6: 10-45%)",
        "WalkSpeed: 1-2 (★6: 1-2)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "timelocked-soul",
      "name": "Timelocked Soul",
      "type": "Charm",
      "rarity": "Exotic",
      "stats": [
        "Luck: 222-888 (★6: 222-999)",
        "Dig Speed: 30-100% (★6: 30-110%)",
        "Inventory Size: 100-450 (★6: 100-500)",
        "Shake Speed: 30-100% (★6: 30-110%)",
        "Size Boost: 10-50% (★6: 10-55%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "witch-hat",
      "name": "Witch Hat",
      "type": "Charm",
      "rarity": "Exotic",
      "stats": [
        "Luck: 400-1,000 (★6: 400-1,100)",
        "Inventory Size: 100–400 (★6: 100-450)",
        "Modifier Boost: 40-100% (★6: 40-110%)",
        "Walkspeed: 1-5 (★6: 1-5.5)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "clockwork",
      "name": "Clockwork",
      "type": "Charm",
      "rarity": "Exotic",
      "stats": [
        "Luck: 50 - 200 (★6: 50 - 225)",
        "Capacity: 100 - 250 (★6: 100 - 275)",
        "Inventory Size: 100 - 300 (★6: 100 - 325)",
        "Shake Speed: 40 - 90% (★6: 40 - 100%)",
        "Size Boost: 30 - 190% (★6: 30 - 210%)",
        "Sell Boost: 0 - 100% (★6: 0 - 110%)"
      ],
      "image": [
        0
      ]
    }
  ],
  "rings": [
    {
      "id": "5-gold-rings",
      "name": "5 Gold Rings",
      "type": "Ring",
      "rarity": "Legendary",
      "stats": [
        "Luck: 5-20 (★6: 22)",
        "Capacity: 5-20 (★6: 45)",
        "Shake Speed: 0-20% (★6: 22%)",
        "Sell Boost: 0-20% (★6: 22%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "accretion-disk",
      "name": "Accretion Disk",
      "type": "Ring",
      "rarity": "Exotic",
      "stats": [
        "Luck: 125-360 (★6: 125-400)",
        "Dig Speed: 20-46% (★6: 20-50%)",
        "Shake Speed: 20-46% (★6: 20-50%)",
        "Inventory Size: 25-90 (★6: 25-100)",
        "Modifier Boost: 5-15% (★6: 5-16%)",
        "Size Boost: 5-15% (★6: 5-16%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "apocalypse-bringer",
      "name": "Apocalypse Bringer",
      "type": "Ring",
      "rarity": "Mythic",
      "stats": [
        "Dig Strength: 5–20 (★6: 5–22)",
        "Luck: 10–40 (★6: 10–45)",
        "Shake Strength: 2–5 (★6: 2–5.5)",
        "Sell Boost: 10–40% (★6: 10–45%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "dredge-masters-ring",
      "name": "Dredge Master's Ring",
      "type": "Ring",
      "rarity": "Exotic",
      "stats": [
        "Dig Strength: 20-120 (★6: 20-135)",
        "Capacity: 100-500 (★6: 100-550)",
        "Shake Strength: 10-28 (★6: 10-30)",
        "Size Boost: 10-50% (★6: 10-55%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "eye-of-fire",
      "name": "Eye of Fire",
      "type": "Ring",
      "rarity": "Legendary",
      "stats": [
        "Luck: 4-24 (★6: 4-28)",
        "Dig Speed: 0-20% (★6: 0-22%)",
        "Size Boost: 10–20% (★6: 10–22%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "gold-ring",
      "name": "Gold Ring",
      "type": "Ring",
      "rarity": "Common",
      "stats": [
        "Luck: 0.3–0.8 (★6: 0.3–0.9)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "heart-of-the-ocean",
      "name": "Heart of the Ocean",
      "type": "Ring",
      "rarity": "Epic",
      "stats": [
        "Luck: 3–10 (★6: 3–11)",
        "Shake Speed: 0–20% (★6: 0–22%)",
        "Sell Boost: 10–20% (★6: 10–22%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "lightkeepers-ring",
      "name": "Lightkeeper's Ring",
      "type": "Ring",
      "rarity": "Legendary",
      "stats": [
        "Dig Speed: 5–25% (★6: 5–27%)",
        "Inventory Size: 30-100 (★6: 30-110)",
        "Sell Boost: 5–25% (★6: 5–27%)",
        "Modifier Boost: 5–25% (★6: 5–27%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "meteor-ring",
      "name": "Meteor Ring",
      "type": "Ring",
      "rarity": "Rare",
      "stats": [
        "Dig Strength: 0.5–3 (★6: 0.5–3.2)",
        "Shake Strength: 0–1 (★6: 0–1.1)",
        "Inventory Size: 10-50 (★6: 10-55)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "moon-ring",
      "name": "Moon Ring",
      "type": "Ring",
      "rarity": "Epic",
      "stats": [
        "Luck: 1–7 (★6: 1–8)",
        "Dig Speed: 10–40% (★6: 10–45%)",
        "Shake Speed: 10–40% (★6: 10–45%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "mythril-ring",
      "name": "Mythril Ring",
      "type": "Ring",
      "rarity": "Mythic",
      "stats": [
        "Luck: 20–80 (★6: 20–90)",
        "Dig Speed: 20–40% (★6: 20–42%)",
        "Shake Speed: 20–40% (★6: 20–42%)",
        "Sell Boost: 5–24% (★6: 5–26%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "otherworldly-ring",
      "name": "Otherworldly Ring",
      "type": "Ring",
      "rarity": "Exotic",
      "stats": [
        "Luck: 150-350 (★6: 150-375)",
        "Dig Speed: 0-20% (★6: 0-22%)",
        "Shake Speed: 0-20% (★6: 0-22%)",
        "Size Boost: 10-25% (★6: 10-26%)",
        "Sell Boost: 10-30% (★6: 10-32%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "prismatic-star",
      "name": "Prismatic Star",
      "type": "Ring",
      "rarity": "Mythic",
      "stats": [
        "Luck: 5–20 (★6: 5–22)",
        "Dig Strength: 2–10 (★6: 2–11)",
        "Capacity: 10–40 (★6: 10–45)",
        "Dig Speed: 5–20% (★6: 5–22%)",
        "Shake Strength: 1–3 (★6: 1–3.2)",
        "Inventory Size: 15-50 (★6: 15-55)",
        "Shake Speed: 5–20% (★6: 5–22%)",
        "Sell Boost: 10–20% (★6: 10–22%)",
        "Size Boost: 5–20% (★6: 5–22%)",
        "Modifier Boost: 5–20% (★6: 5–22%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "purifying-ring",
      "name": "Purifying Ring",
      "type": "Ring",
      "rarity": "Mythic",
      "stats": [
        "Luck: 20–80 (★6: 20–90)",
        "Dig Strength: 10–80 (★6: 10-90)",
        "Capacity: 20-100 (★6: 20-110)",
        "Shake Strength: 5–27 (★6: 5-30)",
        "Inventory Size: 20–80 (★6: 20-90)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "ring-of-champions",
      "name": "Ring of Champions",
      "type": "Ring",
      "rarity": "Ascended",
      "stats": [
        "Luck: 100-500 (★6: 100-550)",
        "Dig Strength: 20-160 (★6: 20-180)",
        "Capacity: 100-400 (★6: 100-450)",
        "Dig Speed: 20-90% (★6: 20-100%)",
        "Shake Strength: 10-50 (★6: 10-55)",
        "Shake Speed: 20-90% (★6: 20-100%)",
        "Sell Boost: 50-150% (★6: 50-160%)",
        "Size Boost: 50-150% (★6: 50-160%)",
        "Modifier Boost: 50-150% (★6: 50-160%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "ring-of-harvest",
      "name": "Ring of Harvest",
      "type": "Ring",
      "rarity": "Legendary",
      "stats": [
        "Luck: 5-18 (★6: 5-20)",
        "Capacity: 10-30 (★6: 10-32)",
        "Inventory Size: 10-40 (★6: 10-45)",
        "WalkSpeed: 0.5-1"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "ring-of-the-stars",
      "name": "Ring of the Stars",
      "type": "Ring",
      "rarity": "Ascended",
      "stats": [
        "Luck: 200 - 600 (★6: 200 - 650)",
        "Dig Speed: 10 - 28% (★6: 10 - 30%)",
        "Shake Speed: 10 - 28% (★6: 10 - 30%)",
        "Modifier Boost: 20 - 100% (★6: 20 - 110%)",
        "Size Boost: 10 - 50% (★6: 10 - 55%)",
        "WalkSpeed: 1 - 3.8 (★6: 1 - 4)",
        "Jump Power: 1 - 5 (★6: 1 - 5.5)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "ring-of-thorns",
      "name": "Ring of Thorns",
      "type": "Ring",
      "rarity": "Mythic",
      "stats": [
        "Luck: 20–100 (★6: 20–110)",
        "Dig Strength: 5–40 (★6: 5–45)",
        "Inventory Size: 40-150 (★6: 40-170)",
        "Size Boost: 10–30% (★6: 10–32%)",
        "Modifier Boost: 20–60% (★6: 20–65%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "ruby-ring",
      "name": "Ruby Ring",
      "type": "Ring",
      "rarity": "Rare",
      "stats": [
        "Luck: 2–6 (★6: 2–6.4)",
        "Size Boost: 0–18% (★6: 0–20%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "smoke-ring",
      "name": "Smoke Ring",
      "type": "Ring",
      "rarity": "Uncommon",
      "stats": [
        "Inventory Size: 10-40 (★6: 10-45)",
        "Modifier Boost: 5–15% (★6: 5–16%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "solar-ring",
      "name": "Solar Ring",
      "type": "Ring",
      "rarity": "Mythic",
      "stats": [
        "Luck: 20–100 (★6: 20–110)",
        "Dig Strength: 2–8 (★6: 2–9)",
        "Dig Speed: −30 – −10% (★6: −30 – −8%)",
        "Shake Strength: 0–2 (★6: 0–2.2)",
        "Shake Speed: −30 – −10% (★6: −30 – −8%)",
        "Modifier Boost: 5–20% (★6: 5–22%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "titanium-ring",
      "name": "Titanium Ring",
      "type": "Ring",
      "rarity": "Common",
      "stats": [
        "Capacity: 1–13 (★6: 1–15)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "umbrite-ring",
      "name": "Umbrite Ring",
      "type": "Ring",
      "rarity": "Exotic",
      "stats": [
        "Luck: 50-220 (★6: 50-245)",
        "Dig Strength: 5-45 (★6: 5-50)",
        "Capacity: 20-200 (★6: 20-220)",
        "Shake Strength: 5-20 (★6: 5-22)",
        "Size Boost: 5-15% (★6: 5-16%)"
      ],
      "image": [
        0
      ]
    },
    {
      "id": "vortex-ring",
      "name": "Vortex Ring",
      "type": "Ring",
      "rarity": "Exotic",
      "stats": [
        "Dig Strength: 20-80 (★6: 20-90)",
        "Luck: 50-140 (★6: 50-155)",
        "Capacity: 100-300 (★6: 100-325)",
        "Shake Strength: 3-10 (★6: 3-11)"
      ],
      "image": [
        0
      ]
    }
  ],
  "pans": [
    {
      "id": "aurora-pan",
      "name": "Aurora Pan",
      "type": "Pan",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Luck",
          "value": 50,
          "unit": ""
        },
        {
          "name": "Capacity",
          "value": 130,
          "unit": ""
        },
        {
          "name": "Shake Strength",
          "value": 3,
          "unit": ""
        },
        {
          "name": "Shake Speed",
          "value": 1.25,
          "unit": "x"
        }
      ],
      "passive": "+25% Modifier Boost"
    },
    {
      "id": "abyssal-pan",
      "name": "Abyssal Pan",
      "type": "Pan",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Luck",
          "value": 700,
          "unit": ""
        },
        {
          "name": "Capacity",
          "value": 250,
          "unit": ""
        },
        {
          "name": "Shake Strength",
          "value": 8,
          "unit": ""
        },
        {
          "name": "Shake Speed",
          "value": 1.1,
          "unit": "x"
        }
      ],
      "passive": "+20% Size Boost"
    },
    {
      "id": "blightflow-pan",
      "name": "Blightflow Pan",
      "type": "Pan",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Luck",
          "value": 500,
          "unit": ""
        },
        {
          "name": "Capacity",
          "value": 400,
          "unit": ""
        },
        {
          "name": "Shake Strength",
          "value": 30,
          "unit": ""
        },
        {
          "name": "Shake Speed",
          "value": 2,
          "unit": "x"
        }
      ],
      "passive": "+25% Size Boost"
    },
    {
      "id": "diamond-pan",
      "name": "Diamond Pan",
      "type": "Pan",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Luck",
          "value": 35,
          "unit": ""
        },
        {
          "name": "Capacity",
          "value": 100,
          "unit": ""
        },
        {
          "name": "Shake Strength",
          "value": 3,
          "unit": ""
        },
        {
          "name": "Shake Speed",
          "value": 1,
          "unit": "x"
        }
      ],
      "passive": "+10% Modifier Boost, +10% Size Boost"
    },
    {
      "id": "fossilized-pan",
      "name": "Fossilized Pan",
      "type": "Pan",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Luck",
          "value": 200,
          "unit": ""
        },
        {
          "name": "Capacity",
          "value": 225,
          "unit": ""
        },
        {
          "name": "Shake Strength",
          "value": 8,
          "unit": ""
        },
        {
          "name": "Shake Speed",
          "value": 1,
          "unit": "x"
        }
      ],
      "passive": "+50% Modifier Boost"
    },
    {
      "id": "dragonflame-pan",
      "name": "Dragonflame Pan",
      "type": "Pan",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Luck",
          "value": 150,
          "unit": ""
        },
        {
          "name": "Capacity",
          "value": 180,
          "unit": ""
        },
        {
          "name": "Shake Strength",
          "value": 10,
          "unit": ""
        },
        {
          "name": "Shake Speed",
          "value": 1.1,
          "unit": "x"
        }
      ],
      "passive": "-10% Size Boost"
    },
    {
      "id": "galactic-pan",
      "name": "Galactic Pan",
      "type": "Pan",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Luck",
          "value": 100,
          "unit": ""
        },
        {
          "name": "Capacity",
          "value": 500,
          "unit": ""
        },
        {
          "name": "Shake Strength",
          "value": 25,
          "unit": ""
        },
        {
          "name": "Shake Speed",
          "value": 1,
          "unit": "x"
        }
      ],
      "passive": "+25% Size Boost, and has a chance to give Voidtorn items"
    },
    {
      "id": "gingerbread-pan",
      "name": "Gingerbread Pan",
      "type": "Pan",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Luck",
          "value": 400,
          "unit": ""
        },
        {
          "name": "Capacity",
          "value": 400,
          "unit": ""
        },
        {
          "name": "Shake Strength",
          "value": 25,
          "unit": ""
        },
        {
          "name": "Shake Speed",
          "value": 1.2,
          "unit": "x"
        }
      ],
      "passive": "Chance to give XP cookie effects"
    },
    {
      "id": "frostbite-pan",
      "name": "Frostbite Pan",
      "type": "Pan",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Luck",
          "value": 300,
          "unit": ""
        },
        {
          "name": "Capacity",
          "value": 250,
          "unit": ""
        },
        {
          "name": "Shake Strength",
          "value": 15,
          "unit": ""
        },
        {
          "name": "Shake Speed",
          "value": 0.8,
          "unit": "x"
        }
      ],
      "passive": "+25% Size Boost"
    },
    {
      "id": "golden-pan",
      "name": "Golden Pan",
      "type": "Pan",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Luck",
          "value": 10,
          "unit": ""
        },
        {
          "name": "Capacity",
          "value": 35,
          "unit": ""
        },
        {
          "name": "Shake Strength",
          "value": 1,
          "unit": ""
        },
        {
          "name": "Shake Speed",
          "value": 0.8,
          "unit": "x"
        }
      ],
      "passive": [
        0
      ]
    },
    {
      "id": "lifetouched-pan",
      "name": "Lifetouched Pan",
      "type": "Pan",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Luck",
          "value": 400,
          "unit": ""
        },
        {
          "name": "Capacity",
          "value": 300,
          "unit": ""
        },
        {
          "name": "Shake Strength",
          "value": 8,
          "unit": ""
        },
        {
          "name": "Shake Speed",
          "value": 1.1,
          "unit": "x"
        }
      ],
      "passive": "+50% Modifier Boost"
    },
    {
      "id": "metal-pan",
      "name": "Metal Pan",
      "type": "Pan",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Luck",
          "value": 2,
          "unit": ""
        },
        {
          "name": "Capacity",
          "value": 20,
          "unit": ""
        },
        {
          "name": "Shake Strength",
          "value": 0.8,
          "unit": ""
        },
        {
          "name": "Shake Speed",
          "value": 0.8,
          "unit": "x"
        }
      ],
      "passive": [
        0
      ]
    },
    {
      "id": "meteoric-pan",
      "name": "Meteoric Pan",
      "type": "Pan",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Luck",
          "value": 22,
          "unit": ""
        },
        {
          "name": "Capacity",
          "value": 70,
          "unit": ""
        },
        {
          "name": "Shake Strength",
          "value": 2,
          "unit": ""
        },
        {
          "name": "Shake Speed",
          "value": 1,
          "unit": "x"
        }
      ],
      "passive": "+25% Modifier Boost"
    },
    {
      "id": "nebula-pan",
      "name": "Nebula Pan",
      "type": "Pan",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Luck",
          "value": 800,
          "unit": ""
        },
        {
          "name": "Capacity",
          "value": 500,
          "unit": ""
        },
        {
          "name": "Shake Strength",
          "value": 80,
          "unit": ""
        },
        {
          "name": "Shake Speed",
          "value": 1.25,
          "unit": "x"
        },
        {
          "name": "Modifier Boost",
          "value": 25,
          "unit": "%"
        },
        {
          "name": "Size Boost",
          "value": 33,
          "unit": "%"
        },
        {
          "name": "Luck",
          "value": 1.1,
          "unit": "x"
        }
      ],
      "passive": "+25% Modifier Boost, +33% Size Boost, +25% Luck from Luck Totems, +25% Strength from Strength Totems, and +20% Capacity, Dig Speed, and Shake Speed from Luminant Totems, +1.1x additional Luck",
      "totemBoosts": [
        { "totem": "totem_luck", "boost": 0.25 },
        { "totem": "totem_strength", "boost": 0.25 },
        { "totem": "totem_luminant", "boost": 0.2 }
      ]
    },
    {
      "id": "plastic-pan",
      "name": "Plastic Pan",
      "type": "Pan",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Luck",
          "value": 1.25,
          "unit": ""
        },
        {
          "name": "Capacity",
          "value": 10,
          "unit": ""
        },
        {
          "name": "Shake Strength",
          "value": 0.6,
          "unit": ""
        },
        {
          "name": "Shake Speed",
          "value": 1,
          "unit": "x"
        }
      ],
      "passive": [
        0
      ]
    },
    {
      "id": "magnetic-pan",
      "name": "Magnetic Pan",
      "type": "Pan",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Luck",
          "value": 15,
          "unit": ""
        },
        {
          "name": "Capacity",
          "value": 50,
          "unit": ""
        },
        {
          "name": "Shake Strength",
          "value": 1,
          "unit": ""
        },
        {
          "name": "Shake Speed",
          "value": 0.75,
          "unit": "x"
        }
      ],
      "passive": "+25% Size Boost"
    },
    {
      "id": "pumpkin-pan",
      "name": "Pumpkin Pan",
      "type": "Pan",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Luck",
          "value": 350,
          "unit": ""
        },
        {
          "name": "Capacity",
          "value": 350,
          "unit": ""
        },
        {
          "name": "Shake Strength",
          "value": 20,
          "unit": ""
        },
        {
          "name": "Shake Speed",
          "value": 1,
          "unit": "x"
        }
      ],
      "passive": "Summons a ghostly spirit."
    },
    {
      "id": "rose-pan",
      "name": "Rose Pan",
      "type": "Pan",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Luck",
          "value": 300,
          "unit": ""
        },
        {
          "name": "Capacity",
          "value": 350,
          "unit": ""
        },
        {
          "name": "Shake Strength",
          "value": 20,
          "unit": ""
        },
        {
          "name": "Shake Speed",
          "value": 1.2,
          "unit": "x"
        }
      ],
      "passive": "25% Luck Boost from nearby player"
    },
    {
      "id": "rusty-pan",
      "name": "Rusty Pan",
      "type": "Pan",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Luck",
          "value": 1,
          "unit": ""
        },
        {
          "name": "Capacity",
          "value": 5,
          "unit": ""
        },
        {
          "name": "Shake Strength",
          "value": 0.2,
          "unit": ""
        },
        {
          "name": "Shake Speed",
          "value": 0.8,
          "unit": "x"
        }
      ],
      "passive": [
        0
      ]
    },
    {
      "id": "silver-pan",
      "name": "Silver Pan",
      "type": "Pan",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Luck",
          "value": 4,
          "unit": ""
        },
        {
          "name": "Capacity",
          "value": 30,
          "unit": ""
        },
        {
          "name": "Shake Strength",
          "value": 0.8,
          "unit": ""
        },
        {
          "name": "Shake Speed",
          "value": 1,
          "unit": "x"
        }
      ],
      "passive": [
        0
      ]
    },
    {
      "id": "worldshaker",
      "name": "Worldshaker",
      "type": "Pan",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Luck",
          "value": 70,
          "unit": ""
        },
        {
          "name": "Capacity",
          "value": 150,
          "unit": ""
        },
        {
          "name": "Shake Strength",
          "value": 5,
          "unit": ""
        },
        {
          "name": "Shake Speed",
          "value": 1,
          "unit": "x"
        }
      ],
      "passive": "+25% Size Boost"
    }
  ],
  "shovels": [
    {
      "id": "abyssal-shovel",
      "name": "Abyssal Shovel",
      "type": "Shovel",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Dig Strength",
          "value": 125,
          "unit": ""
        },
        {
          "name": "Dig Speed",
          "value": 1.1,
          "unit": "x"
        },
        {
          "name": "Toughness",
          "value": 8,
          "unit": ""
        }
      ]
    },
    {
      "id": "candy-cane-shovel",
      "name": "Candy Cane Shovel",
      "type": "Shovel",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Dig Strength",
          "value": 140,
          "unit": ""
        },
        {
          "name": "Dig Speed",
          "value": 1,
          "unit": "x"
        },
        {
          "name": "Toughness",
          "value": 9,
          "unit": ""
        }
      ]
    },
    {
      "id": "cupids-arrow",
      "name": "Cupid's Arrow",
      "type": "Shovel",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Dig Strength",
          "value": 150,
          "unit": ""
        },
        {
          "name": "Dig Speed",
          "value": 1,
          "unit": "x"
        },
        {
          "name": "Toughness",
          "value": 9,
          "unit": ""
        }
      ]
    },
    {
      "id": "diamond-shovel",
      "name": "Diamond Shovel",
      "type": "Shovel",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Dig Strength",
          "value": 12,
          "unit": ""
        },
        {
          "name": "Dig Speed",
          "value": 1,
          "unit": "x"
        },
        {
          "name": "Toughness",
          "value": 4,
          "unit": ""
        }
      ]
    },
    {
      "id": "divine-shovel",
      "name": "Divine Shovel",
      "type": "Shovel",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Dig Strength",
          "value": 16,
          "unit": ""
        },
        {
          "name": "Dig Speed",
          "value": 1.1,
          "unit": "x"
        },
        {
          "name": "Toughness",
          "value": 5,
          "unit": ""
        }
      ]
    },
    {
      "id": "earthbreaker",
      "name": "Earthbreaker",
      "type": "Shovel",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Dig Strength",
          "value": 25,
          "unit": ""
        },
        {
          "name": "Dig Speed",
          "value": 1,
          "unit": "x"
        },
        {
          "name": "Toughness",
          "value": 5,
          "unit": ""
        }
      ]
    },
    {
      "id": "dragonflame-shovel",
      "name": "Dragonflame Shovel",
      "type": "Shovel",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Dig Strength",
          "value": 50,
          "unit": ""
        },
        {
          "name": "Dig Speed",
          "value": 0.6,
          "unit": "x"
        },
        {
          "name": "Toughness",
          "value": 5,
          "unit": ""
        }
      ]
    },
    {
      "id": "fossilized-shovel",
      "name": "Fossilized Shovel",
      "type": "Shovel",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Dig Strength",
          "value": 40,
          "unit": ""
        },
        {
          "name": "Dig Speed",
          "value": 1,
          "unit": "x"
        },
        {
          "name": "Toughness",
          "value": 6,
          "unit": ""
        }
      ]
    },
    {
      "id": "golden-shovel",
      "name": "Golden Shovel",
      "type": "Shovel",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Dig Strength",
          "value": 8,
          "unit": ""
        },
        {
          "name": "Dig Speed",
          "value": 1,
          "unit": "x"
        },
        {
          "name": "Toughness",
          "value": 3,
          "unit": ""
        }
      ]
    },
    {
      "id": "galactic-shovel",
      "name": "Galactic Shovel",
      "type": "Shovel",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Dig Strength",
          "value": 60,
          "unit": ""
        },
        {
          "name": "Dig Speed",
          "value": 0.8,
          "unit": "x"
        },
        {
          "name": "Toughness",
          "value": 6,
          "unit": ""
        }
      ]
    },
    {
      "id": "icebreaker",
      "name": "Icebreaker",
      "type": "Shovel",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Dig Strength",
          "value": 60,
          "unit": ""
        },
        {
          "name": "Dig Speed",
          "value": 1.1,
          "unit": "x"
        },
        {
          "name": "Toughness",
          "value": 6,
          "unit": ""
        }
      ]
    },
    {
      "id": "iron-shovel",
      "name": "Iron Shovel",
      "type": "Shovel",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Dig Strength",
          "value": 2,
          "unit": ""
        },
        {
          "name": "Dig Speed",
          "value": 0.8,
          "unit": "x"
        },
        {
          "name": "Toughness",
          "value": 2,
          "unit": ""
        }
      ]
    },
    {
      "id": "lifetouched-shovel",
      "name": "Lifetouched Shovel",
      "type": "Shovel",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Dig Strength",
          "value": 100,
          "unit": ""
        },
        {
          "name": "Dig Speed",
          "value": 1,
          "unit": "x"
        },
        {
          "name": "Toughness",
          "value": 7,
          "unit": ""
        }
      ]
    },
    {
      "id": "meteoric-shovel",
      "name": "Meteoric Shovel",
      "type": "Shovel",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Dig Strength",
          "value": 7,
          "unit": ""
        },
        {
          "name": "Dig Speed",
          "value": 1.5,
          "unit": "x"
        },
        {
          "name": "Toughness",
          "value": 4,
          "unit": ""
        }
      ]
    },
    {
      "id": "pumpkin-shovel",
      "name": "Pumpkin Shovel",
      "type": "Shovel",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Dig Strength",
          "value": 100,
          "unit": ""
        },
        {
          "name": "Dig Speed",
          "value": 1.25,
          "unit": "x"
        },
        {
          "name": "Toughness",
          "value": 8,
          "unit": ""
        }
      ]
    },
    {
      "id": "reinforced-shovel",
      "name": "Reinforced Shovel",
      "type": "Shovel",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Dig Strength",
          "value": 5,
          "unit": ""
        },
        {
          "name": "Dig Speed",
          "value": 0.9,
          "unit": "x"
        },
        {
          "name": "Toughness",
          "value": 3,
          "unit": ""
        }
      ]
    },
    {
      "id": "rusty-shovel",
      "name": "Rusty Shovel",
      "type": "Shovel",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Dig Strength",
          "value": 1,
          "unit": ""
        },
        {
          "name": "Dig Speed",
          "value": 0.8,
          "unit": "x"
        },
        {
          "name": "Toughness",
          "value": 1,
          "unit": ""
        }
      ]
    },
    {
      "id": "silver-shovel",
      "name": "Silver Shovel",
      "type": "Shovel",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Dig Strength",
          "value": 4,
          "unit": ""
        },
        {
          "name": "Dig Speed",
          "value": 1.1,
          "unit": "x"
        },
        {
          "name": "Toughness",
          "value": 2,
          "unit": ""
        }
      ]
    },
    {
      "id": "steel-shovel",
      "name": "Steel Shovel",
      "type": "Shovel",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Dig Strength",
          "value": 3,
          "unit": ""
        },
        {
          "name": "Dig Speed",
          "value": 0.8,
          "unit": "x"
        },
        {
          "name": "Toughness",
          "value": 2,
          "unit": ""
        }
      ]
    },
    {
      "id": "the-excavator",
      "name": "The Excavator",
      "type": "Shovel",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Dig Strength",
          "value": 7,
          "unit": ""
        },
        {
          "name": "Dig Speed",
          "value": 0.7,
          "unit": "x"
        },
        {
          "name": "Toughness",
          "value": 3,
          "unit": ""
        }
      ]
    },
    {
      "id": "venomspade-shovel",
      "name": "Venomspade Shovel",
      "type": "Shovel",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Dig Strength",
          "value": 200,
          "unit": ""
        },
        {
          "name": "Dig Speed",
          "value": 0.8,
          "unit": "x"
        },
        {
          "name": "Toughness",
          "value": 9,
          "unit": ""
        }
      ]
    },
    {
      "id": "starcrusher-shovel",
      "name": "Starcrusher Shovel",
      "type": "Shovel",
      "stats": [],
      "image": [
        0
      ],
      "toolStats": [
        {
          "name": "Dig Strength",
          "value": 300,
          "unit": ""
        },
        {
          "name": "Dig Speed",
          "value": 1,
          "unit": "x"
        },
        {
          "name": "Toughness",
          "value": 10,
          "unit": ""
        },
        {
          "name": "Luck",
          "value": 1.1,
          "unit": "x"
        }
      ],
      "passive": "+25% Luck from Luck Totems, +25% Strength from Strength Totems, and +20% Capacity and Speed from Luminant Totems; +1.1x additional Luck",
      "totemBoosts": [
        { "totem": "totem_luck", "boost": 0.25 },
        { "totem": "totem_strength", "boost": 0.25 },
        { "totem": "totem_luminant", "boost": 0.2 }
      ]
    }
  ],
  "mutations": [
    {
      "id": "diamond",
      "name": "Diamond",
      "multiplier": 1.35
    },
    {
      "id": "festive",
      "name": "Festive",
      "multiplier": 1.4
    },
    {
      "id": "gold",
      "name": "Gold",
      "multiplier": 1.2
    },
    {
      "id": "prismatic",
      "name": "Prismatic",
      "multiplier": 1.6
    },
    {
      "id": "silver",
      "name": "Silver",
      "multiplier": 1.1
    },
    {
      "id": "overclocked",
      "name": "Overclocked",
      "multiplier": 1.35
    },
    {
      "id": "granite",
      "name": "Granite",
      "multiplier": 1.35
    }
  ],
  "enchants": [
    {
      "id": "blessed",
      "name": "Blessed",
      "appliesTo": "Pan",
      "effects": [
        {
          "kind": "add",
          "stat": "Capacity",
          "value": 25,
          "unit": ""
        },
        {
          "kind": "mult",
          "stat": "Capacity",
          "multiplier": 1.1
        },
        {
          "kind": "add",
          "stat": "Luck",
          "value": 10,
          "unit": ""
        },
        {
          "kind": "mult",
          "stat": "Luck",
          "multiplier": 1.1
        }
      ],
      "rawEffects": [
        "+25 Capacity & 1.1x Pan Capacity",
        "+10 Luck & 1.1x Pan Luck"
      ]
    },
    {
      "id": "boosting",
      "name": "Boosting",
      "appliesTo": "Pan",
      "effects": [
        {
          "kind": "add",
          "stat": "Size Boost",
          "value": 10,
          "unit": "%"
        }
      ],
      "rawEffects": [
        "+10% Size Boost"
      ]
    },
    {
      "id": "cosmic",
      "name": "Cosmic",
      "appliesTo": "Pan",
      "effects": [
        {
          "kind": "add",
          "stat": "Capacity",
          "value": 50,
          "unit": ""
        },
        {
          "kind": "mult",
          "stat": "Capacity",
          "multiplier": 1.3
        },
        {
          "kind": "add",
          "stat": "Shake Strength",
          "value": 3,
          "unit": ""
        },
        {
          "kind": "mult",
          "stat": "Shake Strength",
          "multiplier": 1.15
        },
        {
          "kind": "add",
          "stat": "Size Boost",
          "value": 25,
          "unit": "%"
        }
      ],
      "rawEffects": [
        "+50 Capacity & 1.3x Pan Capacity",
        "+3 Shake Strength & 1.15x Pan Strength",
        "+25% Size Boost"
      ]
    },
    {
      "id": "destructive",
      "name": "Destructive",
      "appliesTo": "Pan",
      "effects": [
        {
          "kind": "add",
          "stat": "Shake Strength",
          "value": 5,
          "unit": ""
        },
        {
          "kind": "mult",
          "stat": "Shake Strength",
          "multiplier": 1.1
        }
      ],
      "rawEffects": [
        "+5 Shake Strength & 1.1x Pan Strength"
      ]
    },
    {
      "id": "divine",
      "name": "Divine",
      "appliesTo": "Pan",
      "effects": [
        {
          "kind": "add",
          "stat": "Capacity",
          "value": 40,
          "unit": ""
        },
        {
          "kind": "mult",
          "stat": "Capacity",
          "multiplier": 1.2
        },
        {
          "kind": "add",
          "stat": "Luck",
          "value": 20,
          "unit": ""
        },
        {
          "kind": "mult",
          "stat": "Luck",
          "multiplier": 1.2
        }
      ],
      "rawEffects": [
        "+40 Capacity & 1.2x Pan Capacity",
        "+20 Luck & 1.2x Pan Luck"
      ]
    },
    {
      "id": "excavating",
      "name": "Excavating",
      "appliesTo": "Shovel",
      "effects": [
        {
          "kind": "note",
          "raw": "25% to get 2-4 extra ores when they are Common to Rare."
        }
      ],
      "rawEffects": [
        "25% to get 2-4 extra ores when they are Common to Rare."
      ]
    },
    {
      "id": "forceful",
      "name": "Forceful",
      "appliesTo": "Pan",
      "effects": [
        {
          "kind": "add",
          "stat": "Shake Strength",
          "value": 2,
          "unit": ""
        }
      ],
      "rawEffects": [
        "+2 Shake Strength"
      ]
    },
    {
      "id": "geothermal",
      "name": "Geothermal",
      "appliesTo": "Shovel",
      "effects": [
        {
          "kind": "note",
          "raw": "2% base chance of getting a Geode when digging. (higher dig speed = lower chance)"
        }
      ],
      "rawEffects": [
        "2% base chance of getting a Geode when digging. (higher dig speed = lower chance)"
      ]
    },
    {
      "id": "gigantic",
      "name": "Gigantic",
      "appliesTo": "Pan",
      "effects": [
        {
          "kind": "add",
          "stat": "Capacity",
          "value": 40,
          "unit": ""
        },
        {
          "kind": "mult",
          "stat": "Capacity",
          "multiplier": 1.15
        }
      ],
      "rawEffects": [
        "+40 Capacity & 1.15x Pan Capacity"
      ]
    },
    {
      "id": "glowing",
      "name": "Glowing",
      "appliesTo": "Pan",
      "effects": [
        {
          "kind": "add",
          "stat": "Shake Speed",
          "value": 25,
          "unit": "%"
        }
      ],
      "rawEffects": [
        "+25% Shake Speed"
      ]
    },
    {
      "id": "greedy",
      "name": "Greedy",
      "appliesTo": "Pan",
      "effects": [
        {
          "kind": "add",
          "stat": "Sell Boost",
          "value": 20,
          "unit": "%"
        }
      ],
      "rawEffects": [
        "+20% Sell Boost"
      ]
    },
    {
      "id": "infernal",
      "name": "Infernal",
      "appliesTo": "Pan",
      "effects": [
        {
          "kind": "add",
          "stat": "Luck",
          "value": 80,
          "unit": ""
        },
        {
          "kind": "mult",
          "stat": "Luck",
          "multiplier": 1.4
        },
        {
          "kind": "add",
          "stat": "Capacity",
          "value": -20,
          "unit": ""
        },
        {
          "kind": "mult",
          "stat": "Capacity",
          "multiplier": 0.75
        },
        {
          "kind": "add",
          "stat": "Size Boost",
          "value": -10,
          "unit": "%"
        }
      ],
      "rawEffects": [
        "+80 Luck & 1.4x Pan Luck",
        "−20 Capacity & 0.75x Pan Capacity",
        "−10% Size Boost"
      ]
    },
    {
      "id": "lucky",
      "name": "Lucky",
      "appliesTo": "Pan",
      "effects": [
        {
          "kind": "add",
          "stat": "Luck",
          "value": 5,
          "unit": ""
        }
      ],
      "rawEffects": [
        "+5 Luck"
      ]
    },
    {
      "id": "mastered",
      "name": "Mastered",
      "appliesTo": "Shovel",
      "effects": [
        {
          "kind": "note",
          "raw": "Auto-Panning now has 100% quality."
        }
      ],
      "rawEffects": [
        "Auto-Panning now has 100% quality."
      ]
    },
    {
      "id": "midas",
      "name": "Midas",
      "appliesTo": "Pan",
      "effects": [
        {
          "kind": "add",
          "stat": "Sell Boost",
          "value": 50,
          "unit": "%"
        }
      ],
      "rawEffects": [
        "+50% Sell Boost"
      ]
    },
    {
      "id": "mythical",
      "name": "Mythical",
      "appliesTo": "Shovel",
      "effects": [
        {
          "kind": "note",
          "raw": "10% Chance to get a duplicate Mythic or Exotic resource when found."
        }
      ],
      "rawEffects": [
        "10% Chance to get a duplicate Mythic or Exotic resource when found."
      ]
    },
    {
      "id": "non-euclidean",
      "name": "Non Euclidean",
      "appliesTo": "Shovel",
      "effects": [
        {
          "kind": "note",
          "raw": "With each perfect dig streak, increase Capacity by .1x up to 2x."
        }
      ],
      "rawEffects": [
        "With each perfect dig streak, increase Capacity by .1x up to 2x."
      ]
    },
    {
      "id": "prismatic",
      "name": "Prismatic",
      "appliesTo": "Pan",
      "effects": [
        {
          "kind": "add",
          "stat": "Capacity",
          "value": 20,
          "unit": ""
        },
        {
          "kind": "mult",
          "stat": "Capacity",
          "multiplier": 1.15
        },
        {
          "kind": "add",
          "stat": "Shake Strength",
          "value": 2,
          "unit": ""
        },
        {
          "kind": "mult",
          "stat": "Shake Strength",
          "multiplier": 1.15
        },
        {
          "kind": "add",
          "stat": "Size Boost",
          "value": 10,
          "unit": "%"
        },
        {
          "kind": "add",
          "stat": "Luck",
          "value": 10,
          "unit": ""
        },
        {
          "kind": "mult",
          "stat": "Luck",
          "multiplier": 1.15
        },
        {
          "kind": "add",
          "stat": "Shake Speed",
          "value": 10,
          "unit": "%"
        },
        {
          "kind": "add",
          "stat": "Modifier Boost",
          "value": 10,
          "unit": "%"
        }
      ],
      "rawEffects": [
        "+20 Capacity & 1.15x Pan Capacity",
        "+2 Shake Strength & 1.15x Pan Strength",
        "+10% Size Boost",
        "+10 Luck & 1.15x Pan Luck",
        "+10% Shake Speed",
        "+10% Modifier Boost"
      ]
    },
    {
      "id": "rhythmic",
      "name": "Rhythmic",
      "appliesTo": "Shovel",
      "effects": [
        {
          "kind": "note",
          "raw": "With each perfect dig streak, increase Luck by 0.2x up to 1.3x."
        }
      ],
      "rawEffects": [
        "With each perfect dig streak, increase Luck by 0.2x up to 1.3x."
      ]
    },
    {
      "id": "strong",
      "name": "Strong",
      "appliesTo": "Pan",
      "effects": [
        {
          "kind": "add",
          "stat": "Capacity",
          "value": 20,
          "unit": ""
        }
      ],
      "rawEffects": [
        "+20 Capacity"
      ]
    },
    {
      "id": "swift",
      "name": "Swift",
      "appliesTo": "Pan",
      "effects": [
        {
          "kind": "add",
          "stat": "Shake Speed",
          "value": 10,
          "unit": "%"
        }
      ],
      "rawEffects": [
        "+10% Shake Speed"
      ]
    },
    {
      "id": "synergized",
      "name": "Synergized",
      "appliesTo": "Shovel",
      "effects": [
        {
          "kind": "note",
          "raw": "Perfect digging next to your sluice decreases its timer by 1s (0.25s cd)."
        }
      ],
      "rawEffects": [
        "Perfect digging next to your sluice decreases its timer by 1s (0.25s cd)."
      ]
    },
    {
      "id": "titanic",
      "name": "Titanic",
      "appliesTo": "Pan",
      "effects": [
        {
          "kind": "add",
          "stat": "Capacity",
          "value": 30,
          "unit": ""
        },
        {
          "kind": "mult",
          "stat": "Capacity",
          "multiplier": 1.1
        },
        {
          "kind": "add",
          "stat": "Size Boost",
          "value": 20,
          "unit": "%"
        }
      ],
      "rawEffects": [
        "+30 Capacity & 1.1x Pan Capacity",
        "+20% Size Boost"
      ]
    },
    {
      "id": "toughened",
      "name": "Toughened",
      "appliesTo": "Shovel",
      "effects": [
        {
          "kind": "add",
          "stat": "Toughness",
          "value": 2,
          "unit": ""
        }
      ],
      "rawEffects": [
        "Toughness increased by 2."
      ]
    },
    {
      "id": "treasure-hunter",
      "name": "Treasure Hunter",
      "appliesTo": "Shovel",
      "effects": [
        {
          "kind": "note",
          "raw": "2x chance to find treasure map, and 2x map capacity"
        }
      ],
      "rawEffects": [
        "2x chance to find treasure map, and 2x map capacity"
      ]
    },
    {
      "id": "unstable",
      "name": "Unstable",
      "appliesTo": "Pan",
      "effects": [
        {
          "kind": "add",
          "stat": "Modifier Boost",
          "value": 25,
          "unit": "%"
        }
      ],
      "rawEffects": [
        "+25% Modifier Boost"
      ]
    },
    {
      "id": "void-touched",
      "name": "Void Touched",
      "appliesTo": "Shovel",
      "effects": [
        {
          "kind": "note",
          "raw": "5% chance for ores to be Voidtorn once panned."
        }
      ],
      "rawEffects": [
        "5% chance for ores to be Voidtorn once panned."
      ]
    },
    {
      "id": "well-balanced",
      "name": "Well Balanced",
      "appliesTo": "Shovel",
      "effects": [
        {
          "kind": "note",
          "raw": "Increase the perfect dig threshold by 3x."
        }
      ],
      "rawEffects": [
        "Increase the perfect dig threshold by 3x."
      ]
    },
    {
      "id": "wormhole",
      "name": "Wormhole",
      "appliesTo": "Shovel",
      "effects": [
        {
          "kind": "note",
          "raw": "10% chance to obtain materials from a different deposit when panning"
        }
      ],
      "rawEffects": [
        "10% chance to obtain materials from a different deposit when panning"
      ]
    },
    {
      "id": "cosmic",
      "name": "Cosmic",
      "appliesTo": "Pan",
      "effects": [
        { "kind": "mult", "stat": "Capacity", "multiplier": 1.3 },
        { "kind": "add", "stat": "Capacity", "value": 50, "unit": "" },
        { "kind": "mult", "stat": "Shake Strength", "multiplier": 1.15 },
        { "kind": "add", "stat": "Shake Strength", "value": 3, "unit": "" },
        { "kind": "add", "stat": "Size Boost", "value": 25, "unit": "%" }
      ],
      "rawEffects": [ "1.3x Pan Capacity & +50 Capacity", "1.15x Pan Shake Strength & +3 Shake Strength", "+25% Size Boost" ]
    },
    {
      "id": "divine",
      "name": "Divine",
      "appliesTo": "Pan",
      "effects": [
        { "kind": "mult", "stat": "Capacity", "multiplier": 1.2 },
        { "kind": "add", "stat": "Capacity", "value": 40, "unit": "" },
        { "kind": "mult", "stat": "Luck", "multiplier": 1.2 },
        { "kind": "add", "stat": "Luck", "value": 20, "unit": "" }
      ],
      "rawEffects": [ "1.2x Pan Capacity & +40 Capacity", "1.2x Pan Luck & +20 Luck" ]
    },
    {
      "id": "cursed",
      "name": "Cursed",
      "appliesTo": "Pan",
      "effects": [
        { "kind": "mult", "stat": "Luck", "multiplier": 0.7 },
        { "kind": "add", "stat": "Luck", "value": -100, "unit": "" },
        { "kind": "mult", "stat": "Capacity", "multiplier": 0.7 },
        { "kind": "add", "stat": "Capacity", "value": -100, "unit": "" },
        { "kind": "add", "stat": "Modifier Boost", "value": 50, "unit": "%" },
        { "kind": "add", "stat": "Size Boost", "value": 50, "unit": "%" }
      ],
      "rawEffects": [ "0.7x Pan Luck & -100 Luck", "0.7x Pan Capacity & -100 Capacity", "+50% Modifier Boost", "+50% Size Boost" ]
    },
    {
      "id": "devouring",
      "name": "Devouring",
      "appliesTo": "Pan",
      "effects": [
        { "kind": "mult", "stat": "Luck", "multiplier": 1.5 },
        { "kind": "add", "stat": "Luck", "value": 200, "unit": "" },
        { "kind": "add", "stat": "Size Boost", "value": -50, "unit": "%" }
      ],
      "rawEffects": [ "1.5x Pan Luck & +200 Luck", "-50% Size Boost" ]
    },
    {
      "id": "hyperspeed",
      "name": "Hyperspeed",
      "appliesTo": "Pan",
      "effects": [
        { "kind": "mult", "stat": "Shake Strength", "multiplier": 1.3 },
        { "kind": "add", "stat": "Shake Strength", "value": 10, "unit": "" },
        { "kind": "add", "stat": "Shake Speed", "value": 40, "unit": "%" }
      ],
      "rawEffects": [ "1.3x Pan Shake Strength & +10 Shake Strength", "+0.4 Shake Speed" ]
    },
    {
      "id": "irregular",
      "name": "Irregular",
      "appliesTo": "Pan",
      "effects": [
        { "kind": "mult", "stat": "Luck", "multiplier": 1.25 },
        { "kind": "add", "stat": "Luck", "value": 66, "unit": "" },
        { "kind": "add", "stat": "Modifier Boost", "value": 66, "unit": "%" }
      ],
      "rawEffects": [ "1.25x Pan Luck & +66 Luck", "+66% Modifier Boost" ]
    },
    {
      "id": "mystical",
      "name": "Mystical",
      "appliesTo": "Pan",
      "effects": [
        { "kind": "mult", "stat": "Luck", "multiplier": 1.4 },
        { "kind": "add", "stat": "Luck", "value": 100, "unit": "" },
        { "kind": "mult", "stat": "Capacity", "multiplier": 1.4 },
        { "kind": "add", "stat": "Capacity", "value": 100, "unit": "" }
      ],
      "rawEffects": [ "1.4x Pan Luck & +100 Luck", "1.4x Pan Capacity & +100 Capacity" ]
    },
    {
      "id": "starstruck",
      "name": "Starstruck",
      "appliesTo": "Pan",
      "effects": [
        { "kind": "mult", "stat": "Luck", "multiplier": 1.3 },
        { "kind": "add", "stat": "Luck", "value": 75, "unit": "" },
        { "kind": "add", "stat": "Sell Boost", "value": 50, "unit": "%" },
        { "kind": "add", "stat": "Size Boost", "value": 20, "unit": "%" }
      ],
      "rawEffects": [ "1.3x Pan Luck & +75 Luck", "+50% Sell Boost", "+20% Size Boost" ]
    }
  ],
  "trinkets": [
    {
      "id": "beach-umbrella",
      "name": "Beach Umbrella",
      "type": "Trinket",
      "appliesTo": "Pan",
      "rarity": "Mythic",
      "stats": [
        "Every modified item panned increases your base luck by 25 for the next pan."
      ],
      "image": [
        0
      ]
    }
  ],
  "data-astro-cid-fnmdkhqv": true
};
