# Changelog

## v1.3.0 — 2026-05-XX (Lucide-aligned base shapes — Path A)

### Breaking — determinism baseline reset

The `(theme.id, seed)` byte-stable invariant resumes from a new baseline at v1.3.0. Seeds used against v1.2.0 produce different SVG output against v1.3.0+. Buyers pinning specific seeds need to regenerate.

### Why

v1.2.0 lifted recognisability from ~50–60% to ~75–85% by fixing affordance hints and tightening jitter. The remaining gap is primarily about visual *register* — the engineer-authored geometry didn't match the canonical "icon set" feel that buyers expect from packs in this market. Path A (per `docs/FUTURE-WORK.md`) closes that gap by retuning each primitive's base shape to match its corresponding Lucide / Phosphor reference, while preserving the procgen architecture, RNG order, primitive vocabulary, and v1.2.0 affordance hints.

### Changes

All 24 subject primitives across the 4 themes were retuned. The vast majority are pure proportion adjustments (no structural changes). Two structural shifts:

- **`medieval-fantasy/gemstone`** — replaced the regular hexagon + radial spokes with a 4-vertex cut-diamond shape + table-to-girdle facet chords. The hex+spokes silhouette read more like a wheel; the new shape reads as a cut gem at a glance.
- **`medieval-fantasy/sword-blade`** — corrected the grip-line semantic so the grip is always visible (was sometimes 1 px tall under the new long-blade proportions).

Per-theme summary (full per-primitive details in PR #22 / #23 / #24 / this PR):

- **medieval-fantasy** — sword/shield/potion/scroll/axe/gemstone aligned to lucide:sword, :shield, :flask-round, :scroll, :axe, :gem
- **sci-fi** — blaster/chip/orb/hud/cog/antenna aligned to functional-parts register; lucide:cpu, :sun, :scan, :cog, :radio-tower
- **cozy-farm** — hoe/fruit/pouch/animal/can/wheat aligned to lucide:shovel, :apple, :cat, :wheat
- **roguelike-inventory** — coin/ring/gem/key/dagger/book aligned to lucide:circle-dot, :diamond, :key, :sword, :book

### Spec relationship

This is a v1.2.0 implementation refinement, not a new spec. The architecture, primitive contract, 24-primitive inventory, and v1.2.0 affordance hints (cog 8 teeth, chip 12 pins, orb 8 rays, antenna 4 bars, wheat 5 grains, coin 5-pt star, gemstone 6 sides) are all preserved. Only RNG-consumed proportion constants change.

### Path B (deferred)

The hand-designed-base path remains documented in `docs/FUTURE-WORK.md` and is not started by v1.3.0. Path A's tuned proportions can serve as the first draft for any future Path B base SVGs.

## v1.2.0 — 2026-05-XX (recognisability pass)

### Breaking — determinism baseline reset

The `(theme.id, seed)` byte-stable invariant resumes from a new baseline at v1.2.0. Seeds used against v1.1.0 produce different SVG output against v1.2.0+. Buyers pinning specific seeds need to regenerate.

### Why

The v1.1.0 subject primitives shipped on the right architecture but several pairs of subjects (coin/gem/ring, energy-orb/coin/cog) were visually too similar at 64×64 — buyers reported that a meaningful fraction of icons in the 200-pack were ambiguous about what game object they represented. v1.2.0 closes that gap without changing the architecture: same composer, same primitive contract, tighter visuals.

### Changes

- **Subject composer** (`@procforge/core`): decoration-count distribution shifts from 25/50/25 to **50/40/10** (0/1/2 decorations). Half the icons are now subject-only and only 10% carry the maximum two decorations — significantly less visual noise competing with the subject.
- **All 24 subject primitives** received a three-part recognisability pass:
  1. **Affordance hints fixed** — elements that signal what the icon *is* are no longer subject to RNG cancellation. Coin always has a 5-pointed star centre, gemstone is always a hexagon, gem always has 4 radial facet lines, chip always has 12 pins (3 per side), cog always has 8 teeth, energy-orb always has 8 rays, antenna always has 4 cross-bars, wheat always has 5 grains, etc.
  2. **Subject stroke 1.4× boost** — the dominant body element of each subject uses a thicker stroke than decorations, so subject vs decoration is unambiguous at small sizes.
  3. **Jitter ranges narrowed** — internal proportion variation tightened so RNG cannot produce degenerate silhouettes (a sword with 20%-height blade, an axe with vestigial head).
- **Dagger** (`roguelike-inventory`): added the missing grip line connecting guard to pommel — the pommel was visually detached in v1.1.0 and the silhouette didn't read as a dagger.
- **Ring band** (`roguelike-inventory`): stone setting enlarged from r ≈ 0.04·size to r ≈ 0.06·size so the "ring with jewel" silhouette stays visible at 64px.

### Spec relationship

This is a v1.1.0 implementation refinement, not a new spec. The architecture, primitive contract, and 24-primitive inventory from `docs/superpowers/specs/2026-05-01-game-oriented-primitives-design.md` are unchanged. Only RNG consumption and stroke-width constants change inside primitive bodies.

## v1.1.0 — 2026-05-01

### Breaking — determinism baseline reset

The `(theme.id, seed)` byte-stable invariant resumes from a new baseline at v1.1.0. Seeds used against v1.0.0 produce different SVG output against v1.1.0+. Buyers pinning specific seeds need to regenerate.

### Features

- Each theme now ships 6 game-oriented subject primitives (24 total) instead of generic shape collages.
  - **medieval-fantasy:** sword, shield, potion, scroll, axe, gemstone
  - **sci-fi:** blaster, chip, energy orb, HUD reticle, cog, antenna
  - **cozy-farm:** hoe, fruit, seed pouch, animal head, watering can, wheat
  - **roguelike-inventory:** coin, gem, key, book, ring, dagger
- New `subject` composer in `@procforge/core` places one centred subject + 0–2 background decorations.
- New `round2(n)` helper exported from `@procforge/core`.

### Spec

- §3.4 contract updated with stroke-only silhouette carve-out (HUD reticles, antennas).

See `docs/superpowers/specs/2026-05-01-game-oriented-primitives-design.md` for full design rationale.

## v1.0.0 — 2026-04-28

Initial release: 200 procedural game icons, 4 themes, MIT-licensed generator.
