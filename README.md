# ECB: Outbreak

A roguelike zombie-plague card strategy game. You command the **Expeditionary Combat Brigade**: draw orders each week, deploy MCV battalions, artillery, air defense, aviation and engineers across a live world map, and hold the line until the labs find a cure. Then go back and restore order.

**Play:** https://ecb-outbreak.onrender.com

## How it's built
- `index.html` is the whole game in one self-contained file. It is what Render serves.
- `src/` holds the source: `engine.js` (rules), `ui.js` (interface), `art.js` (all vector art), `cinema.js` (opening film), `mapdata.js` (world map), `style.css`.
- `tools/build.py` stitches `src/` into `index.html` (and `dist/`). Run `python3 tools/build.py` after any change.
- `tools/sim.cjs`, `tools/bal.cjs`: bot playthroughs for balance testing (`node tools/bal.cjs 150`).
- `tools/play*.py`: Playwright browser tests. `tools/sheet.cjs`, `tools/symsheet.cjs`: art contact sheets.

Saves live in the player's browser (localStorage), so updating the page keeps runs in progress.
