# Objectnaut — handoff pack

**Read `DESIGN.md` first** (also at the repo root). That is the intent: what we are matching (Objectnaut / Scribblenauts sandbox), what already works, and what not to regress.

This file is the practical sprite/layout cheat sheet.

## Run

```bash
npm install
npm run dev
```

TanStack Start + Vite + React + Matter.js. Game: `src/game/`. HUD: `src/components/objectnaut-app.tsx`.

## Current production sprites

`public/sprites/` (also copied to `sprites-current/`):

| File | Grid | Frames | Notes |
|---|---|---|---|
| otto-idle.png | 2×2 | 4 | ink-sketch side view |
| otto-walk.png | 4×2 | 8 | 12 fps in renderer |
| cat-idle.png | 2×2 | 4 | |
| cat-walk.png | 4×2 | 8 | 12 fps |
| lion-idle.png | 2×2 of **256px** cells (512×512 sheet) | 4 | blink frames aligned; feet pad 22/256 |
| lion-walk.png | 4×2 of **256px** cells (1024×512) | 8 | **8 fps; consecutive video frames 20–27**, not even-sampled |
| lion-sleep.png | 2×2 of **128px** cells (256×256) | 4 | 3 fps; lying down. **Art quality bar.** |
| spark.png | 2×2 | 4 | |
| fire.png | 2×2 | 4 | |

Renderer: `src/game/render.ts` (`drawCell` infers cell width from `image.width / cols`). Bump `?v=` on `load()` after replacing a PNG.

## Do not regress

- Sleeping adjective must not empty hunt/fear. Wake uses `restoreTemperament`.
- Living vs living: no collision. Living stay upright.
- W = jump only. Inspect = magnifying glass. Notepad = icon under top-right tools.
- Lion walk: one contiguous stride. Do not even-sample 6s. Do not replace with a posed 2×2 without looking at the current cycle.
- Magenta cleanup: gentle key. Aggressive flood eats cream paper fill.

## Sprite sources

`assets/sprites/<name>/` — generate2dsprite outputs.
`assets/sprites/video2dsprite/{otto,cat,lion}-walk/` — videos + grids (raw frame dumps omitted).
`assets/sprites/_archive/cat-2026-09-16/` — cat sprites before restyle.
