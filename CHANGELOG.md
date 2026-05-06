# Changelog

## v1.4.0 — 2026-05-06

### Brand pillar restructure

- Removed: "No AI" pillar.
- Renamed: "100% Procedural" → "Procedural Variation".
- Added: "Deterministic Runtime" — `(theme, seed)` produces byte-identical SVG, no API calls, no network.
- Three pillars going forward: **Deterministic Runtime / Procedural Variation / Open-source Generator**.

### Architecture: Path B for medieval-fantasy

- medieval-fantasy theme converted from hand-coded primitives to file-based SVG bases varied at runtime by procgen.
- 30 new base SVGs (5 per subject × 6 subjects) committed under `packages/themes/medieval-fantasy/src/subjects/_assets/`. Bases are drawn in Lucide-style line-icon aesthetic — silhouette-distinct per subject, palette-substituted at runtime.
- New core helper `applyBaseVariation` (`@procforge/core`).
- New build step `pnpm build:bases` (`scripts/build-bases.ts`) — runs as part of `pnpm build`.
- New manual curation tool `scripts/qa-base-preview.ts`.
- 6 medieval-fantasy primitive `.ts` files reduced from ~50 LOC each to ~10 LOC; tests rewritten to assert base presence + palette substitution + transform bounds.

### Other 3 themes

- sci-fi, cozy-farm, roguelike-inventory unchanged. They remain on the v1.3.1 hand-coded primitive model. Determinism baselines for those themes are unchanged from v1.3.1.

### Determinism note

medieval-fantasy SVG output is byte-different from v1.3.1 for the same seed, by design (the bases are entirely new shapes). The determinism contract `(theme, seed) → byte-identical` is preserved going forward from v1.4.0. Downstream consumers who pinned specific medieval-fantasy seed outputs will need to refresh.

### Documentation

- New: `docs/BASE-AUTHORING.md` — authoring pipeline manual.
- New: `docs/superpowers/specs/2026-05-06-path-b-v1.4.0-design.md` — design spec.
- New: `docs/superpowers/plans/2026-05-06-path-b-v1.4.0.md` — implementation plan.
- Updated: `docs/THEME-AUTHORING.md`, `docs/ARCHITECTURE.md`, `docs/FUTURE-WORK.md`, `README.md`.

## v1.3.1 — 2026-05-05 (post-release visual + metadata fixes)

### Breaking — determinism baseline reset (composer-wide)

The `(theme.id, seed)` byte-stable invariant resumes from a new baseline at v1.3.1. The composer's decoration-count thresholds change (75/20/5), which alters how many RNG calls happen before each subject is picked. Most seeds therefore produce different SVG output to v1.3.0. Three primitives also have proportion changes (`gemstone`, `potion-bottle`, `chip-board`). Buyers pinning seeds need to regenerate.

### Why

Post-v1.3.0 visual review (see `docs/FUTURE-WORK.md` Path A acceptance criteria) flagged three primitives that didn't survive non-author identification:

- **`gemstone`** — facet chord endpoints sat inside the polygon body and antialiased into the fill at 64 px, so the gem read as a flat rune tile rather than a cut diamond.
- **`potion-bottle`** — the post-Path-A neck range (0.13–0.16 of size) was too short relative to the body, so the body→neck→cork stack collapsed into "ball with stopper" rather than a flask silhouette.
- **`chip-board`** — only one jitter site (`half`, ±10 % range) and a hard-locked square aspect ratio made multiple seeds visually near-identical, collapsing the procgen variation value for this primitive.

### Changes

- **`gemstone`**: extended facet chord endpoints from `sideX*0.6` to the actual side vertices, added a third "girdle" line between the two side vertices, and bumped facet stroke from `0.7×` to `0.9×` so the seams survive antialias at 64 px.
- **`potion-bottle`**: lengthened `neckH` from `0.13–0.16` to `0.18–0.22` of size and bumped `bodyRY` from `0.18–0.22` to `0.20–0.24` so the flask register reads at a glance.
- **`chip-board`**: widened `half` (now `halfX`) range from `0.20–0.24` to `0.18–0.26`, widened `pinLen` from `0.06–0.08` to `0.05–0.09`, and added `±15 %` aspect-ratio jitter (`halfY = halfX * range(rng, 0.85, 1.15)`) so chips can read as either square IC or rectangular DIP packages. Pin count stays locked at 3-per-side.
- **Subject composer decoration distribution**: shifted from `50/40/10` (0/1/2 decorations) to **`75/20/5`**. The earlier 50% incidence read as visual noise competing with the subject. 75% subject-only icons keeps procgen variation while making clean subject the common case.
- **Theme-authored decoration motifs**: the subject composer no longer pulls from a hardcoded `[circle, polygon, path, star]` list inside `@procforge/core`. `Theme` now requires a `decorations: PrimitiveFn[]` field, and each theme ships 3 thematic motifs that the composer randomly picks from. The 25 % of icons that still carry a decoration now read as theme-recognisable accents (fleur, dot-grid, leaf-sprig, rune-cross) rather than semantically blank shapes. New motifs:
  - **medieval-fantasy**: `fleur-mark` (3-circle clover), `bead-ring` (6-dot beaded ring), `corner-l` (perpendicular L)
  - **sci-fi**: `dot-grid` (3×3 dot matrix), `bracket-frame` (HUD corner bracket), `scanline-bars` (3 horizontal lines)
  - **cozy-farm**: `leaf-sprig` (rotated ellipse + stem), `seed-cluster` (4 seeds), `flower-mini` (5-circle flower)
  - **roguelike-inventory**: `dot-pip` (3 horizontal dots), `rune-cross` (centred + cross), `ring-mini` (open circle outline)
- **Composer + Theme contract change** (breaking for any external theme code, n/a here): `defineTheme` now requires `decorations`; throws `decorations empty` if the array is empty. `ComposerContext` gains a `decorations: readonly PrimitiveFn[]` field. The subject composer reads from `ctx.decorations`; if empty, decoration count is forced to 0.
- **Metadata fix**: `scripts/produce-starter-pack.ts` no longer hardcodes `version: '1.1.0'` in the emitted `manifest.json`. Single `PACK_VERSION` constant now drives both the manifest version and the in-zip README header.
- **`docs/LAUNCH-RUNBOOK.md`**: refreshed to reflect that v1.2.0 and v1.3.0 are already tagged and released; the D+28 recency-tag slot now points at v1.4.

### Spec relationship

This is a v1.3.0 implementation refinement, not a new spec. Architecture, primitive contract, 24-primitive inventory, composer, palette, and CLI surface are all unchanged. Only proportion constants in three primitive bodies (and one new RNG site in chip-board for the aspect ratio) change.

## v1.3.0 — 2026-05-04 (Lucide-aligned base shapes — Path A)

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
