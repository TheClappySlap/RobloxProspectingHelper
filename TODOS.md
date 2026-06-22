# Prospecting Build Planner — Task Tracker

> Legend: 🔴 Blocker · 🟡 Active · 🟢 Future · ✅ Done · 🚧 In Progress

---

## Phase 1 — Quick Fixes

### Museum (session 2026-06-22) ✅
- [x] Fix MUTATION_MULT: common 0.005, uncommon 0.0075, rare 0.0125 (were all 0.01)
- [x] Fix North Star max boost (0.32 → 0.2 for all 4 stats)
- [x] Add 6 missing exotic ores: Pumpkin Soul, Singularium, Starpiercer, Umbrite, Vineheart, Voidstone
- [x] Fix Size Build priority chain (started with 'sell_boost' → now 'size_boost')
- [x] Fix mutation dropdown truncation ("Per..." → "Perfect") — min-width + trigger span ellipsis
- [x] Fix mutation multiplier display to 3 decimal places (0.005 was rounding to 0.01)
- [x] Add Mutation Legend to museum sidebar (full name + stat abbreviations per mutation)
- [x] Fix Modifier Math table in sidebar (wrong mut values for common/uncommon/rare)

### Equipment Panel
- [ ] **Sort equipment by worth** — Add sort control with direction toggle (Best→Worst / Worst→Best) for pans, shovels, and all equipment
- [ ] **Equipment value > 100%** — Allow entering more than 100% for all equipment fields
- [ ] **Dredge Master cap** — Currently capped at 20; remove or raise
- [ ] **Daily Login cap** — Currently capped at 10; remove or raise
- [ ] **Equipment range step by 1** — Min/Max fields should increment by 1, not larger steps
- [ ] **Limited pans/shovels page** — Second tab or panel for limited/event pans and shovels

### Build & Gear UX
- [ ] **"Done" / Enter button in picker** — Confirm button so user doesn't need to click X to dismiss
- [ ] **Star display** — Don't use dimmed/lightened stars for 5-star vs 6-star; show actual star count
- [ ] **Load/Edit All Gear visibility** — Buttons are too small; users miss them entirely; increase size
- [ ] **Choose meta build load side** — Let user pick whether meta builds load into Build A or Build B

### Accessories / Jewelry Panel
- [ ] **Neck/Charm/Rings title size** — Make labels larger and brighter (match "Equipped" color intensity)
- [ ] **"Unequip All" / "Lock Extra Ring Slots" contrast** — Blending into yellow background; use dark text
- [ ] **Runes button placement** — Move closer to center; change arrow color (white or light-grey)

### Visuals / Accessibility
- [ ] **Devouring enchant color** — Add distinct color coding for the Devouring enchant
- [ ] **Color vs B&W text** — Accessibility pass: important text readable in both color and greyscale

---

## Phase 2 — Museum Overhaul

### Auto Museum Planner
- [ ] **Treasured-map awareness** — When autofilling luck builds, only assign "Treasured" mutation to ores obtainable from: Fortune River, Fortune River Delta, Sunset Beach, Volcanic Sands, Windswept Beach, Frostbite River, Rotwood Swamp. Other slots should use best alternative mutation.
- [ ] **Three-tier fill algorithm**:
  1. **Priority** — match museum slots to stats the current build planner prioritizes
  2. **Ambitious** — fill toward user-defined stretch stat targets
  3. **Mathematical best** — pure optimal ore/mutation per slot ignoring other context
- [ ] **Planner → Museum push** — "Apply to Museum" button on optimizer result that populates museum slots to match the ideal stat vector
- [ ] **Museum → Build pull** — Saving museum layout optionally updates active build's museum column (requires snake_case → planner stat name mapping)
- [ ] **Prismara pre-slot** — Pre-contribute Prismara (+0.25× Luck/Cap/DigStr/ShakeStr) before water-filling, to prevent over-allocating stats it already covers

### Museum Data Completeness
- [ ] **Verify all 15 exotic ore values** — Cross-check against miraheze wiki (prospecting.miraheze.org)
- [ ] **Ore hunter feature** — "Best ore to find right now given current museum state" — deferred until data is fully confirmed

### Museum Math / Bugs
- [ ] **Museum target-matching** — Given optimizer's ideal stat vector, find closest achievable ore combo; "Apply to Museum Tab" button on result card
- [ ] **Step function in museum allocation** — fastScore uses shakesPerSecond() correctly; museum water-filling doesn't account for non-monotone speed breakpoints

---

## Phase 3 — New Features

### Build Importer
- [ ] **Image upload → auto-populate** — Upload screenshot of gear/build; OCR/image recognition extracts item names, star levels, roll %, mutations, enchants and auto-fills the planner
- [ ] **JSON / URL build sharing** — Share builds via a JSON blob or URL hash (currently localStorage only)

### Auto-Optimizer (Thoroughness)
- [ ] **Math verification pass** — End-to-end audit of engine equations (additive model, museum mult, shakesPerSecond table, trinket formulas) against known build outputs
- [ ] **Enchant pruning by objective** — Luck build: only Divine/Devouring. Speed build: speed enchants. Implement `validEnchantsFor(objective)` to reduce search space
- [ ] **Parameterizable objective** — Swap from Rolls/s to Gold/s, Mod Boost focus, or hybrid. Design: `optimize({ objective: 'rolls' | 'gold' | 'modboost' | 'hybrid', weights })`
- [ ] **Item access checklist** — "I own these items" filter; optimizer only considers owned items
- [ ] **Validate optimizer vs meta** — After reliability fix, run and verify it matches or beats meta builds

