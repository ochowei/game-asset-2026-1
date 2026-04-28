# Procforge Icons — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Procforge Icons procedural icon generator (TypeScript monorepo, CLI + browser preview), produce a 200-icon starter pack, and prepare itch listing text content for v1.0.0 launch.

**Architecture:** pnpm monorepo. `@procforge/core` is a pure SVG-emitting library (no IO). Themes are plug-in packages that register primitives, palette, and composers. `@procforge/cli` provides batch generation, SVG→PNG rasterising, and zip packaging. `@procforge/web-preview` is a Vite SPA that loads the same core in the browser for itch HTML5 embedding.

**Tech Stack:** TypeScript, pnpm workspaces, Vitest, tsup (CLI/library builds), Vite (web preview), seedrandom (deterministic RNG), resvg-js (SVG→PNG), JSZip (packaging), Node ≥ 22.

**Out of scope (for this plan):**
- Cover image / demo GIF / screenshot production (manual design work, separate runbook).
- Launch-week GTM execution (operational runbook).
- Phase 2 themed expansion packs (separate spec + plan in M3).

**Reference spec:** `docs/superpowers/specs/2026-04-25-procforge-icons-design.md`

---

## File Structure (target end state)

```
package.json                              # workspace root
pnpm-workspace.yaml
tsconfig.base.json
.gitignore
.editorconfig
.prettierrc
eslint.config.js
.github/workflows/ci.yml
README.md                                  # public face

packages/
  core/
    package.json
    tsconfig.json
    vitest.config.ts
    tsup.config.ts
    src/
      index.ts                             # public API barrel
      seed.ts                              # RNG + helpers
      palette.ts                           # palette types + helpers
      svg-emitter.ts                       # element + document emitters
      primitives/
        types.ts
        circle.ts
        polygon.ts
        path.ts
        star.ts
        index.ts
      composers/
        types.ts
        layer.ts
        mask.ts
        index.ts
      theme.ts                             # Theme interface + registry
      generator.ts                         # config → SVG strings
    tests/
      seed.test.ts
      palette.test.ts
      svg-emitter.test.ts
      primitives/circle.test.ts
      primitives/polygon.test.ts
      primitives/path.test.ts
      primitives/star.test.ts
      composers/layer.test.ts
      composers/mask.test.ts
      generator.test.ts

  themes/
    medieval-fantasy/
      package.json
      tsconfig.json
      src/index.ts
      tests/index.test.ts
    sci-fi/{...same structure...}
    cozy-farm/{...same structure...}
    roguelike-inventory/{...same structure...}

  cli/
    package.json
    tsconfig.json
    tsup.config.ts
    bin/icongen
    src/
      cli.ts
      render.ts                            # SVG → PNG
      pack.ts                              # zip
      generate.ts                          # orchestrate batch
    tests/
      render.test.ts
      pack.test.ts
      generate.test.ts

  web-preview/
    package.json
    tsconfig.json
    vite.config.ts
    index.html
    src/
      main.ts
      controls.ts
      gallery.ts
      styles.css

scripts/
  produce-starter-pack.ts                 # end-to-end pack production
  visual-qa-sample.ts                     # sample N icons per theme

starter-pack/                              # generated artefact (gitignored except README)
  README.md
  LICENSE
  manifest.json
  index.html
  svg/{theme}/{seed}.svg
  png/{16,32,64,128,256}/{theme}/{seed}.png

itch-page/
  description.md
  tags.md
  devlog-templates/
    01-launch.md
    02-typescript.md
    03-community-themes.md
    04-phase2-teaser.md

docs/
  USAGE.md
  THEME-AUTHORING.md
  ARCHITECTURE.md
```

---

## Task Index

| # | Task | Section |
|---|---|---|
| 1 | pnpm workspace + lint/format/types config | Foundation |
| 2 | CI workflow | Foundation |
| 3 | `@procforge/core` package skeleton | Foundation |
| 4 | `seed` module | Core |
| 5 | `palette` module | Core |
| 6 | `svg-emitter` module | Core |
| 7 | Primitive types + base | Core |
| 8 | `circle` primitive | Core |
| 9 | `polygon` primitive | Core |
| 10 | `path` primitive | Core |
| 11 | `star` primitive | Core |
| 12 | Composer types | Core |
| 13 | `layer` composer | Core |
| 14 | `mask` composer | Core |
| 15 | `Theme` interface + registry | Core |
| 16 | `generator` entry point | Core |
| 17 | `medieval-fantasy` theme package | Theme |
| 18 | `medieval-fantasy` theme implementation | Theme |
| 19 | First end-to-end smoke test (50 medieval icons → SVG) | Theme |
| 20 | `@procforge/cli` package skeleton | CLI |
| 21 | `render` (SVG → PNG via resvg-js) | CLI |
| 22 | `pack` (JSZip) | CLI |
| 23 | `generate` orchestrator + CLI entry | CLI |
| 24 | CLI integration test (50 icons → zip) | CLI |
| 25 | `sci-fi` theme | Theme |
| 26 | `cozy-farm` theme | Theme |
| 27 | `roguelike-inventory` theme | Theme |
| 28 | `@procforge/web-preview` Vite scaffolding | Web |
| 29 | Web controls (theme/seed/count form) | Web |
| 30 | Web gallery + single-icon download | Web |
| 31 | Web build verification (itch HTML5 size budget) | Web |
| 32 | `produce-starter-pack.ts` script | Production |
| 33 | `visual-qa-sample.ts` script | Production |
| 34 | Generate v1.0.0 starter pack | Production |
| 35 | Top-level `README.md` | Docs |
| 36 | `docs/USAGE.md` | Docs |
| 37 | `docs/THEME-AUTHORING.md` | Docs |
| 38 | `docs/ARCHITECTURE.md` | Docs |
| 39 | `itch-page/description.md` | Listing |
| 40 | `itch-page/tags.md` | Listing |
| 41 | 4 devlog templates | Listing |
| 42 | Release workflow + v1.0.0 tag | Release |

---

## Foundation

### Task 1: pnpm workspace + lint/format/types config

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `.editorconfig`
- Create: `.prettierrc`
- Create: `eslint.config.js`

- [ ] **Step 1: Verify Node + pnpm versions**

Run: `node --version && pnpm --version`
Expected: Node ≥ 22, pnpm ≥ 9. If pnpm missing: `npm i -g pnpm@9`.

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "procforge",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22" },
  "packageManager": "pnpm@9.12.0",
  "scripts": {
    "build": "pnpm -r --filter './packages/**' build",
    "test": "pnpm -r --filter './packages/**' test",
    "typecheck": "pnpm -r --filter './packages/**' typecheck",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "devDependencies": {
    "@types/node": "^22.7.0",
    "eslint": "^9.10.0",
    "@typescript-eslint/eslint-plugin": "^8.5.0",
    "@typescript-eslint/parser": "^8.5.0",
    "prettier": "^3.3.0",
    "typescript": "^5.6.2"
  }
}
```

- [ ] **Step 3: Write `pnpm-workspace.yaml`**

```yaml
packages:
  - 'packages/*'
  - 'packages/themes/*'
```

- [ ] **Step 4: Write `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "declaration": true,
    "sourceMap": true,
    "resolveJsonModule": true
  }
}
```

- [ ] **Step 5: Write `.gitignore`**

```
node_modules/
dist/
*.log
.DS_Store
.vite/
coverage/
starter-pack/svg/
starter-pack/png/
starter-pack/manifest.json
starter-pack/index.html
starter-pack.zip
```

- [ ] **Step 6: Write `.editorconfig`**

```ini
root = true
[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

- [ ] **Step 7: Write `.prettierrc`**

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

- [ ] **Step 8: Write `eslint.config.js`**

```js
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
    },
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  { ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**'] },
];
```

- [ ] **Step 9: Install dependencies**

Run: `pnpm install`
Expected: pnpm creates `pnpm-lock.yaml`, installs devDependencies, no errors.

- [ ] **Step 10: Verify lint runs (no files yet, so trivially clean)**

Run: `pnpm lint`
Expected: exit 0 (no .ts files to lint yet).

- [ ] **Step 11: Commit**

```bash
git add package.json pnpm-workspace.yaml tsconfig.base.json .gitignore .editorconfig .prettierrc eslint.config.js pnpm-lock.yaml
git commit -m "chore: pnpm workspace + lint/format/types config"
```

---

### Task 2: CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write CI workflow**

```yaml
name: ci
on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add lint/typecheck/test/build workflow"
```

---

### Task 3: `@procforge/core` package skeleton

**Files:**
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/vitest.config.ts`
- Create: `packages/core/tsup.config.ts`
- Create: `packages/core/src/index.ts`
- Create: `packages/core/tests/sentinel.test.ts`

- [ ] **Step 1: Write `packages/core/package.json`**

```json
{
  "name": "@procforge/core",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": { ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" } },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "seedrandom": "^3.0.5"
  },
  "devDependencies": {
    "@types/seedrandom": "^3.0.8",
    "tsup": "^8.3.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Write `packages/core/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Write `packages/core/tsup.config.ts`**

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
});
```

- [ ] **Step 4: Write `packages/core/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 5: Write `packages/core/src/index.ts` (placeholder barrel)**

```ts
export const VERSION = '0.1.0';
```

- [ ] **Step 6: Write sentinel test**

```ts
// packages/core/tests/sentinel.test.ts
import { describe, it, expect } from 'vitest';
import { VERSION } from '../src/index';

describe('sentinel', () => {
  it('exports VERSION', () => {
    expect(VERSION).toBe('0.1.0');
  });
});
```

- [ ] **Step 7: Install + run**

```bash
pnpm install
pnpm --filter @procforge/core test
pnpm --filter @procforge/core build
pnpm --filter @procforge/core typecheck
```

Expected: all green; `dist/index.js` and `dist/index.d.ts` produced.

- [ ] **Step 8: Commit**

```bash
git add packages/core pnpm-lock.yaml
git commit -m "feat(core): package skeleton with vitest + tsup"
```

---

## Generator Core

### Task 4: `seed` module

**Files:**
- Create: `packages/core/src/seed.ts`
- Create: `packages/core/tests/seed.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// packages/core/tests/seed.test.ts
import { describe, it, expect } from 'vitest';
import { makeRng, pick, range, intRange } from '../src/seed';

describe('makeRng', () => {
  it('produces deterministic output for the same seed', () => {
    const a = makeRng('abc');
    const b = makeRng('abc');
    expect(a()).toBe(b());
    expect(a()).toBe(b());
  });

  it('produces different output for different seeds', () => {
    expect(makeRng('abc')()).not.toBe(makeRng('xyz')());
  });
});

describe('pick', () => {
  it('returns an item from the list', () => {
    const rng = makeRng('seed');
    expect(['a', 'b', 'c']).toContain(pick(rng, ['a', 'b', 'c']));
  });

  it('throws on empty array', () => {
    expect(() => pick(makeRng('s'), [])).toThrow(/empty/);
  });
});

describe('range', () => {
  it('returns a value in [min, max)', () => {
    const rng = makeRng('seed');
    for (let i = 0; i < 200; i++) {
      const v = range(rng, 5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThan(10);
    }
  });
});

describe('intRange', () => {
  it('returns an integer in [min, max] (inclusive)', () => {
    const rng = makeRng('seed');
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) {
      const v = intRange(rng, 1, 5);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(5);
      seen.add(v);
    }
    expect(seen.size).toBe(5);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm --filter @procforge/core test`
Expected: FAIL with "Cannot find module '../src/seed'".

- [ ] **Step 3: Implement `seed.ts`**

```ts
// packages/core/src/seed.ts
import seedrandom from 'seedrandom';

export type RNG = () => number;

export function makeRng(seed: string | number): RNG {
  return seedrandom(String(seed));
}

export function pick<T>(rng: RNG, items: readonly T[]): T {
  if (items.length === 0) throw new Error('pick: empty array');
  const i = Math.floor(rng() * items.length);
  return items[i] as T;
}

export function range(rng: RNG, min: number, max: number): number {
  return min + rng() * (max - min);
}

export function intRange(rng: RNG, min: number, max: number): number {
  return Math.floor(min + rng() * (max - min + 1));
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm --filter @procforge/core test`
Expected: 4 tests pass.

- [ ] **Step 5: Re-export from `src/index.ts`**

```ts
// packages/core/src/index.ts
export const VERSION = '0.1.0';
export * from './seed';
```

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/seed.ts packages/core/tests/seed.test.ts packages/core/src/index.ts
git commit -m "feat(core): seedable RNG with pick/range helpers"
```

---

### Task 5: `palette` module

**Files:**
- Create: `packages/core/src/palette.ts`
- Create: `packages/core/tests/palette.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// packages/core/tests/palette.test.ts
import { describe, it, expect } from 'vitest';
import { makeRng } from '../src/seed';
import { definePalette, pickColor, type Palette } from '../src/palette';

const p: Palette = definePalette({
  id: 'test',
  primary: ['#aa0000', '#bb0000'],
  secondary: ['#0000aa'],
  accent: ['#00aa00'],
  neutral: ['#222222', '#dddddd'],
});

describe('definePalette', () => {
  it('returns the palette as-is and freezes arrays', () => {
    expect(p.id).toBe('test');
    expect(p.primary).toEqual(['#aa0000', '#bb0000']);
    expect(Object.isFrozen(p.primary)).toBe(true);
  });

  it('rejects empty role arrays', () => {
    expect(() =>
      definePalette({ id: 'bad', primary: [], secondary: ['#000'], accent: ['#000'], neutral: ['#000'] }),
    ).toThrow(/primary/);
  });

  it('rejects invalid hex colors', () => {
    expect(() =>
      definePalette({ id: 'bad', primary: ['red'], secondary: ['#000'], accent: ['#000'], neutral: ['#000'] }),
    ).toThrow(/hex/);
  });
});

