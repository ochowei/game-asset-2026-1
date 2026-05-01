# Game-Oriented Theme Primitives — Design Spec

**Status:** Draft (awaiting user review)
**Date:** 2026-05-01
**Scope:** Phase 1 implementation gap fix
**Predecessor spec:** [2026-04-25-procforge-icons-design.md](./2026-04-25-procforge-icons-design.md)

---

## 1. Why this spec exists

The Phase 1 spec ([§4.1](./2026-04-25-procforge-icons-design.md), [§4.4](./2026-04-25-procforge-icons-design.md)) committed to:

- "Geometric outlined SVG. Reference anchors: Lucide / Phosphor / Tabler icons, but with procedural variation and **game-oriented subjects (weapons, potions, creatures, UI)**."
- A `Theme` shape where `primitives` are "**theme-specific** shape building blocks."
- Per-theme subject lists: medieval = weapons/potions/shields/scrolls; sci-fi = guns/chips/energy/HUD; cozy = tools/food/seeds/animal-heads; roguelike = generic RPG inventory.

The Phase 1 implementation shipped the architecture (palette, theme registration, deterministic RNG, composer/primitive plug-in shape, CLI, web preview, pack pipeline) **but never implemented theme-specific subjects**. All four themes share `core`'s generic `circle / polygon / path / star` primitives. The current `starter-pack` therefore produces abstract layered shapes, not game-recognisable icons.

This is a Phase 1 implementation gap, not a new feature. This spec closes the gap.

## 2. Goals & non-goals

### Goals

- Each theme produces icons whose subject is identifiable at 64×64 px (e.g., "that's a sword", "that's a potion").
- Preserve every existing architectural invariant: deterministic SVG output for a given `(theme.id, seed)`; pure core (no Node-only APIs); plug-in theme shape; SVG-string output.
- Maintain the Lucide / Phosphor / Tabler visual register: outlined geometry, ~10–15% stroke weight relative to icon size, generous padding, single dominant subject.
- Stay within Phase 1 scope — no expansion-pack scaffolding, no archetype DSL, no semantic tagging beyond what the existing `Theme.tags` field already holds.

### Non-goals

- Realistic illustration. Subjects are stylised geometric silhouettes, not detailed art.
- Backwards compatibility with the abstract output produced by the current implementation. A `v1.0.0` git tag exists locally, but the itch listing has not gone live and no buyer has yet generated icons against the current baseline; the determinism invariant resumes from a new baseline once this lands.
- New themes. Phase 2 expansion packs remain out of scope.
- Animation, multi-frame variants, or sprite-sheet output.

## 3. Architecture

### 3.1 Two-layer primitive model

Core continues to expose `circle`, `polygon`, `path`, `star` — these are demoted in role from "the icon" to "decoration". Each theme additionally owns a **subject primitives** module: 6 primitive functions per theme, each producing one identifiable game object silhouette.

```
core (unchanged structure)
├─ primitives/        ← circle, polygon, path, star          (decoration role)
├─ composers/         ← layer, mask, + new `subject`          (composition)
└─ helpers            ← seed, svg-emitter, palette, types

themes/medieval-fantasy
├─ palette            (existing)
├─ subjects/          (new) ← swordBlade, shieldFrame, potionBottle, scrollRoll, axeHead, gemstone
└─ index.ts           ← register palette + subjects + composers

themes/sci-fi
├─ palette
├─ subjects/          (new) ← blasterBody, chipBoard, energyOrb, hudFrame, cogGear, antennaArray
└─ index.ts

themes/cozy-farm
├─ palette
├─ subjects/          (new) ← hoeTool, fruit, seedPouch, animalHead, wateringCan, wheatStalk
└─ index.ts

themes/roguelike-inventory
├─ palette
├─ subjects/          (new) ← coin, gem, key, bookCover, ringBand, dagger
└─ index.ts
```

### 3.2 New composer: `subject`

A new composer named `subject` lives in `core/src/composers/subject.ts`. Every Phase 1 theme uses **only** this composer — `layer` and `mask` remain available in core (kept exported for Phase 2 expansion packs and end-user extension) but are not registered in any Phase 1 theme's `composers` list.

The `subject` composer's algorithm:

