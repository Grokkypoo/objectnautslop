# Objectnaut — what this is, what we are matching, what is done

This is a **Scribblenauts / Objectnaut-style notebook sandbox**. The player is Otto. They write a word. The engine resolves a noun plus adjectives, inherits flags from a category tree, and drops a physics object into a paper world. Objects then **do what their bits say** — burn, float, hunt, fear, sleep, stick — instead of each noun being a unique script.

The north star is **Objectnaut** (the modern data-driven take on Scribblenauts): longest-suffix noun parse, category inheritance, adjective bit-flips, one resolved def per spawn. Not a fighting game. Not an RPG. A toy box where `sleeping lion` and `tiny flying anvil` are both legal and the world has to cope.

---

## What we are trying to match

### Feel

- Ruled notebook paper, walnut ink, terracotta accents. Hand-drawn, not pixel-crunchy.
- Side-view 2D platformer sandbox. Otto walks and jumps; spawned things have mass.
- Writing a word is the verb. The world reacts. Puzzles are optional; the playground is the point.

### Object model (Objectnaut)

1. Player types `giant sleeping lion`.
2. Parser finds the **longest noun suffix** that exists in the catalog (`lion`), leftover tokens are adjectives (`giant`, `sleeping`).
3. `lion` has a category path like `living.animal.mammal.predator`.
4. Each path segment **merges** props, hunt, fear, eat, like.
5. Adjectives `apply()` on the resolved def (size, flags). **Sleep is a runtime flag on the entity**, not a wipe of hunt/fear on the def.
6. Spawn costs budget. Ghost preview follows the cursor until click.

### Temperament

Living things have `hunt` / `fear` / `eat` / `like` tag lists. Tags match catalog ids, names, or category prefixes (`living.person`, `role.food`). A cat hunts mouse/bugs. A lion hunts prey and people. A mouse fears predators. **Animals are not scared of Otto by default** — only things that list him (or `living.person`) in `fear`.

When nothing to chase: **roam** (walk, pause, turn, stay near drop point). Predators that get within ~54px of their target **loiter and idle** instead of skating through them (living-living has no collision).

### Physics we want

- Living things **do not tip over**. Infinite inertia, angle locked, face-flip for direction.
- They **walk only when grounded** (or flying / fish in water). Air keeps a bit of momentum; no midair moonwalk.
- Living vs living: **no collision**. Living vs crate/ground: collision. Raycasts for “grounded” must ignore other living bodies or cats stack-stand on each other.
- Water is a **sensor volume** with Archimedes buoyancy from submersion ratio and density. Not a constant rocket to the surface. Swim with W. Water-bed clamp so you don’t fall through the pool floor.
- Jump (W) does **not** add horizontal walk. Air steering is separate from grounded walk.
- Trees must not eat objects (thin trunk, not a huge solid hitbox that deletes on contact).

### Presentation we want

- Otto, cat, lion have **real sprite sheets** (idle / walk; lion also sleep). Same ink-sketch language: cream paper fill, dark walnut outline, magenta-keyed then cleaned.
- Walk cycles must be a **single contiguous stride**, not even-samples across a 6s clip (that hops and moonwalks).
- If a video walk moonwalks, reverse frame order — but only after confirming one clean cycle.
- Sleeping living things use a **lying pose**, not a standing sprite with “zz” slapped on. Lion sleep is the quality bar; idle/walk should match that scale and line quality, not a crunchy upscale of a 58px crop.
- Inspect (magnifying glass) shows inherited flags. Notepad icon opens the summoner under the top-right tools. Right-click: grab, duplicate, delete, sleep/wake.

### Controls (locked in by the player)

| Input | Does |
|---|---|
| A / D, arrows, tap-to-walk | Move |
| W | Jump only (no extra horizontal) |
| E / F | Pick up / drop nearest |
| R | Restart |
| Esc | Pause |
| Notepad icon | Summoner bar |
| Magnifying glass | Inspect mode (click object for flag card) |
| Drag spawned objects | Move them |
| Right-click / long-press | Context menu |

---

## What is currently in the code

Working, on purpose:

- Catalog + adjective parse + category merge (`src/game/catalog.ts`, `flags.ts`).
- Matter.js fixed-step world, Otto platformer, spark collect, gates/buttons, word budget.
- Playground + a few puzzle levels (`levels.ts`).
- Drag-and-drop after spawn; ghost place from notepad.
- Context menu; inspect gated behind the glass; notepad under top-right icons.
- Living upright lock; living-living filter; roam + hunt loiter.
- Sleep as `e.sleeping`; wake restores hunt/fear from the catalog; eating still naps the predator without wiping hunt.
- Water buoyancy (density map, submersion, swim, bed clamp).
- Sprites for Otto, cat, lion (idle/walk), lion sleep, spark, fire. Procedural ink sketches for everything else (`render.ts` `sketch()`).

Fragile / unfinished (read before changing):

- **Lion walk** has been the pain point. Current sheet is 8 consecutive frames from video clean frames 20–27, 256px cells, 8 fps. Even-sampling the whole 6s clip made it hop. Posed 2×2 I2I sheets looked like idle copies. Tiny 128px harvests looked like pixels. Do not “fix” it by generating a brand-new 2×2 pose sheet without looking at the current GIF.
- **Magenta fringes** come from JPEG `#FF00FF` that isn’t pure. Sleep processed with threshold 88. Blink idle frames needed a purple-peel (low G, high R/B) on the silhouette edge. Aggressive flood through cream **deletes the body**.
- **Sleeping adjective must not clear hunt/fear** on the def. That bug made Wake look like it worked (zz gone) while the AI stayed empty.
- Cat walk can still feel off / moonwalk-ish; lion sleep is the art target.
- Most nouns are still **procedural sketches**, not sprites. That’s fine until a noun is a star (Otto, cat, lion).
- No C++ original — this is the web port because the preview is a browser.

---

## File map

| File | Role |
|---|---|
| `src/game/flags.ts` | Bitflags `P.*` and labels for the inspector |
| `src/game/catalog.ts` | Nouns, categories, adjectives, parse, resolve |
| `src/game/engine.ts` | Physics, spawn, AI, water, input, HUD snapshot |
| `src/game/render.ts` | Paper camera, sprite sheets, procedural sketches |
| `src/game/levels.ts` | Playground + puzzles |
| `src/game/audio.ts` | Tiny WebAudio stings |
| `src/components/objectnaut-app.tsx` | HUD, notepad, inspect, context menu, loop |
| `public/sprites/` | Production PNGs the renderer loads |

Production sprite grids and `?v=` cache bumps are documented in `HANDOFF.md`.

---

## How to continue (for the next model)

1. Play the playground. Spawn `lion`, `sleeping lion`, `cat`, `mouse`, `boat`. Watch idle vs walk vs sleep.
2. Do not regenerate lion idle/walk from scratch unless the current sheets are actually broken — last full redraw was rejected.
3. Walk cycles: harvest **one contiguous period** from video (or keep the current 8). Reverse only after a flip-test against move direction.
4. New animals should copy **lion-sleep’s** ink/cream language and cell fill, then idle/walk at the **same on-screen scale**.
5. Runtime state (asleep, on fire, held) lives on `Entity`, not by mutating hunt arrays off the def.