describe('pickColor', () => {
  it('picks from the requested role', () => {
    const rng = makeRng('s');
    expect(p.primary).toContain(pickColor(rng, p, 'primary'));
    expect(pickColor(rng, p, 'secondary')).toBe('#0000aa');
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm --filter @procforge/core test`
Expected: FAIL.

- [ ] **Step 3: Implement `palette.ts`**

```ts
// packages/core/src/palette.ts
import type { RNG } from './seed';
import { pick } from './seed';

export type ColorRole = 'primary' | 'secondary' | 'accent' | 'neutral';

export interface Palette {
  readonly id: string;
  readonly primary: readonly string[];
  readonly secondary: readonly string[];
  readonly accent: readonly string[];
  readonly neutral: readonly string[];
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function definePalette(p: {
  id: string;
  primary: string[];
  secondary: string[];
  accent: string[];
  neutral: string[];
}): Palette {
  for (const role of ['primary', 'secondary', 'accent', 'neutral'] as const) {
    const arr = p[role];
    if (arr.length === 0) throw new Error(`palette ${p.id}: ${role} is empty`);
    for (const c of arr) {
      if (!HEX_RE.test(c)) throw new Error(`palette ${p.id}: invalid hex "${c}"`);
    }
  }
  return Object.freeze({
    id: p.id,
    primary: Object.freeze([...p.primary]),
    secondary: Object.freeze([...p.secondary]),
    accent: Object.freeze([...p.accent]),
    neutral: Object.freeze([...p.neutral]),
  });
}

export function pickColor(rng: RNG, palette: Palette, role: ColorRole): string {
  return pick(rng, palette[role]);
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm --filter @procforge/core test`
Expected: all pass.

- [ ] **Step 5: Re-export**

Add to `packages/core/src/index.ts`:

```ts
export * from './palette';
```

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/palette.ts packages/core/tests/palette.test.ts packages/core/src/index.ts
git commit -m "feat(core): palette type + validation + role picker"
```

---

### Task 6: `svg-emitter` module

**Files:**
- Create: `packages/core/src/svg-emitter.ts`
- Create: `packages/core/tests/svg-emitter.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// packages/core/tests/svg-emitter.test.ts
import { describe, it, expect } from 'vitest';
import { svgElement, svgDocument } from '../src/svg-emitter';

describe('svgElement', () => {
  it('emits self-closing tag with attributes', () => {
    expect(svgElement('circle', { cx: 10, cy: 10, r: 5, fill: '#ff0000' })).toBe(
      '<circle cx="10" cy="10" r="5" fill="#ff0000"/>',
    );
  });

  it('emits with children when provided', () => {
    expect(svgElement('g', { id: 'a' }, '<circle r="1"/>')).toBe('<g id="a"><circle r="1"/></g>');
  });

  it('escapes attribute values containing double-quote', () => {
    expect(svgElement('text', { 'data-x': 'a"b' }, 'hi')).toBe('<text data-x="a&quot;b">hi</text>');
  });

  it('skips undefined attribute values', () => {
    expect(svgElement('rect', { x: 0, y: undefined, width: 10 })).toBe('<rect x="0" width="10"/>');
  });
});

describe('svgDocument', () => {
  it('wraps body in <svg> with viewBox and namespace', () => {
    const doc = svgDocument({ size: 64, viewBox: '0 0 64 64', body: '<circle r="10"/>' });
    expect(doc).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle r="10"/></svg>',
    );
  });

  it('defaults viewBox to "0 0 size size"', () => {
    expect(svgDocument({ size: 32, body: '' })).toContain('viewBox="0 0 32 32"');
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm --filter @procforge/core test`

- [ ] **Step 3: Implement `svg-emitter.ts`**

```ts
// packages/core/src/svg-emitter.ts
export type AttrValue = string | number | undefined;
export type Attrs = Record<string, AttrValue>;

function escapeAttr(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function attrsToString(attrs: Attrs): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined) continue;
    const s = typeof v === 'number' ? String(v) : escapeAttr(v);
    parts.push(`${k}="${s}"`);
  }
  return parts.length ? ' ' + parts.join(' ') : '';
}

export function svgElement(tag: string, attrs: Attrs = {}, children?: string): string {
  const a = attrsToString(attrs);
  if (children === undefined) return `<${tag}${a}/>`;
  return `<${tag}${a}>${children}</${tag}>`;
}

export interface SvgDocumentOptions {
  size: number;
  body: string;
  viewBox?: string;
}

export function svgDocument(opts: SvgDocumentOptions): string {
  const viewBox = opts.viewBox ?? `0 0 ${opts.size} ${opts.size}`;
  return svgElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: opts.size,
      height: opts.size,
      viewBox,
    },
    opts.body,
  );
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm --filter @procforge/core test`

- [ ] **Step 5: Re-export**

Add to `packages/core/src/index.ts`:

```ts
export * from './svg-emitter';
```

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/svg-emitter.ts packages/core/tests/svg-emitter.test.ts packages/core/src/index.ts
git commit -m "feat(core): svg element + document emitters"
```

---

### Task 7: Primitive types + base

**Files:**
- Create: `packages/core/src/primitives/types.ts`
- Create: `packages/core/src/primitives/index.ts`

- [ ] **Step 1: Write `primitives/types.ts`**

```ts
// packages/core/src/primitives/types.ts
import type { RNG } from '../seed';
import type { Palette } from '../palette';

export interface PrimitiveContext {
  rng: RNG;
  palette: Palette;
  size: number;        // canonical viewBox edge (e.g. 64)
  centerX: number;
  centerY: number;
  strokeWidth: number;
}

export type PrimitiveFn = (ctx: PrimitiveContext) => string;
```

- [ ] **Step 2: Write `primitives/index.ts` (barrel — populated as primitives land)**

```ts
// packages/core/src/primitives/index.ts
export * from './types';
```

- [ ] **Step 3: Re-export from `src/index.ts`**

Add to `packages/core/src/index.ts`:

```ts
export * from './primitives';
```

- [ ] **Step 4: Verify typecheck**

Run: `pnpm --filter @procforge/core typecheck`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/primitives packages/core/src/index.ts
git commit -m "feat(core): primitive context + function type"
```

---

### Task 8: `circle` primitive

**Files:**
- Create: `packages/core/src/primitives/circle.ts`
- Create: `packages/core/tests/primitives/circle.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// packages/core/tests/primitives/circle.test.ts
import { describe, it, expect } from 'vitest';
import { makeRng } from '../../src/seed';
import { definePalette } from '../../src/palette';
import { circle } from '../../src/primitives/circle';

const palette = definePalette({
  id: 'p',
  primary: ['#ff0000'],
  secondary: ['#00ff00'],
  accent: ['#0000ff'],
  neutral: ['#222222'],
});

describe('circle primitive', () => {
  it('emits a <circle> SVG element', () => {
    const out = circle({
      rng: makeRng('s'),
      palette,
      size: 64,
      centerX: 32,
      centerY: 32,
      strokeWidth: 2,
    });
    expect(out).toMatch(/^<circle\b/);
    expect(out).toContain('cx="32"');
    expect(out).toContain('cy="32"');
    expect(out).toContain('r=');
  });

  it('is deterministic for the same seed', () => {
    const ctx = {
      palette,
      size: 64,
      centerX: 32,
      centerY: 32,
      strokeWidth: 2,
    };
    const a = circle({ ...ctx, rng: makeRng('abc') });
    const b = circle({ ...ctx, rng: makeRng('abc') });
    expect(a).toBe(b);
  });

  it('uses palette colors for stroke', () => {
    const out = circle({
      rng: makeRng('s'),
      palette,
      size: 64,
      centerX: 32,
      centerY: 32,
      strokeWidth: 2,
    });
    const knownColors = ['#ff0000', '#00ff00', '#0000ff', '#222222'];
    expect(knownColors.some((c) => out.includes(c))).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm --filter @procforge/core test`

- [ ] **Step 3: Implement `circle.ts`**

```ts
// packages/core/src/primitives/circle.ts
import { range, pick } from '../seed';
import { svgElement } from '../svg-emitter';
import type { PrimitiveFn } from './types';

export const circle: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const r = range(rng, size * 0.15, size * 0.4);
  const stroke = pick(rng, palette.neutral);
  const fill = pick(rng, [...palette.primary, ...palette.secondary, ...palette.accent, 'none']);
  return svgElement('circle', {
    cx: round(centerX),
    cy: round(centerY),
    r: round(r),
    fill,
    stroke,
    'stroke-width': strokeWidth,
  });
};

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm --filter @procforge/core test`

- [ ] **Step 5: Add to barrel**

Update `packages/core/src/primitives/index.ts`:

```ts
export * from './types';
export * from './circle';
```

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/primitives/circle.ts packages/core/tests/primitives/circle.test.ts packages/core/src/primitives/index.ts
git commit -m "feat(core): circle primitive"
```

---

### Task 9: `polygon` primitive

**Files:**
- Create: `packages/core/src/primitives/polygon.ts`
- Create: `packages/core/tests/primitives/polygon.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// packages/core/tests/primitives/polygon.test.ts
import { describe, it, expect } from 'vitest';
import { makeRng } from '../../src/seed';
import { definePalette } from '../../src/palette';
import { polygon } from '../../src/primitives/polygon';

const palette = definePalette({
  id: 'p',
  primary: ['#ff0000'],
  secondary: ['#00ff00'],
  accent: ['#0000ff'],
  neutral: ['#222222'],
});

describe('polygon primitive', () => {
  it('emits a <polygon> SVG element with at least 3 points', () => {
    const out = polygon({
      rng: makeRng('s'),
      palette,
      size: 64,
      centerX: 32,
      centerY: 32,
      strokeWidth: 2,
    });
    expect(out).toMatch(/^<polygon\b/);
    const m = out.match(/points="([^"]+)"/);
    expect(m).not.toBeNull();
    const pts = m![1]!.trim().split(/\s+/);
    expect(pts.length).toBeGreaterThanOrEqual(3);
  });

  it('is deterministic for the same seed', () => {
    const ctx = { palette, size: 64, centerX: 32, centerY: 32, strokeWidth: 2 };
    expect(polygon({ ...ctx, rng: makeRng('z') })).toBe(polygon({ ...ctx, rng: makeRng('z') }));
  });

  it('keeps points within the size bounds', () => {
    const out = polygon({
      rng: makeRng('s'),
      palette,
      size: 64,
      centerX: 32,
      centerY: 32,
      strokeWidth: 2,
    });
    const pts = out.match(/points="([^"]+)"/)![1]!.trim().split(/\s+/);
    for (const p of pts) {
      const [x, y] = p.split(',').map(Number);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(64);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(64);
    }
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm --filter @procforge/core test`

- [ ] **Step 3: Implement `polygon.ts`**

```ts
// packages/core/src/primitives/polygon.ts
import { intRange, range, pick } from '../seed';
import { svgElement } from '../svg-emitter';
import type { PrimitiveFn } from './types';

export const polygon: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const sides = intRange(rng, 3, 8);
  const radius = range(rng, size * 0.18, size * 0.42);
  const rotation = rng() * Math.PI * 2;

  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const theta = rotation + (i / sides) * Math.PI * 2;
    const x = clamp(centerX + Math.cos(theta) * radius, 0, size);
    const y = clamp(centerY + Math.sin(theta) * radius, 0, size);
    pts.push(`${round(x)},${round(y)}`);
  }

  const stroke = pick(rng, palette.neutral);
  const fill = pick(rng, [...palette.primary, ...palette.secondary, 'none']);
  return svgElement('polygon', {
    points: pts.join(' '),
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
};

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm --filter @procforge/core test`

- [ ] **Step 5: Add to barrel**

Update `packages/core/src/primitives/index.ts`:

```ts
export * from './types';
export * from './circle';
export * from './polygon';
```

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/primitives/polygon.ts packages/core/tests/primitives/polygon.test.ts packages/core/src/primitives/index.ts
git commit -m "feat(core): polygon primitive"
```

---

### Task 10: `path` primitive

**Files:**
- Create: `packages/core/src/primitives/path.ts`
- Create: `packages/core/tests/primitives/path.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// packages/core/tests/primitives/path.test.ts
import { describe, it, expect } from 'vitest';
import { makeRng } from '../../src/seed';
import { definePalette } from '../../src/palette';
import { path } from '../../src/primitives/path';

const palette = definePalette({
  id: 'p',
  primary: ['#ff0000'],
  secondary: ['#00ff00'],
  accent: ['#0000ff'],
  neutral: ['#222222'],
});

describe('path primitive', () => {
  it('emits a <path> SVG element with a `d` attribute starting with M', () => {
    const out = path({
      rng: makeRng('s'),
      palette,
      size: 64,
      centerX: 32,
      centerY: 32,
      strokeWidth: 2,
    });
    expect(out).toMatch(/^<path\b/);
    expect(out).toMatch(/d="M/);
  });

  it('is deterministic', () => {
    const ctx = { palette, size: 64, centerX: 32, centerY: 32, strokeWidth: 2 };
    expect(path({ ...ctx, rng: makeRng('z') })).toBe(path({ ...ctx, rng: makeRng('z') }));
  });

  it('produces a closed path (ends with Z)', () => {
    const out = path({
      rng: makeRng('s'),
      palette,
      size: 64,
      centerX: 32,
      centerY: 32,
      strokeWidth: 2,
    });
    expect(out).toMatch(/Z"/);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm --filter @procforge/core test`

- [ ] **Step 3: Implement `path.ts`**

```ts
// packages/core/src/primitives/path.ts
import { intRange, range, pick } from '../seed';
import { svgElement } from '../svg-emitter';
import type { PrimitiveFn } from './types';

export const path: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const points = intRange(rng, 4, 8);
  const radius = range(rng, size * 0.2, size * 0.4);
  const segments: string[] = [];

  for (let i = 0; i < points; i++) {
    const t = (i / points) * Math.PI * 2;
    const r = radius * range(rng, 0.6, 1.0);
    const x = clamp(centerX + Math.cos(t) * r, 0, size);
    const y = clamp(centerY + Math.sin(t) * r, 0, size);
    segments.push(`${i === 0 ? 'M' : 'L'}${round(x)} ${round(y)}`);
  }
  segments.push('Z');

  const stroke = pick(rng, palette.neutral);
  const fill = pick(rng, [...palette.accent, ...palette.secondary, 'none']);
  return svgElement('path', {
    d: segments.join(' '),
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
};

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm --filter @procforge/core test`

- [ ] **Step 5: Add to barrel**

Update `packages/core/src/primitives/index.ts`:

```ts
export * from './types';
export * from './circle';
export * from './polygon';
export * from './path';
```

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/primitives/path.ts packages/core/tests/primitives/path.test.ts packages/core/src/primitives/index.ts
git commit -m "feat(core): closed-path primitive"
```

---

### Task 11: `star` primitive

**Files:**
- Create: `packages/core/src/primitives/star.ts`
- Create: `packages/core/tests/primitives/star.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// packages/core/tests/primitives/star.test.ts
import { describe, it, expect } from 'vitest';
import { makeRng } from '../../src/seed';
import { definePalette } from '../../src/palette';
import { star } from '../../src/primitives/star';

const palette = definePalette({
  id: 'p',
  primary: ['#ff0000'],
  secondary: ['#00ff00'],
  accent: ['#0000ff'],
  neutral: ['#222222'],
});

describe('star primitive', () => {
  it('emits a <polygon> with 2 * pointCount vertices', () => {
    const out = star({
      rng: makeRng('s'),
      palette,
      size: 64,
      centerX: 32,
      centerY: 32,
      strokeWidth: 2,
    });
    expect(out).toMatch(/^<polygon\b/);
    const pts = out.match(/points="([^"]+)"/)![1]!.trim().split(/\s+/);
    expect(pts.length % 2).toBe(0);
    expect(pts.length).toBeGreaterThanOrEqual(8); // min 4 points × 2
  });

  it('is deterministic', () => {
    const ctx = { palette, size: 64, centerX: 32, centerY: 32, strokeWidth: 2 };
    expect(star({ ...ctx, rng: makeRng('z') })).toBe(star({ ...ctx, rng: makeRng('z') }));
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm --filter @procforge/core test`

- [ ] **Step 3: Implement `star.ts`**

```ts
// packages/core/src/primitives/star.ts
import { intRange, range, pick } from '../seed';
import { svgElement } from '../svg-emitter';
import type { PrimitiveFn } from './types';

export const star: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const points = intRange(rng, 4, 8);
  const outer = range(rng, size * 0.25, size * 0.42);
  const inner = outer * range(rng, 0.4, 0.6);
  const rotation = -Math.PI / 2;

  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const theta = rotation + (i / (points * 2)) * Math.PI * 2;
    const x = clamp(centerX + Math.cos(theta) * r, 0, size);
    const y = clamp(centerY + Math.sin(theta) * r, 0, size);
    pts.push(`${round(x)},${round(y)}`);
  }

  const stroke = pick(rng, palette.neutral);
  const fill = pick(rng, palette.accent);
  return svgElement('polygon', {
    points: pts.join(' '),
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
};

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm --filter @procforge/core test`

- [ ] **Step 5: Add to barrel**

Update `packages/core/src/primitives/index.ts`:

```ts
export * from './types';
export * from './circle';
export * from './polygon';
export * from './path';
export * from './star';
```

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/primitives/star.ts packages/core/tests/primitives/star.test.ts packages/core/src/primitives/index.ts
git commit -m "feat(core): star primitive"
```

---

### Task 12: Composer types

**Files:**
- Create: `packages/core/src/composers/types.ts`
- Create: `packages/core/src/composers/index.ts`

- [ ] **Step 1: Write `composers/types.ts`**

```ts
// packages/core/src/composers/types.ts
import type { RNG } from '../seed';
import type { Palette } from '../palette';
import type { PrimitiveFn } from '../primitives/types';

export interface ComposerContext {
  rng: RNG;
  palette: Palette;
  size: number;
  primitives: readonly PrimitiveFn[];
}

export type ComposerFn = (ctx: ComposerContext) => string;
```

- [ ] **Step 2: Write `composers/index.ts`**

```ts
// packages/core/src/composers/index.ts
export * from './types';
```

- [ ] **Step 3: Re-export from root barrel**

Add to `packages/core/src/index.ts`:

```ts
export * from './composers';
```

- [ ] **Step 4: Verify typecheck**

Run: `pnpm --filter @procforge/core typecheck`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/composers packages/core/src/index.ts
git commit -m "feat(core): composer context + function type"
```

---

### Task 13: `layer` composer

**Files:**
- Create: `packages/core/src/composers/layer.ts`
- Create: `packages/core/tests/composers/layer.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// packages/core/tests/composers/layer.test.ts
import { describe, it, expect } from 'vitest';
import { makeRng } from '../../src/seed';
import { definePalette } from '../../src/palette';
import { circle, polygon, star, path } from '../../src/primitives';
import { layer } from '../../src/composers/layer';

const palette = definePalette({
  id: 'p',
  primary: ['#ff0000'],
  secondary: ['#00ff00'],
  accent: ['#0000ff'],
  neutral: ['#222222'],
});

describe('layer composer', () => {
  it('stacks 2-4 primitives inside an SVG group', () => {
    const out = layer({
      rng: makeRng('s'),
      palette,
      size: 64,
      primitives: [circle, polygon, star, path],
    });
    expect(out.startsWith('<g')).toBe(true);
    expect(out.endsWith('</g>')).toBe(true);
    const elementCount = (out.match(/<(circle|polygon|path)\b/g) ?? []).length;
    expect(elementCount).toBeGreaterThanOrEqual(2);
    expect(elementCount).toBeLessThanOrEqual(4);
  });

  it('is deterministic', () => {
    const args = { palette, size: 64, primitives: [circle, polygon, star] };
    expect(layer({ ...args, rng: makeRng('z') })).toBe(layer({ ...args, rng: makeRng('z') }));
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm --filter @procforge/core test`

- [ ] **Step 3: Implement `layer.ts`**

```ts
// packages/core/src/composers/layer.ts
import { intRange, pick, range } from '../seed';
import { svgElement } from '../svg-emitter';
import type { ComposerFn } from './types';

export const layer: ComposerFn = ({ rng, palette, size, primitives }) => {
  const count = intRange(rng, 2, 4);
  const center = size / 2;
  const strokeWidth = Math.max(1, Math.round(size * 0.04));
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const fn = pick(rng, primitives);
    const offsetX = range(rng, -size * 0.1, size * 0.1);
    const offsetY = range(rng, -size * 0.1, size * 0.1);
    parts.push(
      fn({
        rng,
        palette,
        size,
        centerX: center + offsetX,
        centerY: center + offsetY,
        strokeWidth,
      }),
    );
  }
  return svgElement('g', {}, parts.join(''));
};
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm --filter @procforge/core test`

- [ ] **Step 5: Add to barrel**

Update `packages/core/src/composers/index.ts`:

```ts
export * from './types';
export * from './layer';
```

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/composers/layer.ts packages/core/tests/composers/layer.test.ts packages/core/src/composers/index.ts
git commit -m "feat(core): layer composer (stacked primitives)"
```

---

### Task 14: `mask` composer

**Files:**
- Create: `packages/core/src/composers/mask.ts`
- Create: `packages/core/tests/composers/mask.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// packages/core/tests/composers/mask.test.ts
import { describe, it, expect } from 'vitest';
import { makeRng } from '../../src/seed';
import { definePalette } from '../../src/palette';
import { circle, polygon, path } from '../../src/primitives';
import { mask } from '../../src/composers/mask';

const palette = definePalette({
  id: 'p',
  primary: ['#ff0000'],
  secondary: ['#00ff00'],
  accent: ['#0000ff'],
  neutral: ['#222222'],
});

describe('mask composer', () => {
  it('emits a <defs>+<mask>+masked group structure', () => {
    const out = mask({
      rng: makeRng('s'),
      palette,
      size: 64,
      primitives: [circle, polygon, path],
    });
    expect(out).toContain('<defs>');
    expect(out).toContain('<mask');
    expect(out).toContain('mask="url(#');
  });

  it('is deterministic', () => {
    const args = { palette, size: 64, primitives: [circle, polygon] };
    expect(mask({ ...args, rng: makeRng('z') })).toBe(mask({ ...args, rng: makeRng('z') }));
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm --filter @procforge/core test`

- [ ] **Step 3: Implement `mask.ts`**

```ts
// packages/core/src/composers/mask.ts
import { pick, intRange } from '../seed';
import { svgElement } from '../svg-emitter';
import type { ComposerFn } from './types';

let counter = 0;
function nextId(): string {
  counter = (counter + 1) % 1_000_000;
  return `m${counter}`;
}

export const mask: ComposerFn = ({ rng, palette, size, primitives }) => {
  const id = nextId();
  const center = size / 2;
  const strokeWidth = Math.max(1, Math.round(size * 0.04));

  const maskShape = pick(rng, primitives)({
    rng,
    palette,
    size,
    centerX: center,
    centerY: center,
    strokeWidth,
  }).replace(/fill="[^"]*"/, 'fill="white"').replace(/stroke="[^"]*"/, 'stroke="white"');

  const bodyCount = intRange(rng, 2, 3);
  const bodyParts: string[] = [];
  for (let i = 0; i < bodyCount; i++) {
    bodyParts.push(
      pick(rng, primitives)({
        rng,
        palette,
        size,
        centerX: center,
        centerY: center,
        strokeWidth,
      }),
    );
  }
  const body = svgElement('g', { mask: `url(#${id})` }, bodyParts.join(''));

  const defs = svgElement('defs', {}, svgElement('mask', { id }, maskShape));
  return defs + body;
};
```

Note: per-process counter id is acceptable here because each generated SVG is a standalone document; mask ids do not need to be globally unique outside their containing document.

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm --filter @procforge/core test`

- [ ] **Step 5: Add to barrel**

Update `packages/core/src/composers/index.ts`:

```ts
export * from './types';
export * from './layer';
export * from './mask';
```

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/composers/mask.ts packages/core/tests/composers/mask.test.ts packages/core/src/composers/index.ts
git commit -m "feat(core): mask composer (defs + mask + masked group)"
```

---

### Task 15: `Theme` interface + registry

**Files:**
- Create: `packages/core/src/theme.ts`
- Create: `packages/core/tests/theme.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// packages/core/tests/theme.test.ts
import { describe, it, expect } from 'vitest';
import { definePalette } from '../src/palette';
import { circle } from '../src/primitives';
import { layer } from '../src/composers';
import { defineTheme, ThemeRegistry } from '../src/theme';

const palette = definePalette({
  id: 'p',
  primary: ['#ff0000'],
  secondary: ['#00ff00'],
  accent: ['#0000ff'],
  neutral: ['#222222'],
});

const t = defineTheme({
  id: 'demo',
  displayName: 'Demo',
  palette,
  primitives: [circle],
  composers: [layer],
  tags: ['demo'],
});

describe('defineTheme', () => {
  it('returns a frozen theme with the given id', () => {
    expect(t.id).toBe('demo');
    expect(t.displayName).toBe('Demo');
    expect(Object.isFrozen(t)).toBe(true);
  });

  it('rejects empty primitives', () => {
    expect(() =>
      defineTheme({
        id: 'bad',
        displayName: 'Bad',
        palette,
        primitives: [],
        composers: [layer],
        tags: [],
      }),
    ).toThrow(/primitive/);
  });

  it('rejects empty composers', () => {
    expect(() =>
      defineTheme({
        id: 'bad',
        displayName: 'Bad',
        palette,
        primitives: [circle],
        composers: [],
        tags: [],
      }),
    ).toThrow(/composer/);
  });
});

describe('ThemeRegistry', () => {
  it('registers and looks up themes by id', () => {
    const r = new ThemeRegistry();
    r.register(t);
    expect(r.get('demo')).toBe(t);
    expect(r.list().map((x) => x.id)).toEqual(['demo']);
  });

  it('throws on duplicate registration', () => {
    const r = new ThemeRegistry();
    r.register(t);
    expect(() => r.register(t)).toThrow(/duplicate/);
  });

  it('throws on unknown lookup', () => {
    const r = new ThemeRegistry();
    expect(() => r.get('nope')).toThrow(/unknown theme/);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm --filter @procforge/core test`

- [ ] **Step 3: Implement `theme.ts`**

```ts
// packages/core/src/theme.ts
import type { Palette } from './palette';
import type { PrimitiveFn } from './primitives/types';
import type { ComposerFn } from './composers/types';

export interface Theme {
  readonly id: string;
  readonly displayName: string;
  readonly palette: Palette;
  readonly primitives: readonly PrimitiveFn[];
  readonly composers: readonly ComposerFn[];
  readonly tags: readonly string[];
}

export function defineTheme(t: {
  id: string;
  displayName: string;
  palette: Palette;
  primitives: PrimitiveFn[];
  composers: ComposerFn[];
  tags: string[];
}): Theme {
  if (t.primitives.length === 0) throw new Error(`theme ${t.id}: primitives empty`);
  if (t.composers.length === 0) throw new Error(`theme ${t.id}: composers empty`);
  return Object.freeze({
    id: t.id,
    displayName: t.displayName,
    palette: t.palette,
    primitives: Object.freeze([...t.primitives]),
    composers: Object.freeze([...t.composers]),
    tags: Object.freeze([...t.tags]),
  });
}

export class ThemeRegistry {
  private readonly themes = new Map<string, Theme>();

  register(theme: Theme): void {
    if (this.themes.has(theme.id)) throw new Error(`duplicate theme: ${theme.id}`);
    this.themes.set(theme.id, theme);
  }

  get(id: string): Theme {
    const t = this.themes.get(id);
    if (!t) throw new Error(`unknown theme: ${id}`);
    return t;
  }

  list(): Theme[] {
    return [...this.themes.values()];
  }
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm --filter @procforge/core test`

- [ ] **Step 5: Re-export**

Add to `packages/core/src/index.ts`:

```ts
export * from './theme';
```

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/theme.ts packages/core/tests/theme.test.ts packages/core/src/index.ts
git commit -m "feat(core): Theme interface + registry"
```

---

### Task 16: `generator` entry point

**Files:**
- Create: `packages/core/src/generator.ts`
- Create: `packages/core/tests/generator.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// packages/core/tests/generator.test.ts
import { describe, it, expect } from 'vitest';
import { definePalette } from '../src/palette';
import { circle, polygon } from '../src/primitives';
import { layer } from '../src/composers';
import { defineTheme } from '../src/theme';
import { generateOne, generateMany } from '../src/generator';

const t = defineTheme({
  id: 'demo',
  displayName: 'Demo',
  palette: definePalette({
    id: 'p',
    primary: ['#ff0000'],
    secondary: ['#00ff00'],
    accent: ['#0000ff'],
    neutral: ['#222222'],
  }),
  primitives: [circle, polygon],
  composers: [layer],
  tags: [],
});

describe('generateOne', () => {
  it('returns a complete SVG document', () => {
    const svg = generateOne({ theme: t, seed: 'a', size: 64 });
    expect(svg.startsWith('<svg ')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
    expect(svg).toContain('viewBox="0 0 64 64"');
  });

  it('is deterministic', () => {
    expect(generateOne({ theme: t, seed: 'a', size: 64 })).toBe(
      generateOne({ theme: t, seed: 'a', size: 64 }),
    );
  });

  it('different seeds yield different SVGs', () => {
    expect(generateOne({ theme: t, seed: 'a', size: 64 })).not.toBe(
      generateOne({ theme: t, seed: 'b', size: 64 }),
    );
  });
});

describe('generateMany', () => {
  it('returns the requested number of SVGs', () => {
    const items = generateMany({ theme: t, baseSeed: 'batch', count: 5, size: 64 });
    expect(items).toHaveLength(5);
    for (const it of items) {
      expect(it.svg.startsWith('<svg ')).toBe(true);
      expect(typeof it.seed).toBe('string');
    }
  });

  it('seeds are unique within a batch', () => {
    const items = generateMany({ theme: t, baseSeed: 'batch', count: 10, size: 64 });
    const seeds = new Set(items.map((i) => i.seed));
    expect(seeds.size).toBe(10);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm --filter @procforge/core test`

- [ ] **Step 3: Implement `generator.ts`**

```ts
// packages/core/src/generator.ts
import { makeRng, pick } from './seed';
import { svgDocument } from './svg-emitter';
import type { Theme } from './theme';

export interface GenerateOneOptions {
  theme: Theme;
  seed: string;
  size: number;
}

export interface GenerateManyOptions {
  theme: Theme;
  baseSeed: string;
  count: number;
  size: number;
}

export interface GeneratedIcon {
  seed: string;
  svg: string;
}

export function generateOne({ theme, seed, size }: GenerateOneOptions): string {
  const rng = makeRng(`${theme.id}:${seed}`);
  const composer = pick(rng, theme.composers);
  const body = composer({ rng, palette: theme.palette, size, primitives: theme.primitives });
  return svgDocument({ size, body });
}

export function generateMany({ theme, baseSeed, count, size }: GenerateManyOptions): GeneratedIcon[] {
  const out: GeneratedIcon[] = [];
  for (let i = 0; i < count; i++) {
    const seed = `${baseSeed}-${i.toString().padStart(4, '0')}`;
    out.push({ seed, svg: generateOne({ theme, seed, size }) });
  }
  return out;
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm --filter @procforge/core test`

- [ ] **Step 5: Re-export**

Add to `packages/core/src/index.ts`:

```ts
export * from './generator';
```

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/generator.ts packages/core/tests/generator.test.ts packages/core/src/index.ts
git commit -m "feat(core): generator entry point (one + batch)"
```

---

## Themes

### Task 17: `medieval-fantasy` theme package

**Files:**
- Create: `packages/themes/medieval-fantasy/package.json`
- Create: `packages/themes/medieval-fantasy/tsconfig.json`
- Create: `packages/themes/medieval-fantasy/vitest.config.ts`
- Create: `packages/themes/medieval-fantasy/tsup.config.ts`
- Create: `packages/themes/medieval-fantasy/src/index.ts` (placeholder)

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "@procforge/theme-medieval-fantasy",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": { ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" } },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@procforge/core": "workspace:*"
  },
  "devDependencies": {
    "tsup": "^8.3.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Write `tsconfig.json`**

```json
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Write `tsup.config.ts`**

```ts
import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
});
```

- [ ] **Step 4: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
```

- [ ] **Step 5: Placeholder `src/index.ts`**

```ts
// packages/themes/medieval-fantasy/src/index.ts
export const PLACEHOLDER = 'medieval-fantasy';
```

- [ ] **Step 6: Install + verify**

Run: `pnpm install && pnpm --filter @procforge/theme-medieval-fantasy typecheck && pnpm --filter @procforge/theme-medieval-fantasy build`
Expected: dist files produced.

- [ ] **Step 7: Commit**

```bash
git add packages/themes/medieval-fantasy pnpm-lock.yaml
git commit -m "feat(theme-medieval): package skeleton"
```

---

### Task 18: `medieval-fantasy` theme implementation

**Files:**
- Create: `packages/themes/medieval-fantasy/src/index.ts` (replace placeholder)
- Create: `packages/themes/medieval-fantasy/tests/index.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// packages/themes/medieval-fantasy/tests/index.test.ts
import { describe, it, expect } from 'vitest';
import { generateOne, generateMany } from '@procforge/core';
import { medievalFantasy } from '../src/index';

describe('medievalFantasy theme', () => {
  it('exports a Theme with id "medieval-fantasy"', () => {
    expect(medievalFantasy.id).toBe('medieval-fantasy');
    expect(medievalFantasy.displayName).toMatch(/medieval/i);
  });

  it('declares non-empty primitives, composers, palette', () => {
    expect(medievalFantasy.primitives.length).toBeGreaterThan(0);
    expect(medievalFantasy.composers.length).toBeGreaterThan(0);
    expect(medievalFantasy.palette.primary.length).toBeGreaterThan(0);
  });

  it('produces a valid SVG document via generateOne', () => {
    const svg = generateOne({ theme: medievalFantasy, seed: 'sword-1', size: 64 });
    expect(svg.startsWith('<svg ')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
  });

  it('produces 50 unique SVGs via generateMany', () => {
    const items = generateMany({ theme: medievalFantasy, baseSeed: 'm', count: 50, size: 64 });
    expect(items).toHaveLength(50);
    const uniq = new Set(items.map((i) => i.svg));
    expect(uniq.size).toBeGreaterThan(40); // tolerate occasional collision
  });

  it('declares game-relevant tags', () => {
    expect(medievalFantasy.tags).toContain('weapon');
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm --filter @procforge/theme-medieval-fantasy test`

- [ ] **Step 3: Implement theme**

```ts
// packages/themes/medieval-fantasy/src/index.ts
import {
  defineTheme,
  definePalette,
  circle,
  polygon,
  path,
  star,
  layer,
  mask,
  type Theme,
} from '@procforge/core';

const palette = definePalette({
  id: 'medieval-fantasy',
  primary: ['#8b3a1f', '#a85432', '#c97f3e', '#5a4632'],
  secondary: ['#3a5a4a', '#6b8e6b', '#2d4a3a'],
  accent: ['#d4a73a', '#f0c75a', '#b8851f'],
  neutral: ['#1f1a14', '#3a322a', '#d8cfc0'],
});

export const medievalFantasy: Theme = defineTheme({
  id: 'medieval-fantasy',
  displayName: 'Medieval Fantasy',
  palette,
  primitives: [circle, polygon, path, star],
  composers: [layer, mask],
  tags: ['weapon', 'potion', 'shield', 'scroll', 'rpg', 'fantasy'],
});
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm --filter @procforge/theme-medieval-fantasy test`

- [ ] **Step 5: Build**

Run: `pnpm --filter @procforge/theme-medieval-fantasy build`
Expected: dist/index.js exists.

- [ ] **Step 6: Commit**

```bash
git add packages/themes/medieval-fantasy/src packages/themes/medieval-fantasy/tests
git commit -m "feat(theme-medieval): palette + theme definition"
```

---

### Task 19: First end-to-end smoke test (50 medieval icons → SVG files on disk)

This task validates the full pipeline before building the CLI. We render 50 SVGs to a temp directory and inspect them visually.

**Files:**
- Create: `scripts/smoke-medieval.ts`

- [ ] **Step 1: Add `tsx` dev dependency at workspace root**

```bash
pnpm add -Dw tsx
```

- [ ] **Step 2: Write `scripts/smoke-medieval.ts`**

```ts
// scripts/smoke-medieval.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateMany } from '@procforge/core';
import { medievalFantasy } from '@procforge/theme-medieval-fantasy';

const outDir = join(process.cwd(), '.smoke-medieval');
mkdirSync(outDir, { recursive: true });

const items = generateMany({ theme: medievalFantasy, baseSeed: 'smoke', count: 50, size: 64 });
for (const { seed, svg } of items) {
  writeFileSync(join(outDir, `${seed}.svg`), svg, 'utf8');
}

const indexHtml = `<!doctype html><html><head><meta charset="utf-8"><title>smoke</title>
<style>body{background:#1a1a2e;display:grid;grid-template-columns:repeat(10,1fr);gap:8px;padding:8px}
img{background:#fff;width:64px;height:64px}</style></head><body>
${items.map((i) => `<img src="${i.seed}.svg" title="${i.seed}">`).join('\n')}
</body></html>`;
writeFileSync(join(outDir, 'index.html'), indexHtml, 'utf8');

console.log(`Wrote ${items.length} SVGs and index.html to ${outDir}`);
```

- [ ] **Step 3: Add `.smoke-medieval/` to `.gitignore`**

Append to `.gitignore`:

```
.smoke-medieval/
```

- [ ] **Step 4: Run script**

Run: `pnpm --filter @procforge/core build && pnpm --filter @procforge/theme-medieval-fantasy build && pnpm tsx scripts/smoke-medieval.ts`
Expected: prints "Wrote 50 SVGs and index.html to .../.smoke-medieval".

- [ ] **Step 5: Visual sanity check**

Open `.smoke-medieval/index.html` in a browser. Verify:
- 50 distinct icons render (not all the same).
- Colors match medieval palette (browns, greens, golds).
- Each icon visibly contains shapes (not blank).
- No icons overflow the 64-pixel box badly.

If many icons look identical or blank, primitive/composer math has a bug — return to the relevant primitive/composer task and tighten tests before proceeding.

- [ ] **Step 6: Commit**

```bash
git add scripts/smoke-medieval.ts .gitignore
git commit -m "chore: end-to-end smoke script for medieval theme"
```

---

## CLI

### Task 20: `@procforge/cli` package skeleton

**Files:**
- Create: `packages/cli/package.json`
- Create: `packages/cli/tsconfig.json`
- Create: `packages/cli/vitest.config.ts`
- Create: `packages/cli/tsup.config.ts`
- Create: `packages/cli/src/cli.ts` (placeholder)
- Create: `packages/cli/bin/icongen`

- [ ] **Step 1: Write `packages/cli/package.json`**

```json
{
  "name": "@procforge/cli",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./dist/cli.js",
  "bin": { "icongen": "./bin/icongen" },
  "exports": {
    ".": { "import": "./dist/cli.js" },
    "./render": { "import": "./dist/render.js" },
    "./pack": { "import": "./dist/pack.js" },
    "./generate": { "import": "./dist/generate.js" }
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@procforge/core": "workspace:*",
    "@procforge/theme-medieval-fantasy": "workspace:*",
    "@resvg/resvg-js": "^2.6.2",
    "jszip": "^3.10.1",
    "mri": "^1.2.0"
  },
  "devDependencies": {
    "@types/node": "^22.7.0",
    "tsup": "^8.3.0",
    "vitest": "^2.1.0"
  }
}
```

(Sci-fi / cozy-farm / roguelike packages will be added as workspace deps in Tasks 25–27.)

- [ ] **Step 2: Write `packages/cli/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src", "lib": ["ES2022"] },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Write `packages/cli/tsup.config.ts`**

```ts
import { defineConfig } from 'tsup';
export default defineConfig([
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    dts: false,
    sourcemap: true,
    clean: true,
    shims: false,
    banner: { js: '#!/usr/bin/env node' },
  },
  {
    entry: ['src/render.ts', 'src/pack.ts', 'src/generate.ts'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: false,
  },
]);
```

- [ ] **Step 4: Write `packages/cli/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
```

- [ ] **Step 5: Write `packages/cli/src/cli.ts` (placeholder)**

```ts
// packages/cli/src/cli.ts
console.log('icongen v0.1.0 — implementation pending');
```

- [ ] **Step 6: Write `packages/cli/bin/icongen`**

```js
#!/usr/bin/env node
// packages/cli/bin/icongen
import('../dist/cli.js');
```

Then make it executable:

```bash
chmod +x packages/cli/bin/icongen
```

- [ ] **Step 7: Install + build + smoke**

```bash
pnpm install
pnpm --filter @procforge/cli build
node packages/cli/dist/cli.js
```

Expected output: `icongen v0.1.0 — implementation pending`.

- [ ] **Step 8: Commit**

```bash
git add packages/cli pnpm-lock.yaml
git commit -m "feat(cli): package skeleton with icongen bin"
```

---

### Task 21: `render` (SVG → PNG via resvg-js)

**Files:**
- Create: `packages/cli/src/render.ts`
- Create: `packages/cli/tests/render.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// packages/cli/tests/render.test.ts
import { describe, it, expect } from 'vitest';
import { renderSvgToPng } from '../src/render';

const sampleSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">' +
  '<circle cx="32" cy="32" r="20" fill="#ff0000"/></svg>';

describe('renderSvgToPng', () => {
  it('produces a PNG buffer with the requested dimensions', async () => {
    const png = await renderSvgToPng(sampleSvg, 64);
    expect(png.length).toBeGreaterThan(100);
    // PNG magic number: 89 50 4E 47 0D 0A 1A 0A
    expect(png[0]).toBe(0x89);
    expect(png[1]).toBe(0x50);
    expect(png[2]).toBe(0x4e);
    expect(png[3]).toBe(0x47);
  });

  it('renders different sizes', async () => {
    const small = await renderSvgToPng(sampleSvg, 16);
    const large = await renderSvgToPng(sampleSvg, 256);
    expect(large.length).toBeGreaterThan(small.length);
  });

  it('rejects empty SVG input', async () => {
    await expect(renderSvgToPng('', 64)).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm --filter @procforge/cli test`

- [ ] **Step 3: Implement `render.ts`**

```ts
// packages/cli/src/render.ts
import { Resvg } from '@resvg/resvg-js';

export async function renderSvgToPng(svg: string, size: number): Promise<Buffer> {
  if (!svg) throw new Error('renderSvgToPng: empty svg');
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: 'rgba(0,0,0,0)',
  });
  return resvg.render().asPng();
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm --filter @procforge/cli test`

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/render.ts packages/cli/tests/render.test.ts
git commit -m "feat(cli): SVG → PNG via resvg-js"
```

---

### Task 22: `pack` (JSZip)

**Files:**
- Create: `packages/cli/src/pack.ts`
- Create: `packages/cli/tests/pack.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// packages/cli/tests/pack.test.ts
import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { packToZip, type PackEntry } from '../src/pack';

describe('packToZip', () => {
  it('produces a zip containing all entries', async () => {
    const entries: PackEntry[] = [
      { path: 'README.md', data: Buffer.from('hello', 'utf8') },
      { path: 'svg/a.svg', data: Buffer.from('<svg/>', 'utf8') },
      { path: 'png/64/a.png', data: Buffer.from([0x89, 0x50, 0x4e, 0x47]) },
    ];
    const zipBuf = await packToZip(entries);
    const zip = await JSZip.loadAsync(zipBuf);
    const names = Object.keys(zip.files).sort();
    expect(names).toEqual(['README.md', 'png/64/a.png', 'svg/a.svg']);
    expect(await zip.file('README.md')!.async('string')).toBe('hello');
  });

  it('rejects duplicate paths', async () => {
    await expect(
      packToZip([
        { path: 'a', data: Buffer.from('1') },
        { path: 'a', data: Buffer.from('2') },
      ]),
    ).rejects.toThrow(/duplicate/);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm --filter @procforge/cli test`

- [ ] **Step 3: Implement `pack.ts`**

```ts
// packages/cli/src/pack.ts
import JSZip from 'jszip';

export interface PackEntry {
  path: string;
  data: Buffer | string;
}

export async function packToZip(entries: PackEntry[]): Promise<Buffer> {
  const zip = new JSZip();
  const seen = new Set<string>();
  for (const e of entries) {
    if (seen.has(e.path)) throw new Error(`duplicate entry: ${e.path}`);
    seen.add(e.path);
    zip.file(e.path, e.data);
  }
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm --filter @procforge/cli test`

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/pack.ts packages/cli/tests/pack.test.ts
git commit -m "feat(cli): zip packaging via JSZip"
```

---

### Task 23: `generate` orchestrator + CLI entry

**Files:**
- Modify: `packages/cli/src/cli.ts`
- Create: `packages/cli/src/generate.ts`
- Create: `packages/cli/tests/generate.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// packages/cli/tests/generate.test.ts
import { describe, it, expect } from 'vitest';
import { mkdtempSync, rmSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateBatch } from '../src/generate';
import { medievalFantasy } from '@procforge/theme-medieval-fantasy';

describe('generateBatch', () => {
  it('writes SVG and PNG files into the output directory', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'icongen-'));
    try {
      await generateBatch({
        theme: medievalFantasy,
        baseSeed: 'test',
        count: 3,
        sizes: [16, 64],
        outDir: dir,
      });
      const svgs = readdirSync(join(dir, 'svg', 'medieval-fantasy'));
      const png16 = readdirSync(join(dir, 'png', '16', 'medieval-fantasy'));
      const png64 = readdirSync(join(dir, 'png', '64', 'medieval-fantasy'));
      expect(svgs).toHaveLength(3);
      expect(png16).toHaveLength(3);
      expect(png64).toHaveLength(3);
      // Verify a PNG actually starts with PNG magic
      const first = readFileSync(join(dir, 'png', '64', 'medieval-fantasy', png64[0]!));
      expect(first[0]).toBe(0x89);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('writes a manifest.json mapping seed → metadata', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'icongen-'));
    try {
      await generateBatch({
        theme: medievalFantasy,
        baseSeed: 't',
        count: 2,
        sizes: [64],
        outDir: dir,
      });
      const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
      expect(manifest.theme).toBe('medieval-fantasy');
      expect(manifest.icons).toHaveLength(2);
      expect(manifest.icons[0]).toHaveProperty('seed');
      expect(manifest.icons[0]).toHaveProperty('svg');
      expect(manifest.icons[0].png).toEqual({ '64': expect.any(String) });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm --filter @procforge/cli test`

- [ ] **Step 3: Implement `generate.ts`**

```ts
// packages/cli/src/generate.ts
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { generateMany, type Theme } from '@procforge/core';
import { renderSvgToPng } from './render';

export interface GenerateBatchOptions {
  theme: Theme;
  baseSeed: string;
  count: number;
  sizes: number[];
  outDir: string;
}

export interface ManifestIcon {
  seed: string;
  svg: string;
  png: Record<string, string>;
}

export interface Manifest {
  theme: string;
  generatedAt: string;
  count: number;
  sizes: number[];
  icons: ManifestIcon[];
}

export async function generateBatch(opts: GenerateBatchOptions): Promise<Manifest> {
  const { theme, baseSeed, count, sizes, outDir } = opts;

  const items = generateMany({ theme, baseSeed, count, size: 64 });

  const themeDir = theme.id;
  await mkdir(join(outDir, 'svg', themeDir), { recursive: true });
  for (const size of sizes) {
    await mkdir(join(outDir, 'png', String(size), themeDir), { recursive: true });
  }

  const manifestIcons: ManifestIcon[] = [];
  for (const { seed, svg } of items) {
    const svgRel = join('svg', themeDir, `${seed}.svg`);
    await writeFile(join(outDir, svgRel), svg, 'utf8');
    const png: Record<string, string> = {};
    for (const size of sizes) {
      const pngRel = join('png', String(size), themeDir, `${seed}.png`);
      const buf = await renderSvgToPng(svg, size);
      await writeFile(join(outDir, pngRel), buf);
      png[String(size)] = pngRel;
    }
    manifestIcons.push({ seed, svg: svgRel, png });
  }

  const manifest: Manifest = {
    theme: theme.id,
    generatedAt: new Date().toISOString(),
    count: items.length,
    sizes,
    icons: manifestIcons,
  };
  await writeFile(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  return manifest;
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm --filter @procforge/cli test`

- [ ] **Step 5: Replace `cli.ts` with real entry**

```ts
// packages/cli/src/cli.ts
import mri from 'mri';
import { generateBatch } from './generate';
import { medievalFantasy } from '@procforge/theme-medieval-fantasy';
import type { Theme } from '@procforge/core';

const THEMES: Record<string, Theme> = {
  'medieval-fantasy': medievalFantasy,
};

async function main(): Promise<void> {
  const args = mri(process.argv.slice(2), {
    default: { theme: 'medieval-fantasy', seed: 'pf', count: 50, out: 'out', sizes: '16,32,64,128,256' },
    alias: { t: 'theme', s: 'seed', n: 'count', o: 'out' },
  });

  const themeId = String(args.theme);
  const theme = THEMES[themeId];
  if (!theme) {
    console.error(`Unknown theme: ${themeId}. Available: ${Object.keys(THEMES).join(', ')}`);
    process.exit(2);
  }

  const sizes = String(args.sizes)
    .split(',')
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (sizes.length === 0) {
    console.error('No valid sizes provided');
    process.exit(2);
  }

  const manifest = await generateBatch({
    theme,
    baseSeed: String(args.seed),
    count: Number(args.count),
    sizes,
    outDir: String(args.out),
  });

  console.log(
    `Generated ${manifest.count} ${theme.id} icons → ${args.out} (${sizes.length} PNG sizes)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 6: Build + smoke test the CLI**

```bash
pnpm --filter @procforge/cli build
node packages/cli/dist/cli.js --theme medieval-fantasy --count 5 --out .smoke-cli --sizes 64,128
```

Expected: `Generated 5 medieval-fantasy icons → .smoke-cli (2 PNG sizes)`. Inspect `.smoke-cli/` to verify file structure.

- [ ] **Step 7: Add `.smoke-cli/` to `.gitignore`**

Append to `.gitignore`:

```
.smoke-cli/
```

- [ ] **Step 8: Commit**

```bash
git add packages/cli/src .gitignore
git commit -m "feat(cli): batch generate orchestrator + icongen entry"
```

---

### Task 24: CLI integration test (50 icons → zip)

**Files:**
- Create: `packages/cli/tests/integration.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// packages/cli/tests/integration.test.ts
import { describe, it, expect } from 'vitest';
import { mkdtempSync, rmSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import JSZip from 'jszip';
import { generateBatch } from '../src/generate';
import { packToZip } from '../src/pack';
import { medievalFantasy } from '@procforge/theme-medieval-fantasy';

describe('integration: batch + pack', () => {
  it('packs a generated batch into a zip with svg + png + manifest', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'icongen-int-'));
    try {
      await generateBatch({
        theme: medievalFantasy,
        baseSeed: 'i',
        count: 10,
        sizes: [64],
        outDir: dir,
      });

      const entries = collect(dir);
      const zipBuf = await packToZip(entries);
      const zipPath = join(dir, 'pack.zip');
      writeFileSync(zipPath, zipBuf);

      const zip = await JSZip.loadAsync(readFileSync(zipPath));
      const names = Object.keys(zip.files);
      expect(names).toContain('manifest.json');
      expect(names.filter((n) => n.endsWith('.svg'))).toHaveLength(10);
      expect(names.filter((n) => n.endsWith('.png'))).toHaveLength(10);

      // Spot-check: zip is reasonably small (< 200 KB for 10 icons at 64px).
      expect(zipBuf.length).toBeLessThan(200_000);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

function collect(root: string): { path: string; data: Buffer }[] {
  const out: { path: string; data: Buffer }[] = [];
  walk(root, root, out);
  return out;
}

function walk(root: string, dir: string, out: { path: string; data: Buffer }[]): void {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, name.name);
    if (name.isDirectory()) walk(root, full, out);
    else out.push({ path: full.slice(root.length + 1).split('\\').join('/'), data: readFileSync(full) });
  }
}
```

- [ ] **Step 2: Run test — expect FAIL initially (only if any wiring is broken; otherwise it should already pass against the implementations from Tasks 21–23). Either outcome is fine — confirm green before committing.**

Run: `pnpm --filter @procforge/cli test`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/cli/tests/integration.test.ts
git commit -m "test(cli): integration test (generate + pack zip)"
```

---

### Task 25: `sci-fi` theme

**Files:**
- Create: `packages/themes/sci-fi/package.json`
- Create: `packages/themes/sci-fi/tsconfig.json`
- Create: `packages/themes/sci-fi/vitest.config.ts`
- Create: `packages/themes/sci-fi/tsup.config.ts`
- Create: `packages/themes/sci-fi/src/index.ts`
- Create: `packages/themes/sci-fi/tests/index.test.ts`

- [ ] **Step 1: Create package files (mirror Task 17 with name `@procforge/theme-sci-fi`)**

`packages/themes/sci-fi/package.json`:

```json
{
  "name": "@procforge/theme-sci-fi",
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

`packages/themes/sci-fi/tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`: identical to Task 17 (paths the same since both nest the same depth).

- [ ] **Step 2: Write failing test**

```ts
// packages/themes/sci-fi/tests/index.test.ts
import { describe, it, expect } from 'vitest';
import { generateOne, generateMany } from '@procforge/core';
import { sciFi } from '../src/index';

describe('sciFi theme', () => {
  it('exports a Theme with id "sci-fi"', () => {
    expect(sciFi.id).toBe('sci-fi');
    expect(sciFi.displayName).toMatch(/sci/i);
  });

  it('produces 50 SVGs', () => {
    const items = generateMany({ theme: sciFi, baseSeed: 's', count: 50, size: 64 });
    expect(items).toHaveLength(50);
    expect(generateOne({ theme: sciFi, seed: 'x', size: 64 }).startsWith('<svg ')).toBe(true);
  });

  it('declares sci-fi tags', () => {
    expect(sciFi.tags).toContain('hud');
  });
});
```

- [ ] **Step 3: Run test — expect FAIL**

Run: `pnpm --filter @procforge/theme-sci-fi test`

- [ ] **Step 4: Implement theme**

```ts
// packages/themes/sci-fi/src/index.ts
import {
  defineTheme,
  definePalette,
  circle,
  polygon,
  path,
  star,
  layer,
  mask,
  type Theme,
} from '@procforge/core';

const palette = definePalette({
  id: 'sci-fi',
  primary: ['#0fa3b1', '#1d6e7a', '#0a4854'],
  secondary: ['#ff3864', '#c91341', '#7a0a25'],
  accent: ['#fcf6bd', '#f4d35e', '#e8c547'],
  neutral: ['#0b1623', '#1e2d3f', '#cfd8e3'],
});

export const sciFi: Theme = defineTheme({
  id: 'sci-fi',
  displayName: 'Sci-Fi / Cyberpunk',
  palette,
  primitives: [circle, polygon, path, star],
  composers: [layer, mask],
  tags: ['hud', 'gun', 'chip', 'energy', 'sci-fi', 'cyberpunk'],
});
```

- [ ] **Step 5: Install + test + build**

```bash
pnpm install
pnpm --filter @procforge/theme-sci-fi test
pnpm --filter @procforge/theme-sci-fi build
```

- [ ] **Step 6: Add as CLI dependency**

Update `packages/cli/package.json` `dependencies`:

```json
"@procforge/theme-sci-fi": "workspace:*"
```

Update `packages/cli/src/cli.ts`:

```ts
import { sciFi } from '@procforge/theme-sci-fi';
// ...
const THEMES: Record<string, Theme> = {
  'medieval-fantasy': medievalFantasy,
  'sci-fi': sciFi,
};
```

Run `pnpm install && pnpm --filter @procforge/cli build && node packages/cli/dist/cli.js --theme sci-fi --count 5 --out .smoke-cli --sizes 64`. Verify 5 sci-fi icons render.

- [ ] **Step 7: Commit**

```bash
git add packages/themes/sci-fi packages/cli/package.json packages/cli/src/cli.ts pnpm-lock.yaml
git commit -m "feat(theme-sci-fi): palette + theme + CLI wiring"
```

---

### Task 26: `cozy-farm` theme

**Files:**
- Create: `packages/themes/cozy-farm/{package.json,tsconfig.json,vitest.config.ts,tsup.config.ts,src/index.ts,tests/index.test.ts}`

- [ ] **Step 1: Create package files** — mirror Task 25 with name `@procforge/theme-cozy-farm`.

- [ ] **Step 2: Write failing test**

```ts
// packages/themes/cozy-farm/tests/index.test.ts
import { describe, it, expect } from 'vitest';
import { generateOne, generateMany } from '@procforge/core';
import { cozyFarm } from '../src/index';

describe('cozyFarm theme', () => {
  it('exports a Theme with id "cozy-farm"', () => {
    expect(cozyFarm.id).toBe('cozy-farm');
  });
  it('produces 50 SVGs', () => {
    const items = generateMany({ theme: cozyFarm, baseSeed: 'c', count: 50, size: 64 });
    expect(items).toHaveLength(50);
    expect(generateOne({ theme: cozyFarm, seed: 'x', size: 64 }).startsWith('<svg ')).toBe(true);
  });
  it('declares cozy tags', () => {
    expect(cozyFarm.tags).toContain('food');
  });
});
```

- [ ] **Step 3: Run test — expect FAIL**

- [ ] **Step 4: Implement theme**

```ts
// packages/themes/cozy-farm/src/index.ts
import {
  defineTheme,
  definePalette,
  circle,
  polygon,
  path,
  star,
  layer,
  mask,
  type Theme,
} from '@procforge/core';

const palette = definePalette({
  id: 'cozy-farm',
  primary: ['#f4a261', '#e76f51', '#e9c46a'],
  secondary: ['#a3b18a', '#588157', '#3a5a40'],
  accent: ['#ffb4a2', '#e5989b', '#b5838d'],
  neutral: ['#3d3027', '#5e4b3c', '#fff8e7'],
});

export const cozyFarm: Theme = defineTheme({
  id: 'cozy-farm',
  displayName: 'Cozy Farm',
  palette,
  primitives: [circle, polygon, path, star],
  composers: [layer, mask],
  tags: ['food', 'seed', 'tool', 'animal', 'cozy', 'farm'],
});
```

- [ ] **Step 5: Install + test + build**

```bash
pnpm install
pnpm --filter @procforge/theme-cozy-farm test
pnpm --filter @procforge/theme-cozy-farm build
```

- [ ] **Step 6: Wire into CLI**

Add to `packages/cli/package.json` deps: `"@procforge/theme-cozy-farm": "workspace:*"`.
Add to `packages/cli/src/cli.ts`:

```ts
import { cozyFarm } from '@procforge/theme-cozy-farm';
// ...
const THEMES: Record<string, Theme> = {
  'medieval-fantasy': medievalFantasy,
  'sci-fi': sciFi,
  'cozy-farm': cozyFarm,
};
```

Verify: `pnpm install && pnpm --filter @procforge/cli build && node packages/cli/dist/cli.js --theme cozy-farm --count 5 --out .smoke-cli --sizes 64`.

- [ ] **Step 7: Commit**

```bash
git add packages/themes/cozy-farm packages/cli/package.json packages/cli/src/cli.ts pnpm-lock.yaml
git commit -m "feat(theme-cozy-farm): palette + theme + CLI wiring"
```

---

### Task 27: `roguelike-inventory` theme

**Files:**
- Create: `packages/themes/roguelike-inventory/{package.json,tsconfig.json,vitest.config.ts,tsup.config.ts,src/index.ts,tests/index.test.ts}`

- [ ] **Step 1: Create package files** — mirror Task 25 with name `@procforge/theme-roguelike-inventory`.

- [ ] **Step 2: Write failing test**

```ts
// packages/themes/roguelike-inventory/tests/index.test.ts
import { describe, it, expect } from 'vitest';
import { generateOne, generateMany } from '@procforge/core';
import { roguelikeInventory } from '../src/index';

describe('roguelikeInventory theme', () => {
  it('exports a Theme with id "roguelike-inventory"', () => {
    expect(roguelikeInventory.id).toBe('roguelike-inventory');
  });
  it('produces 50 SVGs', () => {
    const items = generateMany({
      theme: roguelikeInventory,
      baseSeed: 'r',
      count: 50,
      size: 64,
    });
    expect(items).toHaveLength(50);
    expect(generateOne({ theme: roguelikeInventory, seed: 'x', size: 64 }).startsWith('<svg ')).toBe(
      true,
    );
  });
  it('declares roguelike tags', () => {
    expect(roguelikeInventory.tags).toContain('inventory');
  });
});
```

- [ ] **Step 3: Run test — expect FAIL**

- [ ] **Step 4: Implement theme**

```ts
// packages/themes/roguelike-inventory/src/index.ts
import {
  defineTheme,
  definePalette,
  circle,
  polygon,
  path,
  star,
  layer,
  mask,
  type Theme,
} from '@procforge/core';

const palette = definePalette({
  id: 'roguelike-inventory',
  primary: ['#7d4f50', '#a87c5a', '#d4a373'],
  secondary: ['#3a4f41', '#557c63', '#8aab8e'],
  accent: ['#c9a961', '#f2d49b', '#f7b801'],
  neutral: ['#181a1f', '#2c2f37', '#e6e6e6'],
});

export const roguelikeInventory: Theme = defineTheme({
  id: 'roguelike-inventory',
  displayName: 'Roguelike Inventory',
  palette,
  primitives: [circle, polygon, path, star],
  composers: [layer, mask],
  tags: ['inventory', 'item', 'potion', 'rune', 'roguelike', 'rpg'],
});
```

- [ ] **Step 5: Install + test + build**

```bash
pnpm install
pnpm --filter @procforge/theme-roguelike-inventory test
pnpm --filter @procforge/theme-roguelike-inventory build
```

- [ ] **Step 6: Wire into CLI**

Add to `packages/cli/package.json` deps: `"@procforge/theme-roguelike-inventory": "workspace:*"`.
Add to `packages/cli/src/cli.ts`:

```ts
import { roguelikeInventory } from '@procforge/theme-roguelike-inventory';
// ...
const THEMES: Record<string, Theme> = {
  'medieval-fantasy': medievalFantasy,
  'sci-fi': sciFi,
  'cozy-farm': cozyFarm,
  'roguelike-inventory': roguelikeInventory,
};
```

Verify: `pnpm install && pnpm --filter @procforge/cli build && node packages/cli/dist/cli.js --theme roguelike-inventory --count 5 --out .smoke-cli --sizes 64`.

- [ ] **Step 7: Commit**

```bash
git add packages/themes/roguelike-inventory packages/cli/package.json packages/cli/src/cli.ts pnpm-lock.yaml
git commit -m "feat(theme-roguelike-inventory): palette + theme + CLI wiring"
```

---

## Web Preview

### Task 28: `@procforge/web-preview` Vite scaffolding

**Files:**
- Create: `packages/web-preview/package.json`
- Create: `packages/web-preview/tsconfig.json`
- Create: `packages/web-preview/vite.config.ts`
- Create: `packages/web-preview/index.html`
- Create: `packages/web-preview/src/main.ts`
- Create: `packages/web-preview/src/styles.css`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "@procforge/web-preview",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest run --passWithNoTests"
  },
  "dependencies": {
    "@procforge/core": "workspace:*",
    "@procforge/theme-medieval-fantasy": "workspace:*",
    "@procforge/theme-sci-fi": "workspace:*",
    "@procforge/theme-cozy-farm": "workspace:*",
    "@procforge/theme-roguelike-inventory": "workspace:*"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Write `tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Write `vite.config.ts`**

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',                       // itch HTML5 expects relative paths
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    assetsInlineLimit: 100_000,     // inline most assets to keep bundle compact
  },
});
```

- [ ] **Step 4: Write `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Procforge Icons — Live Preview</title>
    <link rel="stylesheet" href="/src/styles.css" />
  </head>
  <body>
    <main id="app"></main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 5: Write `src/styles.css`**

```css
* { box-sizing: border-box; }
body {
  margin: 0;
  background: #1a1a2e;
  color: #e6e6e6;
  font-family: system-ui, sans-serif;
}
main { display: flex; flex-direction: column; gap: 12px; padding: 12px; min-height: 100vh; }
.controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.controls label { display: flex; flex-direction: column; font-size: 12px; gap: 2px; }
.controls input, .controls select, .controls button {
  background: #0f1525; color: inherit; border: 1px solid #3a3f5a;
  border-radius: 4px; padding: 6px 8px; font: inherit;
}
.controls button { cursor: pointer; }
.controls button:hover { background: #1a2240; }
.gallery {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: 6px; flex: 1;
}
.gallery .cell {
  background: #fff; border-radius: 4px; aspect-ratio: 1; cursor: pointer;
  display: grid; place-items: center; padding: 4px;
}
.gallery .cell svg { width: 100%; height: 100%; }
.empty { color: #888; text-align: center; padding: 40px; }
```

- [ ] **Step 6: Write a minimal `src/main.ts` (controls + gallery come in next tasks)**

```ts
// packages/web-preview/src/main.ts
const root = document.getElementById('app')!;
root.innerHTML = '<div class="empty">Wiring up…</div>';
```

- [ ] **Step 7: Install + dev sanity**

```bash
pnpm install
pnpm --filter @procforge/web-preview dev
```

Open the printed localhost URL. Expected: dark page with "Wiring up…". Stop the dev server.

- [ ] **Step 8: Commit**

```bash
git add packages/web-preview pnpm-lock.yaml
git commit -m "feat(web-preview): Vite scaffolding"
```

---

### Task 29: Web controls (theme/seed/count form)

**Files:**
- Create: `packages/web-preview/src/controls.ts`
- Modify: `packages/web-preview/src/main.ts`

- [ ] **Step 1: Write `controls.ts`**

```ts
// packages/web-preview/src/controls.ts
import type { Theme } from '@procforge/core';

export interface ControlState {
  themeId: string;
  seed: string;
  count: number;
  size: number;
}

export interface ControlsHandle {
  element: HTMLElement;
  getState(): ControlState;
  onChange(handler: (s: ControlState) => void): void;
  randomiseSeed(): void;
}

export function createControls(themes: Theme[]): ControlsHandle {
  const el = document.createElement('div');
  el.className = 'controls';
  el.innerHTML = `
    <label>Theme<select data-k="themeId">${themes
      .map((t) => `<option value="${t.id}">${t.displayName}</option>`)
      .join('')}</select></label>
    <label>Seed<input data-k="seed" type="text" value="pf"></label>
    <label>Count<input data-k="count" type="number" min="1" max="200" value="64"></label>
    <label>Size<select data-k="size">
      <option value="64">64</option><option value="128">128</option>
      <option value="32">32</option><option value="16">16</option>
    </select></label>
    <button data-action="random">🎲 Randomise seed</button>
    <button data-action="regen">Regenerate</button>
  `;

  const handlers: ((s: ControlState) => void)[] = [];

  function getState(): ControlState {
    const get = (k: string) => (el.querySelector(`[data-k="${k}"]`) as HTMLInputElement).value;
    return {
      themeId: get('themeId'),
      seed: get('seed'),
      count: Number(get('count')),
      size: Number(get('size')),
    };
  }

  function fire(): void {
    const s = getState();
    for (const h of handlers) h(s);
  }

  el.addEventListener('change', fire);
  el.querySelector('[data-action="regen"]')!.addEventListener('click', fire);
  el.querySelector('[data-action="random"]')!.addEventListener('click', () => {
    (el.querySelector('[data-k="seed"]') as HTMLInputElement).value = Math.random()
      .toString(36)
      .slice(2, 9);
    fire();
  });

  return {
    element: el,
    getState,
    onChange(h) {
      handlers.push(h);
    },
    randomiseSeed() {
      (el.querySelector('[data-action="random"]') as HTMLButtonElement).click();
    },
  };
}
```

- [ ] **Step 2: Wire into `main.ts`**

```ts
// packages/web-preview/src/main.ts
import { medievalFantasy } from '@procforge/theme-medieval-fantasy';
import { sciFi } from '@procforge/theme-sci-fi';
import { cozyFarm } from '@procforge/theme-cozy-farm';
import { roguelikeInventory } from '@procforge/theme-roguelike-inventory';
import { createControls } from './controls';

const themes = [medievalFantasy, sciFi, cozyFarm, roguelikeInventory];

const root = document.getElementById('app')!;
const controls = createControls(themes);
root.appendChild(controls.element);

const status = document.createElement('div');
status.className = 'empty';
status.textContent = 'Gallery will appear here';
root.appendChild(status);

controls.onChange((s) => {
  status.textContent = `Selected: ${s.themeId} / seed ${s.seed} / ${s.count} icons / ${s.size}px`;
});
```

- [ ] **Step 3: Dev sanity**

```bash
pnpm --filter @procforge/web-preview dev
```

Open URL. Verify the controls render and changing values updates the status line. Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add packages/web-preview/src/controls.ts packages/web-preview/src/main.ts
git commit -m "feat(web-preview): control panel (theme/seed/count/size)"
```

---

### Task 30: Web gallery + single-icon download

**Files:**
- Create: `packages/web-preview/src/gallery.ts`
- Modify: `packages/web-preview/src/main.ts`

- [ ] **Step 1: Write `gallery.ts`**

```ts
// packages/web-preview/src/gallery.ts
import { generateMany, type Theme } from '@procforge/core';

export interface GalleryHandle {
  element: HTMLElement;
  render(theme: Theme, baseSeed: string, count: number, size: number): void;
}

export function createGallery(): GalleryHandle {
  const el = document.createElement('div');
  el.className = 'gallery';

  function render(theme: Theme, baseSeed: string, count: number, size: number): void {
    const items = generateMany({ theme, baseSeed, count, size });
    el.innerHTML = '';
    for (const { seed, svg } of items) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.title = `${theme.id}/${seed} — click to download SVG`;
      cell.innerHTML = svg;
      cell.addEventListener('click', () => downloadSvg(`${theme.id}-${seed}.svg`, svg));
      el.appendChild(cell);
    }
  }

  return { element: el, render };
}

function downloadSvg(filename: string, svg: string): void {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
```

- [ ] **Step 2: Update `main.ts` to use the gallery**

```ts
// packages/web-preview/src/main.ts
import type { Theme } from '@procforge/core';
import { medievalFantasy } from '@procforge/theme-medieval-fantasy';
import { sciFi } from '@procforge/theme-sci-fi';
import { cozyFarm } from '@procforge/theme-cozy-farm';
import { roguelikeInventory } from '@procforge/theme-roguelike-inventory';
import { createControls } from './controls';
import { createGallery } from './gallery';

const themes: Theme[] = [medievalFantasy, sciFi, cozyFarm, roguelikeInventory];
const themesById = new Map(themes.map((t) => [t.id, t]));

const root = document.getElementById('app')!;
const controls = createControls(themes);
const gallery = createGallery();
root.appendChild(controls.element);
root.appendChild(gallery.element);

function refresh(): void {
  const s = controls.getState();
  const theme = themesById.get(s.themeId);
  if (!theme) return;
  gallery.render(theme, s.seed, s.count, s.size);
}

controls.onChange(refresh);
refresh();
```

- [ ] **Step 3: Dev sanity**

```bash
pnpm --filter @procforge/web-preview dev
```

Verify:
- 64 icons of medieval-fantasy render in a grid.
- Clicking any cell downloads an `.svg` file.
- Switching theme regenerates the gallery.
- "🎲 Randomise seed" reshuffles.

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add packages/web-preview/src/gallery.ts packages/web-preview/src/main.ts
git commit -m "feat(web-preview): live gallery + click-to-download SVG"
```

---

### Task 31: Web build verification (itch HTML5 size budget)

itch HTML5 uploads cap at ~50 MB but smaller is much better; we target < 1 MB for the entire bundle.

**Files:**
- Create: `packages/web-preview/scripts/check-size.mjs`

- [ ] **Step 1: Build production bundle**

```bash
pnpm --filter @procforge/web-preview build
```

Expected: `packages/web-preview/dist/` contains `index.html` + JS/CSS assets.

- [ ] **Step 2: Write size check script**

```js
// packages/web-preview/scripts/check-size.mjs
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dir = new URL('../dist/', import.meta.url).pathname;
const limit = 1_000_000; // 1 MB

let total = 0;
const breakdown = [];

function walk(d) {
  for (const name of readdirSync(d, { withFileTypes: true })) {
    const full = join(d, name.name);
    if (name.isDirectory()) walk(full);
    else {
      const sz = statSync(full).size;
      total += sz;
      breakdown.push({ file: full.slice(dir.length), bytes: sz });
    }
  }
}
walk(dir);

breakdown.sort((a, b) => b.bytes - a.bytes);
for (const b of breakdown) console.log(`${b.bytes.toString().padStart(8)}  ${b.file}`);
console.log(`---\n${total.toString().padStart(8)}  TOTAL  (limit ${limit})`);
if (total > limit) {
  console.error(`FAIL: bundle exceeds ${limit} bytes`);
  process.exit(1);
}
console.log('OK: under budget');
```

- [ ] **Step 3: Run check**

```bash
node packages/web-preview/scripts/check-size.mjs
```

Expected: prints file breakdown + "OK: under budget". If FAIL, identify the largest contributor and either tree-shake (avoid importing modules whose code is unused at runtime) or reduce theme count in the embed (the embed doesn't need all themes — but Phase 1 ships all 4).

- [ ] **Step 4: Verify itch HTML5 packaging**

Per itch HTML5 requirements, the embed must be a single zip with `index.html` at root.

```bash
cd packages/web-preview/dist
zip -r ../web-preview-html5.zip .
cd ../../..
ls -lh packages/web-preview/web-preview-html5.zip
```

Expected: zip exists, < 1 MB. (Manual itch upload test happens during launch, not here.)

- [ ] **Step 5: Add `web-preview-html5.zip` to `.gitignore`**

```
packages/web-preview/web-preview-html5.zip
packages/web-preview/dist/
```

- [ ] **Step 6: Commit**

```bash
git add packages/web-preview/scripts .gitignore
git commit -m "chore(web-preview): bundle size budget check"
```

---

## Starter Pack Production

### Task 32: `produce-starter-pack.ts` script

This script generates the 200-icon starter pack (50 per theme × 4 themes), writes the offline gallery, and zips everything for upload.

**Files:**
- Create: `scripts/produce-starter-pack.ts`

- [ ] **Step 1: Write the production script**

```ts
// scripts/produce-starter-pack.ts
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { generateMany, type Theme } from '@procforge/core';
import { renderSvgToPng } from '@procforge/cli/render';
import { medievalFantasy } from '@procforge/theme-medieval-fantasy';
import { sciFi } from '@procforge/theme-sci-fi';
import { cozyFarm } from '@procforge/theme-cozy-farm';
import { roguelikeInventory } from '@procforge/theme-roguelike-inventory';
import JSZip from 'jszip';
import { readFileSync, readdirSync, statSync } from 'node:fs';

const THEMES: Theme[] = [medievalFantasy, sciFi, cozyFarm, roguelikeInventory];
const ICONS_PER_THEME = 50;
const SIZES = [16, 32, 64, 128, 256];
const OUT_DIR = 'starter-pack';
const ZIP_PATH = 'starter-pack.zip';

interface ManifestIcon {
  theme: string;
  seed: string;
  svg: string;
  png: Record<string, string>;
}

async function main(): Promise<void> {
  if (existsSync(OUT_DIR)) await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const allIcons: ManifestIcon[] = [];
  for (const theme of THEMES) {
    console.log(`Generating ${ICONS_PER_THEME} icons for ${theme.id}…`);
    await mkdir(join(OUT_DIR, 'svg', theme.id), { recursive: true });
    for (const size of SIZES) {
      await mkdir(join(OUT_DIR, 'png', String(size), theme.id), { recursive: true });
    }
    const items = generateMany({ theme, baseSeed: 'pf', count: ICONS_PER_THEME, size: 64 });
    for (const { seed, svg } of items) {
      const svgRel = join('svg', theme.id, `${seed}.svg`);
      await writeFile(join(OUT_DIR, svgRel), svg, 'utf8');
      const png: Record<string, string> = {};
      for (const size of SIZES) {
        const pngRel = join('png', String(size), theme.id, `${seed}.png`);
        const buf = await renderSvgToPng(svg, size);
        await writeFile(join(OUT_DIR, pngRel), buf);
        png[String(size)] = pngRel;
      }
      allIcons.push({ theme: theme.id, seed, svg: svgRel, png });
    }
  }

  // manifest.json
  const manifest = {
    name: 'Procforge Icons starter pack',
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    themes: THEMES.map((t) => ({ id: t.id, displayName: t.displayName, tags: t.tags })),
    sizes: SIZES,
    iconCount: allIcons.length,
    icons: allIcons,
  };
  await writeFile(join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  // index.html (offline gallery)
  const galleryRows = THEMES.map((t) => {
    const icons = allIcons.filter((i) => i.theme === t.id);
    const cells = icons
      .map((i) => `<img src="${i.svg}" title="${i.seed}" alt="${i.seed}">`)
      .join('');
    return `<section><h2>${t.displayName} <small>(${icons.length})</small></h2><div class="grid">${cells}</div></section>`;
  }).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8">
<title>Procforge Icons — Starter Pack</title><style>
body{margin:0;background:#1a1a2e;color:#e6e6e6;font-family:system-ui,sans-serif;padding:16px}
section{margin-bottom:24px}
h2{color:#fff} small{color:#888;font-weight:normal}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:6px}
.grid img{background:#fff;border-radius:4px;width:100%;aspect-ratio:1;padding:4px;box-sizing:border-box}
</style></head><body>
<h1>Procforge Icons — 200 procedural game icons</h1>
<p>MIT licensed. Generator on GitHub.</p>
${galleryRows}
</body></html>`;
  await writeFile(join(OUT_DIR, 'index.html'), html, 'utf8');

  // README + LICENSE in pack
  await writeFile(
    join(OUT_DIR, 'README.md'),
    `# Procforge Icons — Starter Pack v1.0.0\n\n200 procedural game icons across 4 themes:\n\n${THEMES.map(
      (t) => `- **${t.displayName}** (${ICONS_PER_THEME} icons)`,
    ).join('\n')}\n\nEach icon ships as scalable SVG plus PNG at ${SIZES.join(', ')}px.\n\n## License\nMIT — free for commercial and non-commercial use, attribution appreciated but not required.\n\n## Open-source generator\nhttps://github.com/procforge/icons\n`,
    'utf8',
  );
  await writeFile(
    join(OUT_DIR, 'LICENSE'),
    `MIT License\n\nCopyright (c) 2026 Procforge\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n`,
    'utf8',
  );

  // Zip the pack
  const zip = new JSZip();
  function addDir(d: string, prefix: string): void {
    for (const name of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, name.name);
      const rel = prefix ? `${prefix}/${name.name}` : name.name;
      if (name.isDirectory()) addDir(full, rel);
      else zip.file(rel, readFileSync(full));
    }
  }
  addDir(OUT_DIR, '');
  const zipBuf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  await writeFile(ZIP_PATH, zipBuf);

  const sz = statSync(ZIP_PATH).size;
  console.log(`\n✓ Starter pack: ${allIcons.length} icons, zip ${(sz / 1024 / 1024).toFixed(2)} MB → ${ZIP_PATH}`);
  if (sz > 6 * 1024 * 1024) {
    console.error(`WARN: zip exceeds 6 MB target (${sz} bytes)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Add `starter-pack.zip` to `.gitignore` (if not already)**

`.gitignore` should already contain `starter-pack.zip` from Task 1. Verify with `grep starter-pack.zip .gitignore`.

- [ ] **Step 3: Add workspace packages as root devDependencies (so the script can resolve them)**

```bash
pnpm add -Dw \
  @procforge/core@workspace:* \
  @procforge/cli@workspace:* \
  @procforge/theme-medieval-fantasy@workspace:* \
  @procforge/theme-sci-fi@workspace:* \
  @procforge/theme-cozy-farm@workspace:* \
  @procforge/theme-roguelike-inventory@workspace:* \
  jszip@^3.10.1
```

- [ ] **Step 4: Add a workspace script**

Edit root `package.json` `scripts`:

```json
"scripts": {
  "build": "pnpm -r --filter './packages/**' build",
  "test": "pnpm -r --filter './packages/**' test",
  "typecheck": "pnpm -r --filter './packages/**' typecheck",
  "lint": "eslint .",
  "format": "prettier --write .",
  "produce-pack": "tsx scripts/produce-starter-pack.ts"
}
```

- [ ] **Step 5: Commit**

```bash
git add scripts/produce-starter-pack.ts package.json pnpm-lock.yaml
git commit -m "chore: starter-pack production script"
```

---

### Task 33: `visual-qa-sample.ts` script

Sample 30 icons per theme into a single HTML page so a human reviewer can scroll through and spot anomalies before shipping.

**Files:**
- Create: `scripts/visual-qa-sample.ts`

- [ ] **Step 1: Write QA script**

```ts
// scripts/visual-qa-sample.ts
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { generateMany, type Theme } from '@procforge/core';
import { medievalFantasy } from '@procforge/theme-medieval-fantasy';
import { sciFi } from '@procforge/theme-sci-fi';
import { cozyFarm } from '@procforge/theme-cozy-farm';
import { roguelikeInventory } from '@procforge/theme-roguelike-inventory';

const THEMES: Theme[] = [medievalFantasy, sciFi, cozyFarm, roguelikeInventory];
const SAMPLE = 30;
const OUT = '.qa-sample';

async function main(): Promise<void> {
  await mkdir(OUT, { recursive: true });

  const sections: string[] = [];
  for (const t of THEMES) {
    const items = generateMany({ theme: t, baseSeed: 'qa', count: SAMPLE, size: 128 });
    const cells = items
      .map(
        (i) =>
          `<figure><div class="ic">${i.svg}</div><figcaption>${i.seed}</figcaption></figure>`,
      )
      .join('');
    sections.push(
      `<section><h2>${t.displayName}</h2><div class="grid">${cells}</div></section>`,
    );
  }

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Procforge QA</title>
<style>
body{margin:0;background:#0e1118;color:#ddd;font-family:system-ui,sans-serif;padding:16px}
section{margin-bottom:32px} h2{color:#fff;border-bottom:1px solid #333;padding-bottom:6px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px}
figure{margin:0;background:#1a1f2c;border-radius:6px;padding:8px;text-align:center}
.ic{background:#fff;border-radius:4px;aspect-ratio:1;display:grid;place-items:center}
.ic svg{width:100%;height:100%}
figcaption{font-size:11px;color:#888;margin-top:4px;word-break:break-all}
</style></head><body>
<h1>Visual QA — 30 icons per theme</h1>
<p>Scan for: blank icons, palette anomalies, shapes outside the 128px box, near-duplicates.</p>
${sections.join('\n')}
</body></html>`;
  await writeFile(join(OUT, 'index.html'), html, 'utf8');
  console.log(`Wrote QA sample → ${join(OUT, 'index.html')}. Open in browser.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Add `.qa-sample/` to `.gitignore`**

```
.qa-sample/
```

- [ ] **Step 3: Add workspace script**

Add to root `package.json` `scripts`:

```json
"qa-sample": "tsx scripts/visual-qa-sample.ts"
```

- [ ] **Step 4: Commit**

```bash
git add scripts/visual-qa-sample.ts .gitignore package.json
git commit -m "chore: visual QA sample script"
```

---

### Task 34: Generate v1.0.0 starter pack

This is a manual ops task that uses the scripts from Tasks 32 and 33. It does NOT commit binary artefacts to git — only verifies they meet quality bars.

- [ ] **Step 1: Build everything**

```bash
pnpm install
pnpm build
```

Expected: every package's `dist/` is fresh.

- [ ] **Step 2: Run visual QA sample**

```bash
pnpm qa-sample
open .qa-sample/index.html
```

Manually inspect the page. Reject if you see:
- More than ~3 blank-ish icons per theme.
- Palette colors outside the declared theme palette.
- Shapes clipped at the boundary in more than ~3 icons per theme.
- Visible duplicates (same composition + same colors).

If rejection criteria fire, return to the relevant theme task and tighten primitive/composer ranges. Re-run QA. Iterate until accepted.

- [ ] **Step 3: Run full pack production**

```bash
pnpm produce-pack
```

Expected output:
- `starter-pack/` directory with `svg/`, `png/{16,32,64,128,256}/`, `index.html`, `manifest.json`, `README.md`, `LICENSE`.
- `starter-pack.zip` in repo root.
- Final summary line: `✓ Starter pack: 200 icons, zip X.XX MB → starter-pack.zip`.
- WARN line should NOT appear (zip should be < 6 MB).

- [ ] **Step 4: Verify pack**

```bash
unzip -l starter-pack.zip | head
ls starter-pack/svg/
ls starter-pack/png/64/medieval-fantasy/ | wc -l    # expect 50
open starter-pack/index.html                         # browse the gallery
```

Verify the offline `index.html` shows all 200 icons grouped by theme.

- [ ] **Step 5: No commit (artefacts are gitignored)**

The pack ships via GitHub Releases (Task 42), not committed to the repo.

---

## Documentation

### Task 35: Top-level `README.md`

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# Procforge Icons

> 200 hand-coded procedural game icons + open-source generator. No AI, infinite variants, MIT-licensed.

[![CI](https://github.com/procforge/icons/actions/workflows/ci.yml/badge.svg)](https://github.com/procforge/icons/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Live preview & free download:** [procforge.itch.io/icons](https://procforge.itch.io/icons)

## What this is

A TypeScript monorepo that procedurally generates SVG game icons across 4 themes:

- 🗡️ Medieval Fantasy
- 🚀 Sci-Fi / Cyberpunk
- 🌾 Cozy Farm
- 🎒 Roguelike Inventory

The output is a `starter-pack.zip` containing 200 SVG + PNG icons, free to use under MIT (commercial use OK).

## Why it exists

itch.io's new-uploads feed is being flooded with AI-generated assets. Procforge is the opposite: every icon comes from hand-written algorithms you can read, fork, and re-run.

## Quick start (use the icons)

Grab `starter-pack.zip` from the [latest release](https://github.com/procforge/icons/releases) or from the [itch.io listing](https://procforge.itch.io/icons). Unzip and use.

## Quick start (use the generator)

```bash
pnpm install
pnpm build
node packages/cli/dist/cli.js \
  --theme medieval-fantasy --count 50 --seed myseed --out my-icons --sizes 64,128
```

See [`docs/USAGE.md`](docs/USAGE.md) for full CLI reference.

## Quick start (web preview)

```bash
pnpm --filter @procforge/web-preview dev
```

Opens a live in-browser generator at `http://localhost:5173`.

## Repo layout

| Path | Contents |
|---|---|
| `packages/core` | Generator engine (pure, no IO) |
| `packages/themes/*` | 4 themes as plug-in packages |
| `packages/cli` | `icongen` CLI for batch generation + zip packaging |
| `packages/web-preview` | Vite SPA, embeddable as itch HTML5 |
| `scripts/produce-starter-pack.ts` | Builds the official 200-icon pack |
| `docs/` | Architecture, usage, theme authoring |

## License

MIT — see [LICENSE](LICENSE). Commercial use of the generated icons is permitted with no attribution requirement; attribution is appreciated.

## Contributing

Issues and PRs welcome. New theme proposals: see [`docs/THEME-AUTHORING.md`](docs/THEME-AUTHORING.md).
```

- [ ] **Step 2: Add top-level `LICENSE`**

```bash
cp packages/core/LICENSE LICENSE 2>/dev/null || cat > LICENSE <<'EOF'
MIT License

Copyright (c) 2026 Procforge

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
```

- [ ] **Step 3: Commit**

```bash
git add README.md LICENSE
git commit -m "docs: top-level README + LICENSE"
```

---

### Task 36: `docs/USAGE.md`

**Files:**
- Create: `docs/USAGE.md`

- [ ] **Step 1: Write `USAGE.md`**

```markdown
# Procforge Icons — Usage

## Just want the icons

Download `starter-pack.zip` from [itch](https://procforge.itch.io/icons) or the [latest GitHub release](https://github.com/procforge/icons/releases).

Inside:

```
svg/{theme}/{seed}.svg              # Vector source
png/{16,32,64,128,256}/{theme}/{seed}.png   # Rasterised
manifest.json                        # seed → file paths metadata
index.html                           # Offline gallery
README.md
LICENSE                              # MIT
```

Drop the files into your game project. No attribution required.

## Generate your own (CLI)

### Install

```bash
git clone https://github.com/procforge/icons
cd icons
pnpm install
pnpm build
```

### Generate a single theme

```bash
node packages/cli/dist/cli.js \
  --theme medieval-fantasy \
  --seed myseed \
  --count 50 \
  --sizes 64,128 \
  --out output
```

### Available themes

| ID | Display name | Tags |
|---|---|---|
| `medieval-fantasy` | Medieval Fantasy | weapon, potion, shield, scroll |
| `sci-fi` | Sci-Fi / Cyberpunk | hud, gun, chip, energy |
| `cozy-farm` | Cozy Farm | food, seed, tool, animal |
| `roguelike-inventory` | Roguelike Inventory | inventory, item, potion, rune |

### CLI flags

| Flag | Alias | Default | Description |
|---|---|---|---|
| `--theme` | `-t` | `medieval-fantasy` | Theme ID (see table above) |
| `--seed` | `-s` | `pf` | Base seed string. Same seed → same icons. |
| `--count` | `-n` | `50` | Number of icons to generate |
| `--sizes` |  | `16,32,64,128,256` | Comma-separated PNG sizes |
| `--out` | `-o` | `out` | Output directory |

### Output structure

```
out/
  svg/{theme}/{seed-0000}.svg
  png/{size}/{theme}/{seed-0000}.png
  manifest.json
```

## Generate from your own code

```ts
import { generateMany } from '@procforge/core';
import { medievalFantasy } from '@procforge/theme-medieval-fantasy';

const icons = generateMany({
  theme: medievalFantasy,
  baseSeed: 'mygame',
  count: 100,
  size: 64,
});

for (const { seed, svg } of icons) {
  console.log(seed, svg);
}
```

## Web preview

```bash
pnpm --filter @procforge/web-preview dev
```

Live preview at `http://localhost:5173` with theme/seed/count controls and click-to-download.

## Reproducibility

The same `(theme.id, seed)` always produces the same SVG, regardless of platform or version (as long as the theme module is unchanged). This is the procgen guarantee.
```

- [ ] **Step 2: Commit**

```bash
git add docs/USAGE.md
git commit -m "docs: end-user usage guide"
```

---

### Task 37: `docs/THEME-AUTHORING.md`

**Files:**
- Create: `docs/THEME-AUTHORING.md`

- [ ] **Step 1: Write the theme-authoring guide**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add docs/THEME-AUTHORING.md
git commit -m "docs: theme authoring guide"
```

---

### Task 38: `docs/ARCHITECTURE.md`

**Files:**
- Create: `docs/ARCHITECTURE.md`

- [ ] **Step 1: Write architecture doc**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add docs/ARCHITECTURE.md
git commit -m "docs: architecture overview"
```

---

## Listing Text

### Task 39: `itch-page/description.md`

**Files:**
- Create: `itch-page/description.md`

- [ ] **Step 1: Write the itch listing description**

```markdown
# Procforge Icons — 200 procedural game icons + open source generator

**200 hand-coded procedural game icons + open-source generator. No AI, infinite variants, MIT-licensed.**

🎲 **Click "Run game" above to generate icons live in your browser.**

## What you get

- **200 icons** across 4 themes (50 per theme):
  - 🗡️ Medieval Fantasy — weapons, potions, shields, scrolls
  - 🚀 Sci-Fi / Cyberpunk — guns, chips, energy, HUD
  - 🌾 Cozy Farm — food, seeds, tools, animals
  - 🎒 Roguelike Inventory — items, runes, buffs
- **Scalable SVG** + rasterised PNG at 16, 32, 64, 128, 256 px
- **Offline HTML gallery** included
- **MIT license** — free for commercial and non-commercial use, no attribution required
- **Open-source generator** on [GitHub](https://github.com/procforge/icons) — fork it, run it, generate your own variants

## What's inside the pack

```
svg/{theme}/{seed}.svg
png/{16,32,64,128,256}/{theme}/{seed}.png
index.html         (offline gallery)
manifest.json      (seed → file paths)
README.md
LICENSE            (MIT)
```

## Use the generator

The pack is just the starting point. Clone the open-source generator to produce unlimited variants:

```bash
git clone https://github.com/procforge/icons
cd icons
pnpm install && pnpm build
node packages/cli/dist/cli.js --theme cozy-farm --count 200 --seed mygame
```

Same seed → same icons (deterministic). Different seed → different icons. Forever.

## Why "no AI"?

itch.io's new-uploads feed is being flooded with AI-generated assets. Procforge is the opposite: every icon comes from hand-written algorithms you can read on GitHub. No diffusion model, no LLM, just code.

## Roadmap

- **Phase 2 (May 2026):** Themed expansion packs — Weapons Mega, Cyberpunk UI, Cozy Everything, Roguelike Pro, Horror Occult ($4.99 each, $14.99 bundle)
- **Phase 3 (later):** Procforge Dungeons — procedural dungeon generator (Godot plugin)

Follow [@procforge](https://procforge.itch.io) here for updates.

## License

MIT — commercial use OK, no attribution required (but appreciated).

## Credits

Inspired by [Kenney](https://kenney.itch.io)'s open ethos. Built with ❤️ in TypeScript.

⭐ [Star us on GitHub](https://github.com/procforge/icons) | 💬 [Open an issue](https://github.com/procforge/icons/issues) for feedback or theme requests
```

- [ ] **Step 2: Commit**

```bash
git add itch-page/description.md
git commit -m "docs(itch): listing description for v1.0.0"
```

---

### Task 40: `itch-page/tags.md`

**Files:**
- Create: `itch-page/tags.md`

- [ ] **Step 1: Write tags reference**

```markdown
# itch.io Tags for Procforge Icons v1.0.0

Apply exactly these 10 tags when uploading. Order matters less than presence.

1. `icons`
2. `procedural-generation`
3. `vector`
4. `svg`
5. `open-source`
6. `inventory`
7. `rpg`
8. `fantasy`
9. `ui`
10. `free`

## Listing metadata

- **Title:** `Procforge Icons — 200 procedural game icons + open source generator`
- **Short text (180 char):** `200 hand-coded procedural game icons + open-source generator. No AI, infinite variants, MIT-licensed.`
- **Pricing:** Name your own price, suggested $0, minimum $0
- **Classification:** Game assets
- **Genre:** N/A (asset pack)
- **Platforms:** HTML5 (web preview embed), downloadable (zip)

## Asset uploads

| File | Type | Notes |
|---|---|---|
| `starter-pack.zip` | Downloadable | Primary product (~5 MB) |
| `web-preview-html5.zip` | HTML5 playable | Live generator embed (~< 1 MB) |
| `cover.png` | Cover image (315×250 + 630×500) | Produced separately — see Phase 1 cover-art runbook |
| `screenshots/*.png` | 5 screenshots | Produced separately |
| `demo.gif` | First image attachment | Produced separately |
```

- [ ] **Step 2: Commit**

```bash
git add itch-page/tags.md
git commit -m "docs(itch): tags + metadata reference"
```

---

### Task 41: 4 devlog templates

**Files:**
- Create: `itch-page/devlog-templates/01-launch.md`
- Create: `itch-page/devlog-templates/02-typescript.md`
- Create: `itch-page/devlog-templates/03-community-themes.md`
- Create: `itch-page/devlog-templates/04-phase2-teaser.md`

- [ ] **Step 1: Write `01-launch.md`**

```markdown
# Devlog #1 — How I generated 200 icons procedurally

(Publish on D+3.)

## The problem

I wanted to ship a free icon pack for indie game devs, but I'm not an artist. The two obvious paths — hand-drawing or AI — both seemed wrong:

- **Hand-drawing** would produce ~10 icons before I gave up.
- **AI** would produce slop indistinguishable from the dozen "Anime Backgrounds Vol. 47" packs flooding new releases.

There's a third path: **write the algorithm**.

## The pipeline

Each icon comes from this simple loop:

1. Seed an RNG with `(theme + seed)`.
2. Pick a *composer* (layer, mask).
3. The composer picks 2–4 *primitives* (circle, polygon, path, star).
4. Each primitive emits an SVG element, sampling colors from the theme's palette.
5. Wrap in `<svg viewBox="0 0 64 64">` and write to disk.

200 icons = 4 themes × 50 seeds. Same seed always produces the same icon.

## The "No AI" pitch

I'm not anti-AI. I am anti-slop. Every icon Procforge ships came from code I wrote and you can read: [github.com/procforge/icons](https://github.com/procforge/icons). MIT, fork it, run it, generate your own.

## Stats so far

- Day 1: TBD downloads
- Day 1: TBD followers
- GitHub stars: TBD

## Next up

Phase 2: themed expansion packs (weapons, cyberpunk UI, cozy everything, roguelike pro, horror). $4.99 each, bundle for $14.99. Existing 200-icon pack stays free forever.

Follow for updates.
```

- [ ] **Step 2: Write `02-typescript.md`**

```markdown
# Devlog #2 — Why TypeScript instead of Python

(Publish on D+8.)

When I started Procforge I assumed Python: it's the procedural-generation lingua franca, the math libs are abundant, and the community is right at home with seedable RNGs.

I picked TypeScript instead. Three reasons:

## 1. The same code runs in the browser

The itch.io listing has a live generator embedded as an HTML5 page. Visitors click "Run game" and watch icons regenerate in real time, with theme/seed controls. That conversion lift is enormous — almost no asset pack on itch offers in-page interactivity.

If I'd written the generator in Python I'd have built two separate codebases (Python for the CLI, JS for the embed) and they'd drift.

## 2. Buyers can read the source

Most game devs who'd care about a procedural icon generator are comfortable with JS. They aren't all Python literate. Lowering the barrier to "read and fork the algorithm" is core to the open-source positioning.

## 3. SVG is a string-manipulation problem

There's no need for numpy or geometry libs. Every primitive is `(rng, palette, size) => svgString`. TypeScript handles this natively, with strict types catching shape mistakes at compile time.

## Trade-offs I accepted

- No scientific Python ecosystem (numpy / scipy) — but icons don't need it.
- Smaller procgen community on the TS side — but the algorithms are simple.
- npm dep tree noise — pnpm + a tight `dependencies` list keeps it manageable.

Repo: [github.com/procforge/icons](https://github.com/procforge/icons). The whole pipeline is a few hundred lines of TS.
```

- [ ] **Step 3: Write `03-community-themes.md`**

```markdown
# Devlog #3 — Adding 50 more icons, themed by community votes

(Publish on D+15.)

The first week of downloads gave us the strongest signal possible: which themes people actually wanted.

## What I'm shipping in v1.1

I'm extending each of the 4 themes with 50 more icons (total: 400). The seed namespace expands from `pf-0000…0049` to `pf-0000…0099` — your existing seeds still work, you just get more variety.

## What's coming in Phase 2 (themed expansion packs)

Vote in the comments below or on the [GitHub poll](https://github.com/procforge/icons/issues/TBD):

- ⚔️ Weapons Mega — 300 weapons (sword, bow, gun, staff)
- 🌐 Cyberpunk UI — 250 HUD/grid/neon icons
- 🌻 Cozy Everything — 350 food/seed/furniture/pet icons
- 🎲 Roguelike Pro — 400 inventory/buff/status icons
- 🕯️ Horror Occult — 200 rune/creature/ritual icons

Order ships in vote order. First pack drops mid-May.

## Free pack stays free

The 400-icon starter pack remains MIT-licensed and free forever. Phase 2 packs are paid expansions, not paywalls — the base pack is enough to ship a real game.
```

- [ ] **Step 4: Write `04-phase2-teaser.md`**

```markdown
# Devlog #4 — What's next: Procforge Phase 2 expansion packs

(Publish on D+22.)

Procforge Icons hit its first month with [N downloads / M followers / K GitHub stars]. Thanks for trying it.

Here's what's next.

## Phase 2: themed expansion packs ($4.99 each)

Five packs, each 200–400 icons, scoped to one buyer profile:

| Pack | Icons | $ |
|---|---|---|
| Weapons Mega | 300 | 4.99 |
| Cyberpunk UI | 250 | 4.99 |
| Cozy Everything | 350 | 4.99 |
| Roguelike Pro | 400 | 4.99 |
| Horror Occult | 200 | 4.99 |
| **Megapack bundle** | **all 5** | **14.99** |

Same procedural generator, deeper theme-specific palettes and primitives, more icons per seed range, more variation.

## Phase 3 hint

After Phase 2 stabilises I'll start on **Procforge Dungeons** — a procedural dungeon generator (Godot plugin + standalone CLI). Same brand, same MIT-on-the-engine ethos, premium $19.99 product. ETA: late 2026.

## How to support the project

- ⭐ Star [the GitHub repo](https://github.com/procforge/icons)
- Buy a Phase 2 pack when they drop
- Open issues with theme requests / bug reports / feature ideas
- Tell another indie dev

The free pack stays free. The generator stays open. Everything else is bonus.
```

- [ ] **Step 5: Commit**

```bash
git add itch-page/devlog-templates
git commit -m "docs(itch): four devlog templates for first month"
```

---

## Release

### Task 42: Release workflow + v1.0.0 tag

**Files:**
- Create: `.github/workflows/release.yml`

- [ ] **Step 1: Write release workflow**

```yaml
name: release
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
      - run: pnpm produce-pack
      - name: Build web preview HTML5 zip
        run: |
          pnpm --filter @procforge/web-preview build
          cd packages/web-preview/dist
          zip -r ../../../web-preview-html5.zip .
      - name: Create GitHub Release with assets
        uses: softprops/action-gh-release@v2
        with:
          files: |
            starter-pack.zip
            web-preview-html5.zip
          generate_release_notes: true
          fail_on_unmatched_files: true
```

- [ ] **Step 2: Verify CI is green on `main`**

```bash
git push origin main
```

Open the GitHub Actions page in a browser. Wait for `ci` to pass green.

- [ ] **Step 3: Smoke-test the release locally before tagging**

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
pnpm produce-pack
pnpm --filter @procforge/web-preview build
node packages/web-preview/scripts/check-size.mjs
```

All commands must succeed and report green / under-budget. If any fail, stop here and fix the underlying issue — never tag a release on a broken main.

- [ ] **Step 4: Tag v1.0.0**

```bash
git tag -a v1.0.0 -m "Procforge Icons v1.0.0 — 200 procedural game icons + open-source generator"
git push origin v1.0.0
```

- [ ] **Step 5: Verify the release**

Open the GitHub Releases page. Wait for the `release` workflow to complete. Verify:
- `v1.0.0` release exists.
- `starter-pack.zip` attached, sane size (~3–6 MB).
- `web-preview-html5.zip` attached, < 1 MB.
- Auto-generated release notes list every commit since the start.

If anything is wrong, **delete the release and tag**, fix, and re-tag with the same version (only safe because nothing has consumed v1.0.0 yet).

- [ ] **Step 6: Hand off to the launch runbook**

This plan ends here. Subsequent operational work — itch listing setup, cover/GIF/screenshot production, Reddit/HN posting, devlog publishing — is in a separate ops runbook (`docs/superpowers/runbooks/2026-04-25-procforge-icons-launch-week.md`, to be written after this plan executes).

The release artefacts (`starter-pack.zip`, `web-preview-html5.zip`) are now ready for upload to itch.io.

---

## Self-Review Notes

Items checked against the spec (`docs/superpowers/specs/2026-04-25-procforge-icons-design.md`):

- ✅ §1.5 Phase 1 time-box deliverables (M1: core + CLI + 200 starter icons; M2: web preview + docs + listing assets) — covered by Tasks 1–34, 35–41.
- ✅ §4.1–4.4 Geometric outlined SVG, TypeScript, monorepo, theme plug-in shape — Tasks 1, 3, 7–16, 17–18, 25–27.
- ✅ §4.5 CLI + Web preview both running off the same core — Tasks 20–24 (CLI), 28–31 (Web).
- ✅ §5.1 Repo layout matches `packages/{core,themes,cli,web-preview}` and `starter-pack/`, `itch-page/`, `docs/`.
- ✅ §5.2 Buyer-facing deliverables: `starter-pack.zip` + GitHub link (no zipped source on itch) — Task 42 release attaches both `starter-pack.zip` and `web-preview-html5.zip`.
- ✅ §5.4 Release cadence: v1.0.0 tag + workflow — Task 42.
- ✅ §6 Brand and messaging — surfaces in README (Task 35), itch description (Task 39).
- ✅ §7.2 itch listing layout including HTML5 embed — covered by Tasks 28–31 + 39–40.
- ✅ §7.3 Pre-launch checklist items that are software-side — covered. Image/GIF items are explicitly out of scope (operational runbook).
- ❌ §7.4 Day-by-day GTM (D-day → D+30) — out of scope of this implementation plan; goes in operational runbook.
- ❌ §6.4 Cover art / §6.5 Demo GIF / 5 screenshots — manual design work, operational runbook.
- ✅ §8.1 Phase 2 enablers (theme as plug-in, manifest schema standardised, CLI `--theme path` ready by design, generator open-sourced, GitHub Issues open for demand signal) — designed in Tasks 15, 23 and documented in Task 38.

The plan covers every code-buildable Phase 1 item from the spec. Items deferred to the operational runbook are explicitly flagged in the plan header and in §7.4 / §6.4 / §6.5 of the spec.
