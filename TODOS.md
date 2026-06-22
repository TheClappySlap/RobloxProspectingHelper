# Prospecting Build Planner — Task Tracker

> Legend: 🔴 Blocker · 🟡 Next · 🟢 Future · ✅ Done

---

## v0.3 — Next Iteration

### Quick Fixes
- [ ] 🟡 **Devouring enchant color** — Missing from ENCHANT_COLORS in config.js; add distinct color
- [ ] 🟡 **Sort picker by value** — Best→Worst / Worst→Best toggle on pan/shovel/accessory tiles
- [ ] 🟡 **Roll input step = 1** — Min/Max range inputs in equipment config should go up/down by 1
- [ ] 🟡 **"Done" button in picker** — Confirm/close button so user doesn't need to hit X to dismiss
- [ ] 🟡 **Neck/Charm/Rings labels** — Make slot section titles larger and brighter (match "Equipped" heading)
- [ ] 🟡 **Runes button** — Move closer to center; change arrow color to white or light grey
- [ ] 🟡 **Allow >100% rolls for all gear** — Currently only overRollable items allow it; make it universal

### Museum
- [ ] 🟡 **Modifier abbreviation tooltips** — On hover over abbreviated stat names in slots, show full label
- [ ] 🟡 **Verify all 15 exotic ores** — Cross-check values against prospecting.miraheze.org
- [ ] 🟡 **Treasured-map awareness** — Autofill luck builds should only assign Treasured mutation to ores from: Fortune River, Fortune River Delta, Sunset Beach, Volcanic Sands, Windswept Beach, Frostbite River, Rotwood Swamp

### Accessibility
- [ ] 🟢 **Color vs B&W text** — WCAG AA contrast pass; key text readable in greyscale

---

## v0.4 — Bigger Features

### Build Importer
- [ ] **Image upload → auto-populate** — Screenshot → OCR extracts item names, star levels, roll %, mutations, enchants and auto-fills the planner (parser-work branch has OCR groundwork)
- [ ] **JSON / URL build sharing** — Share builds via URL hash or exportable JSON blob

### Upgrade Analysis
- [ ] **Quick / Med / Chase report** — Given current build, output tiered upgrade suggestions with estimated Rolls/s % gain
- [ ] **Per-stat marginal return** — "1 point of Luck = X Rolls/s" marginal rate, shown as tooltip

### Auto-Optimizer Improvements
- [ ] **Enchant pruning by objective** — Luck: Divine/Devouring only. Speed: speed enchants only. Reduces search space.
- [ ] **Item access filter** — "I own these items" checkbox; optimizer skips unowned
- [ ] **Parameterizable objective** — Swap Rolls/s target for Gold/s, Mod Boost focus, or hybrid

### Museum Planner
- [ ] **Planner → Museum push** — "Apply to Museum" button from optimizer result
- [ ] **Prismara pre-slot** — Pre-contribute Prismara (+0.25× Luck/Cap/DigStr/ShakeStr) before water-filling
- [ ] **Three-tier autofill** — Priority (match build stats) / Ambitious (stretch targets) / Best-math

---

## ✅ Completed — v0.2

### This Session (2026-06-22)
- Museum MUTATION_MULT corrected: common 0.005×, uncommon 0.0075×, rare 0.0125×
- North Star all 4 stats corrected to 0.20× (was 0.32×)
- 6 missing exotic ores added: Pumpkin Soul, Singularium, Starpiercer, Umbrite, Vineheart, Voidstone (15 total)
- Size Build priority chain fixed (size_boost first, not sell_boost)
- Mutation display 3 decimal places (0.005 not 0.01)
- Modifier Math legend corrected (Uncommon 0.0075×, Rare 0.0125×)
- Ore modifier colors: 24-modifier color map in museum dropdown + slot labels
- Museum row UX: click anywhere in row to equip/unequip; indicator visible on hover right side
- Museum scroll position preserved on every re-render (no layout jump)
- Picker: Limited Pans / Limited Shovels tab — regular tab excludes limited items
- Picker: Stars 1–6 own row with literal ★ characters; quality presets separate row
- Picker: Green "✓ Equip" confirm button at bottom-right
- Mutation chips: active/hover glow in each mutation's own color (not gold)
- Enchant chips: active/hover glow in each enchant's own color
- Mutation colors corrected: Silver #B2B2B2 · Gold #FFCC1B · Diamond #3AD5FF · Overclocked #386FFF · Granite #834F2F
- Prismatic and Festive: gradient chips (full gradient on hover/active; solid primary color on equipped display)
- Build head: two-row layout — name + Meta Builds top row; Load/Save/Reset/Edit All below
- Meta Builds per-build (each build A/B has own button); modal shows "Loading into Build A/B"
- Chip ring highlight: outline (not box-shadow) — no layout shift on selection
- Dredge Master cap lifted; Daily Login cap lifted
- Unlock Extra Ring Slots button: solid dark background for contrast on gold board
- v0.2 Preview badge in topbar
- Clockwork Charm: overRollable flag added
- Branch hygiene: parser/OCR work isolated to parser-work branch; node_modules gitignored

### Prior Sessions
- Build planner: all slots, live stats, rarity colors, roll display
- Compare mode: A/B side-by-side, Δ column, verdict, Copy/Swap
- Buffs panel: all 42 buffs grouped (Totems/Permanent/Coin/Shard/Traveler/Events/Misc)
- Auto-Optimizer: 3-step pipeline (gear sweep → museum brute force Web Worker → pairwise coordinate descent)
- Museum tab: standalone ore planner, autofill, save/load, stat-filter chips, priority-chain presets
- Dark theme: converted from parchment to dark (#12141c base)
- Bulk Editor: star tier / roll % / mutation applied to all occupied accessory slots at once
- Presets modal: meta builds load into chosen build A or B
- Per-stat color coding across all panels

---

## Notes — Rules That Must Not Change
- **Data source**: prospecting.miraheze.org ONLY. Fandom/prospectingwiki.org are unreliable.
- **Multipliers stack ADDITIVELY** (`mult += val-1`). Only 4 global multiplicative: shovel (Dig Str only), meteor event, starfall event, fog-swamp event.
- **Images**: all on `static.wikitide.net`; `onerror` fallback to `◆` is intentional.
- **serve.py**: `ThreadingHTTPServer`, `Cache-Control: no-cache must-revalidate` (NOT no-store). Never change.
- **Exotic ore count**: 15 total (9 original + 6 added 2026-06-22).
- **Treasured mutation maps**: Fortune River, Fortune River Delta, Sunset Beach, Volcanic Sands, Windswept Beach, Frostbite River, Rotwood Swamp.
