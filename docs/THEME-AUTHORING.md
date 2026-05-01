# Authoring a Procforge Theme

A theme is a small TypeScript package that registers a palette, a set of primitives, and a set of composers. The generator picks a composer per icon, which in turn picks primitives.

## 1. Bootstrap a package

Create `packages/themes/<your-theme>/` with these files:

`package.json`:

```json
{
  "name": "@procforge/theme-<your-theme>",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": { ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" } },
  "scripts": { "build": "tsup", "test": "vitest run", "typecheck": "tsc --noEmit" },
  "dependencies": { "@procforge/core": "workspace:*" },
  "devDependencies": { "tsup": "^8.3.0", "vitest": "^2.1.0" }
}
```

Mirror `tsconfig.json`, `tsup.config.ts`, and `vitest.config.ts` from any existing theme package.

## 2. Define the palette

```ts
import { definePalette } from '@procforge/core';

const palette = definePalette({
  id: 'my-theme',
  primary:   ['#aa3344', '#cc5566'],   // dominant fills (3-5 colors)
  secondary: ['#22aa44', '#44cc66'],   // supporting fills (3-5 colors)
  accent:    ['#ffcc00', '#ff8800'],   // highlights (2-3 colors)
  neutral:   ['#222222', '#888888', '#eeeeee'],  // strokes + bg (2-4 colors)
});
```

**Color rules:**
- Each role array must be non-empty.
- All values must be `#RRGGBB` hex (validation throws otherwise).
- Aim for 3-5 colors per role; the generator samples uniformly.

## 3. Pick primitives + composers

Procforge ships these in `@procforge/core`:

- **Decoration primitives:** `circle`, `polygon`, `path`, `star` — generic geometric shapes used by the `subject` composer as background flourishes behind a subject.
- **Subject composer:** `subject` — places one of the theme's subject primitives at the centre and adds 0–2 decoration primitives behind it. This is what every Phase 1 starter theme uses.
- **Legacy composers:** `layer`, `mask` — kept exported for expansion-pack themes that want pure abstract output. Phase 1 themes do not register them.

A Phase 1-style theme defines its own **subject primitives** (theme-specific game objects: a sword, a potion bottle, a blaster) and registers only the `subject` composer.

## 4. Define the theme

```ts
import { defineTheme, definePalette, subject, type Theme } from '@procforge/core';
import { swordBlade, potionBottle /* …your 6 subject primitives */ } from './subjects';

export const myTheme: Theme = defineTheme({
  id: 'my-theme',
  displayName: 'My Theme',
  palette,
  primitives: [swordBlade, potionBottle /* …6 total */],   // theme-specific subjects
  composers: [subject],                                    // single composer
  tags: ['weapon', 'fantasy'],
});
```

## 5. Test it

```ts
// tests/index.test.ts
import { describe, it, expect } from 'vitest';
import { generateOne, generateMany } from '@procforge/core';
import { myTheme } from '../src/index';

describe('myTheme', () => {
  it('produces valid SVGs', () => {
    expect(generateOne({ theme: myTheme, seed: 'x', size: 64 }).startsWith('<svg ')).toBe(true);
  });
  it('produces 50 unique icons', () => {
    const items = generateMany({ theme: myTheme, baseSeed: 'b', count: 50, size: 64 });
    const unique = new Set(items.map((i) => i.svg));
    expect(unique.size).toBeGreaterThan(40);
  });
});
```

Run: `pnpm --filter @procforge/theme-<your-theme> test`.

## 6. Wire into the CLI (optional)

To make your theme selectable via `icongen --theme <id>`, add to `packages/cli/package.json` deps and `packages/cli/src/cli.ts` THEMES map. Phase 2 will support `--theme path/to/external-theme` for unbundled themes.

## 7. Write a subject primitive

A subject primitive is `(ctx) => string` returning a single `<g>...</g>` SVG fragment that depicts one game object. Example:

```ts
import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const ring: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = pickColor(rng, palette, 'accent');
  const r = range(rng, size * 0.22, size * 0.3);
  return svgElement(
    'g',
    {},
    svgElement('circle', {
      cx: round2(centerX),
      cy: round2(centerY),
      r: round2(r),
      fill: 'none',
      stroke,
      'stroke-width': strokeWidth * 1.5,
    }),
  );
};
```

**Subject contract** (matches `docs/superpowers/specs/2026-05-01-game-oriented-primitives-design.md` §3.4):

- Returns a single `<g>` wrapping all sub-elements.
- Coordinates stay inside `[size * 0.1, size * 0.9]`.
- Stroke colour from `palette.neutral`. Body fill from `palette.primary` ∪ `palette.accent`.
- **Stroke-only silhouette exception:** if the primitive's visual identity is a line drawing (HUD reticle, antenna mast, wire ring), every sub-element may use `fill="none"`. Compensate by drawing strokes at ≥ 1.2× the base `strokeWidth` so the silhouette still reads as solid.
- `stroke-linejoin="round"` and `stroke-linecap="round"` where applicable.
- Use `round2(n)` from `@procforge/core` for emitted coordinate values.
- Internal jitter (proportions, rotation, segment counts) consumes RNG so different seeds produce visibly different output. Two identical seeds must produce byte-identical output.

Add it to your theme's `primitives` array. Aim for 6 subjects per theme — enough variety, balanced authoring effort.