1. Pick exactly **1 subject primitive** from the theme's subject list, place at canvas centre.
2. Decide decoration count: 0–2, weighted toward 1 (distribution: 25% / 50% / 25%).
3. For each decoration, pick from core's `circle | polygon | path | star`, place at a constrained off-centre offset (`±15–35%` of size from centre), behind the subject (decoration `<g>` is emitted before subject `<g>`).
4. Decorations get muted palette roles (neutral or secondary), subject gets primary or accent — keeps subject visually dominant.

The composer signature stays compatible with the existing `ComposerFn` type. The only API extension is that `Theme.primitives` now means "subject primitives" (theme-owned) and the composer reaches into core's decoration set internally.

### 3.3 Theme module changes

Existing `Theme.primitives` field is **repurposed** (not renamed) to hold the theme's subject primitives. Decorations are sourced inside the `subject` composer from a separate import, not from `Theme.primitives`. This keeps the `Theme` interface byte-identical to what Phase 1 spec §4.4 defined.

Each theme's `index.ts` becomes:

```ts
import { defineTheme, definePalette } from '@procforge/core';
import { subject } from '@procforge/core';
import { swordBlade, shieldFrame, potionBottle, scrollRoll, axeHead, gemstone } from './subjects';

export const medievalFantasy: Theme = defineTheme({
  id: 'medieval-fantasy',
  displayName: 'Medieval Fantasy',
  palette,
  primitives: [swordBlade, shieldFrame, potionBottle, scrollRoll, axeHead, gemstone],
  composers: [subject],
  tags: ['weapon', 'potion', 'shield', 'scroll', 'rpg', 'fantasy'],
});
```

### 3.4 Subject primitive contract

Each subject primitive is a pure function with the existing `PrimitiveFn` signature ([packages/core/src/primitives/types.ts](../../../packages/core/src/primitives/types.ts)):

```ts
type PrimitiveFn = (ctx: PrimitiveCtx) => string;
type PrimitiveCtx = {
  rng: Rng;
  palette: Palette;
  size: number;
  centerX: number;
  centerY: number;
  strokeWidth: number;
};
```

Returns an SVG fragment string. Internal jitter (proportions, rotation, segment counts) consumes RNG so two seeds produce visibly different swords. Constraints:

- All geometry stays inside `[size * 0.1, size * 0.9]` bounding box (10% padding).
- Stroke colour from `palette.neutral`. Fill from `palette.primary` ∪ `palette.accent`. No `'none'` fill on the subject — it must read as solid.
- Stroke-linejoin `round`, stroke-linecap `round` to match Lucide register.
- Final fragment is a single `<g>` element wrapping all sub-elements.

### 3.5 The 24 subject primitives

Each is implemented as a single `.ts` file in the theme's `subjects/` directory, ~30–60 lines each (matching the size of existing `core/src/primitives/star.ts`). Construction approach per theme:

**Medieval Fantasy** — `swordBlade` (vertical blade `<polygon>` + `<rect>` crossguard + grip line), `shieldFrame` (heater-shape `<path>` + inner border path), `potionBottle` (bowl `<ellipse>` or rounded `<path>` + neck `<rect>` + cork `<rect>`), `scrollRoll` (rolled body `<path>` + two end caps `<ellipse>`), `axeHead` (curved cleaver `<path>` + haft `<line>`), `gemstone` (faceted `<polygon>` with internal facet lines).

**Sci-Fi** — `blasterBody` (chunky pistol silhouette `<path>` + barrel `<rect>` + grip `<rect>`), `chipBoard` (square `<rect>` + 4-side pin `<line>` strokes + centre dot), `energyOrb` (concentric `<circle>` + radial `<line>` rays), `hudFrame` (corner-bracket `<path>` × 4 forming reticle), `cogGear` (gear teeth `<polygon>` with N points + centre hole `<circle>`), `antennaArray` (vertical mast `<line>` + 3–5 horizontal cross-bars `<line>` of decreasing length).

**Cozy Farm** — `hoeTool` (handle `<line>` + angled blade `<polygon>`), `fruit` (round body `<circle>` + stem `<line>` + leaf `<path>`), `seedPouch` (rounded sack `<path>` + drawstring `<line>` × 2), `animalHead` (round face `<circle>` + two ear `<polygon>` + eye/snout dots), `wateringCan` (body `<path>` + spout `<polygon>` + handle arc `<path>`), `wheatStalk` (vertical stalk `<line>` + 4–6 grain `<ellipse>`).

