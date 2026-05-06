# Procforge Icons — Architecture

## Package map

```
@procforge/core
  └─ pure SVG-emitting library; no IO, no DOM, no Node-specific APIs
@procforge/theme-*
  └─ thin packages that register a palette + theme metadata; depend on core
@procforge/cli
  └─ Node CLI for batch generation, SVG→PNG rasterising, zip packaging
@procforge/web-preview
  └─ Vite SPA that runs core in the browser; itch HTML5 embeddable
```

## Data flow

```
config (theme + seed + count + size)
        │
        ▼
makeRng(theme.id + seed)            ← deterministic per-icon RNG
        │
        ▼
pick(rng, theme.composers)          ← one composer per icon
        │
        ▼
composer(ctx { rng, palette, size, primitives })
   └─ pick + invoke primitives, combine via SVG groups/masks
        │
        ▼
SVG body string
        │
        ▼
svgDocument({ size, body })          ← wraps in <svg viewBox …>
        │
        ▼
Either:
   - returned as string (core API)
   - written to disk + rasterised to PNG (CLI)
   - injected into DOM + downloadable (web-preview)
```

## Determinism

`(theme.id, seed)` determines:
1. The RNG sequence (`makeRng(theme.id + ":" + seed)`).
2. Which composer is selected.
3. Which primitives are sampled inside the composer.
4. All numeric jitter inside primitives.

Therefore the SVG output is byte-identical across runs given the same theme module. This guarantee breaks when a theme's primitives, composers, or palette change.

## Authoring vs runtime split (v1.4.0)

For themes that use the Path B authoring model (medieval-fantasy as of v1.4.0), the generation pipeline has two distinct phases separated by a commit boundary:

**Authoring time** (run by the theme author, one-time per base):
- LLM generates candidate SVG bases.
- Author curates per `docs/AI-AUTHORING.md`.
- Curated SVGs committed to `packages/themes/<theme>/src/subjects/_assets/`.
- `pnpm build:bases` (via `scripts/build-bases.ts`) converts each `_assets/*.svg` to a TypeScript module exporting the SVG body string array.
- Both the SVGs and the generated `*.bases.ts` modules are committed.

**Runtime** (run in the buyer's process, every `generateOne` call):
- Standard seeded RNG flow as before.
- The subject primitive imports its `*Bases` array, calls `applyBaseVariation(rng, bases, palette, size, opts)`.
- `applyBaseVariation`: picks a base via RNG, replaces `{{role}}` tokens with palette colours via RNG-driven `pickColor`, applies a light `<g transform="...">` (rotate ±8°, uniform scale 0.95–1.05, optional mirror), returns the SVG fragment.
- No file I/O, no network, no AI. Determinism contract `(theme, seed) → byte-identical SVG` preserved.

The only thing that crosses the commit boundary from authoring to runtime is the committed SVG content. AI involvement is bounded to the authoring side.

For themes still on the Path A hand-coded model (sci-fi, cozy-farm, roguelike-inventory as of v1.4.0), the authoring/runtime distinction collapses: the engineer writes the geometry directly in the primitive function.

## Why TypeScript and not Python/Rust

- The generator must run in the browser (for the itch HTML5 embed) and in Node (for the CLI). One language, one codebase.
- Buyers reading the source are mostly game devs comfortable with JS.
- SVG is a string-manipulation problem and TS handles it well.

## Why a monorepo

- Core + themes evolve in lock-step; one PR can change a primitive and a theme that depends on it.
- Phase 2 expansion packs ship as new packages without touching core.
- pnpm workspaces give us instant cross-package linking with no publish step.

## Why hand-written SVG strings (not d3-ish builder)

- Output size: a manually-written `<circle .../>` is shorter than a builder-emitted equivalent.
- Buyer-readability: the source code looks like the SVG, which is what buyers wanting to fork expect.
- Zero runtime cost: no DOM, no virtual DOM, no parser.

## Testing strategy

- **Primitives:** structural assertions on emitted SVG (correct tag, attributes present, points in bounds) + determinism.
- **Composers:** structural assertions on group / mask wrapping + child count.
- **Theme:** generates N icons without throwing + uniqueness.
- **CLI:** ephemeral temp directory + assertions on file structure + PNG magic-number checks.
- **Web preview:** dev-server visual smoke (manual). Headless browser tests are deferred to Phase 2.

## Phase 2 enabler hooks

- `Theme` is plug-in shape: new themes ship as packages without touching core.
- `CLI THEMES` map is the only place a theme is registered for the bundled CLI; external themes load via dynamic import in Phase 2.
- `manifest.json` schema is stable; expansion packs reuse it.

## Determinism baseline

The deterministic-output guarantee is byte-stable from a baseline. Adding or changing primitives, composers, or palette entries in any theme breaks the byte-identity for that theme — `(theme.id, seed)` after the change will produce a different SVG than before.

The current baseline is **v1.3.0** (Lucide-aligned base shapes — Path A from `docs/FUTURE-WORK.md`). Each of the 24 subject primitives was retuned so its geometry matches the visual register of a Lucide reference icon, while preserving the v1.2.0 affordance hints, primitive contract, and RNG consumption order. The v1.2.0 baseline (recognisability pass — fixed affordance hints, boosted subject strokes, narrowed RNG jitter, tightened decoration distribution) is superseded; seeds against v1.2.0 produce different SVG against v1.3.0+. Earlier baselines (v1.1.0 theme-specific subjects, pre-v1.1.0 abstract output) are also not regenerable from the same seeds.

**v1.4.0 baseline reset (medieval-fantasy only):** medieval-fantasy was converted to Path B (AI-designed bases + procedural variation) in v1.4.0. Its byte output for any given seed differs from v1.3.x. The other three themes (sci-fi, cozy-farm, roguelike-inventory) remain on Path A with their v1.3.0 baselines unchanged — seeds against those three themes produce identical SVG before and after v1.4.0.

Future theme-content changes (palette tweaks, new primitives) reset the baseline again. Document any baseline reset in CHANGELOG / release notes so buyers who depend on specific seeds are aware.
