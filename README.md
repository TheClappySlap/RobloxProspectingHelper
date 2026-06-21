# Prospecting Build Planner

A clean, build-free web app for planning and (soon) comparing builds in the
Roblox game **Prospecting**. Pick your kit, see your stats update live.

## Run it

Double-click **`start.bat`** — it serves the app and opens
<http://localhost:5500/> in your browser. (ES modules require a real
`http://` origin, so opening `index.html` directly via `file://` won't work.)

To stop the server, close the black terminal window.

> Requires Python (already installed on this machine as `py`). No Node, no
> install, no build step.

## Project layout

```
index.html              app shell
serve.py / start.bat    the dev server + launcher
src/
  styles/               app.css (look & feel) + museum.css
  core/
    config.js           stats, slot layout, rarities  ← tweak kit size here
    parse.js            wiki stat-string parser
    db.js               data access over the game data files
    engine.js           stat calculation
    metrics.js          Rolls/sec + cycle metrics (delegates to throughputMath)
    throughputMath.js   single source of truth for the throughput model
    optimizer.js        JS-native auto-optimizer (no Python backend)
    buffsModel.js       buff/totem/event/potion groups
    museumData.js       museum ore / mutation data
    store.js            state + localStorage + pub/sub
  ui/
    main.js             bootstrap + tab routing
    slotBoard.js        the gear loadout
    picker.js           item picker popover + configurator
    statsPanel.js       live totals + breakdown
    buffsPanel.js       buffs & potions toggles
    museumPanel.js      build's museum multiplier column
    museumTab.js        standalone museum planner tab
    optimizerPanel.js   auto-optimize modal
    mathTab.js          🧮 math validator tab
    compareView.js      A/B compare center diff
    helpers.js          formatting / DOM helpers

data/
  equipment_database.js item data (pans, shovels, rings, runes, …)  ← source of truth
  gear_data.js          item images
docs/                   design notes (OPTIMIZER_DESIGN.md)
_legacy/                previous app versions + rejected Python optimizer (archived)
_reference/             raw wiki dumps + unused data exports (archived)
```

## Adjusting the kit layout

Number of ring/rune slots is set in [`src/core/config.js`](src/core/config.js):

```js
export const NUM_RINGS = 4;
export const NUM_RUNES = 5;
```

## Roadmap

- [x] Build editor: slots, item picker, mutations/enchants/stars, live stats
- [x] Save builds + side-by-side comparison with stat diffs
- [ ] "Best build" optimizer
- [ ] Correctness pass + tests