**Roguelike** — `coin` (`<circle>` outer + `<circle>` inner + central glyph `<polygon>`), `gem` (multi-facet `<polygon>` + facet lines `<line>`), `key` (bow `<circle>` + shaft `<line>` + bit teeth `<rect>` × 2), `bookCover` (`<rect>` + spine `<line>` + clasp `<rect>`), `ringBand` (`<circle>` ring + `<polygon>` setting + centre stone `<circle>`), `dagger` (small blade `<polygon>` + crossguard `<rect>` + pommel `<circle>`).

The exact SVG emitted per primitive is implementation detail decided during the implementation plan — the spec fixes only the inventory (24 primitives, listed above) and the contract (§3.4).

### 3.6 Determinism

Every subject primitive consumes RNG in a fixed order (proportions → rotation → palette pick), so `(theme.id, seed)` continues to produce byte-identical SVG across runs.

The new baseline differs from the old; the existing `starter-pack` produced before this change is discarded. Subsequent runs from the new baseline are deterministic per the existing invariant. No new invariant is introduced; the old invariant resumes from the post-implementation commit.

## 4. Testing

Per existing convention ([docs/ARCHITECTURE.md §Testing strategy](../../../docs/ARCHITECTURE.md)):

- **Per subject primitive:** structural assertions — root is `<g>`, contains expected child tags, all coordinates inside `[size*0.1, size*0.9]`, stroke colour from `palette.neutral`, fill non-none, two different seeds produce different SVG strings, identical seed produces byte-identical SVG.
- **`subject` composer:** structural assertions — emits exactly 1 subject `<g>`, 0–2 decoration elements before the subject `<g>` in DOM order, decoration count distribution roughly matches 25/50/25 across 1000 seeds.
- **Per theme:** generate 50 icons without throwing; produce ≥ 50 unique SVG strings (tests duplicate detection).
- **End-to-end:** existing CLI integration test continues to pass. `pnpm produce-pack` produces 200 SVGs + 1000 PNGs; `pnpm prelaunch-check --ci` continues to pass.

## 5. Migration & rollout

1. Implement subject primitives + new composer + theme wiring + tests.
2. Re-run `pnpm produce-pack`; visually QA via `pnpm qa-sample`.
3. Commit the 24 new primitive files + composer + theme rewires + regenerated `starter-pack/` (if tracked) + a fresh determinism note in [ARCHITECTURE.md §Determinism](../../../docs/ARCHITECTURE.md).
4. Update [docs/THEME-AUTHORING.md](../../../docs/THEME-AUTHORING.md) to reflect the two-layer model: theme authors now write subject primitives; decoration primitives stay in core.
5. `v1.0.0` is already tagged locally but no public release has been published to itch. Lands as `v1.1.0` (or `v1.0.1` if treating purely as bug-fix scope — implementation plan picks). The release notes must explicitly state that the determinism baseline reset: any seed used against pre-`v1.1.0` code will produce different SVG against `v1.1.0`+. This is the only externally-visible change.

## 6. Open questions / explicit decisions

- **Should `layer` / `mask` composers be removed from core?** No — kept exported for Phase 2 expansion packs and external theme authors. Only Phase 1 starter themes drop them from their `composers` list.
- **Should the `Theme` type rename `primitives` to `subjects`?** No — keeps interface identical to what's documented in Phase 1 spec §4.4 and avoids churn in `@procforge/core`'s public type. The semantic shift is documented.
- **Does this break existing tests?** Yes — current per-primitive tests in `packages/core/tests/primitives/` continue to pass (the primitive code is unchanged), but per-theme generation tests that asserted on output structure may need updating to reflect the new composer's `<g>` structure. Implementation plan handles each.

---

## Appendix A — Summary of decisions captured during brainstorming

| Question | Decision |
|---|---|
| Recognition target | Concrete game items (sword, potion, etc.) |
| Theme-specific primitives? | Yes — but two-layer (theme owns subjects, core owns decorations) |
| Primitives per theme | 6 |
| Composition rule | 1 centred subject + 0–2 background decorations |
| Determinism handling | Reset baseline; v1 was never publicly released |