### Upgrade Analysis Report
- [ ] **Quick / Med / Chase report panel** — Given current build, produce three-tier upgrade suggestions:
  - **Quick**: Cheapest 1–2 item swaps with highest Rolls/s % gain
  - **Med**: Moderate grinds — re-rolling gear quality, target enchant, etc.
  - **Chase**: Long-term best-in-slot targets and estimated % improvement
- [ ] **Per-stat marginal return display** — Show: how much does +1 Luck / +1% Dig Speed / etc. change Rolls/s?
- [ ] **Stat efficiency values** — "1 point of Luck = X Rolls/s" marginal rate; display as tooltip or sidebar

---

## Backlog — UX Overhaul

### Meta Builds Loader
- [ ] **Topbar "Presets" button** — Remove dropdown from build header; add "Presets" button → opens a modal
- [ ] **Presets modal with build cards** — Each preset as a card: name, description, tags (Ascended / Budget / etc). Click to load.
- [ ] **Prismatic 6★ 100% default preset** — All slots at 6★, 100% rolls, Prismatic mutation; useful as perfect-gear baseline

### Bulk Gear Editor
- [ ] **"Edit All Gear" button** — Access near build header or slot board
- [ ] **Bulk edit modal** — Controls: Star tier (5★/6★), Roll % (segmented), Mutation dropdown. Preview: "Will apply to X equipped slots." Apply button.

### Buffs Panel
- [ ] **Mastery bonus select** — 1.05×–1.25× additive Luck multiplier select; add above/near Permanent group
- [ ] **Friend bonus counter** — 0–5 friends, each +10% additive Luck
- [ ] **Reorder Dredge Master + Daily Login** — Group adjacent in Permanent section

### Auto-Optimizer UI
- [ ] **Mutation selector: color-coded chips** — Mutation name with rarity-style color + roll% range indicator
- [ ] **Fix/Lock gear section** — Per-slot toggle (Necklace, Charm, Ring1–Ring8); locked slots are held by optimizer
- [ ] **Auto-equip pan/shovel** — If contextBuild has no pan/shovel, optimizer auto-picks best before running
- [ ] **Target stats section** — Clarify with user: change objective / show achievement in results / minimum threshold constraint
- [ ] **Quick buff preset** — "Luck+Str Totem + all coin/perm buffs" one-click button

### Theme / Accessibility
- [ ] **Color audit** — WCAG AA contrast check for all stat/rarity/interactive colors
- [ ] **Luck = green bold everywhere** — All Luck values use `--stat-luck: #6bd968`
- [ ] **Enchant colors in display** — Enchant chips on equipped items need rarity/type color consistently applied
- [ ] **Mobile-responsive layout** — Desktop-first currently; compare mode especially needs work

### Deployment
- [ ] **Host on GitHub Pages or Netlify** — Push to gh-pages or connect Netlify; verify CORS / ES module paths
- [ ] **Bundle images locally** — All icons are live CDN calls to `static.wikitide.net`; bundle into `/assets/images/` for stability

---

## ✅ Done (reference)
- Build planner: all slots, live stats, rarity colors, roll display
- Compare mode: A/B side-by-side, Δ column, verdict, Copy/Swap
- Buffs panel: all 42 buffs grouped (Totems/Permanent/Coin/Shard/Traveler/Events/Misc)
- Auto-Optimizer: 3-step pipeline (gear sweep → museum brute force Web Worker → pairwise coordinate descent)
- Museum tab: standalone ore planner, autofill, save/load, stat-filter chips
- Math validator tab: manual stat/n inputs, exact derivation, Load Build A/B
- Dark theme: converted from parchment to dark (#12141c base)
- Pan enchant search in optimizer (including Devouring)
- Museum panel: vertical layout, museum-eligible stats only, clean decimal inputs
- Priority-chain autofill presets in museum (Luck Build / Hybrid Build / Size Build)
- Museum session 2026-06-22: MUTATION_MULT corrected, North Star fixed, 6 exotic ores added, Size Build chain fixed, dropdown truncation fixed, 3-decimal mutation display, mutation legend added

---

## Notes for Future Claude Sessions
- **Data source rule**: prospecting.miraheze.org is the ONLY trusted wiki. Fandom/prospectingwiki.org are unreliable.
- **Multipliers stack ADDITIVELY** (`mult += val-1`). Only 4 things are global multiplicative: shovel (Dig Str only), meteor event, starfall event, fog-swamp event.
- **Optimizer runs in JS** — no Python backend. Do not recreate it.
- **Images**: all on `static.wikitide.net`; `onerror` fallback to `◆` is intentional.
- **serve.py**: pure static, `ThreadingHTTPServer`, `Cache-Control: no-cache must-revalidate` (NOT no-store).
- **Treasured mutation maps**: Fortune River, Fortune River Delta, Sunset Beach, Volcanic Sands, Windswept Beach, Frostbite River, Rotwood Swamp — only these maps can yield Treasured-mutated ores.
- **Exotic ore count**: 15 total (9 were in v1, 6 added session 2026-06-22).
