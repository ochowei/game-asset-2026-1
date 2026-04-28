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

- Primitives: `circle`, `polygon`, `path`, `star`
- Composers: `layer`, `mask`

Most themes can use all of them. To bias toward a style, omit some.

## 4. Define the theme

```ts
import {
  defineTheme,
  circle,
  polygon,
  path,
  star,
  layer,
  mask,
  type Theme,
} from '@procforge/core';

export const myTheme: Theme = defineTheme({
  id: 'my-theme',
  displayName: 'My Theme',
  palette,
  primitives: [circle, polygon, path, star],
  composers: [layer, mask],
  tags: ['weapon', 'fantasy'],   // game-relevant search keywords
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

## 7. Write a custom primitive (advanced)

A primitive is `(ctx) => string` returning one SVG element. Example:

```ts
import type { PrimitiveFn } from '@procforge/core';
import { svgElement } from '@procforge/core';

export const ring: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const r = size * 0.3;
  return svgElement('circle', {
    cx: centerX,
    cy: centerY,
    r,
    fill: 'none',
    stroke: palette.accent[0]!,
    'stroke-width': strokeWidth * 2,
  });
};
```

Add it to your theme's `primitives` array.
