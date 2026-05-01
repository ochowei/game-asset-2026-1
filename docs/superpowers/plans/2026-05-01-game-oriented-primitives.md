# Game-Oriented Theme Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the abstract shape composition output with theme-specific game-recognisable subjects (sword, potion, blaster, etc.), closing the Phase 1 spec implementation gap.

**Architecture:** Two-layer primitive model. `@procforge/core` keeps `circle/polygon/path/star` (now demoted to "decoration"). Each theme owns 6 subject primitives. New `subject` composer in core picks 1 subject from `Theme.primitives`, places it centred, and adds 0–2 core decorations behind it. Phase 1 themes register only the `subject` composer.

**Tech Stack:** TypeScript (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), pnpm workspaces, Vitest, tsup, seedrandom. No new dependencies.

**Spec:** [docs/superpowers/specs/2026-05-01-game-oriented-primitives-design.md](../specs/2026-05-01-game-oriented-primitives-design.md)

---

## Conventions used throughout this plan

- Working dir is the repo root: `/Users/william/gitRepo/game-asset-2026-1/.claude/worktrees/zen-cerf-0ac6ea`.
- Each subject primitive imports helpers from `@procforge/core`: `range`, `intRange`, `pick`, `pickColor`, `svgElement`, `type PrimitiveFn`.
- Subject primitives output a `<g>...</g>` wrapper containing 2–5 SVG sub-elements.
- Stroke colour: `pickColor(rng, palette, 'neutral')`. Subject fill: `pickColor(rng, palette, rng() < 0.5 ? 'primary' : 'accent')`. No `'none'` fill on subjects.
- All geometry stays in `[size * 0.1, size * 0.9]`. Stroke width comes from ctx (`size * 0.04` from composer).
- `stroke-linejoin="round"` and `stroke-linecap="round"` on every element except `<circle>`.
- Numeric values rounded to 2 decimals via the existing `round` helper pattern (copy from `packages/core/src/primitives/circle.ts`).
- After every implementation step that adds a file, run `pnpm --filter <package> typecheck` to catch type errors before tests.
- Commit at the end of each Task (not between steps) using `feat`, `test`, `docs`, or `chore` prefixes.

---

## File Structure

**New files in `packages/core/`:**
- `src/composers/subject.ts` — the new `subject` composer.
- `tests/composers/subject.test.ts` — composer tests.

**Modified files in `packages/core/`:**
- `src/composers/index.ts` — export `subject`.

**For each of `medieval-fantasy`, `sci-fi`, `cozy-farm`, `roguelike-inventory` (under `packages/themes/<theme>/`):**

New files:
- `src/subjects/<primitive-1>.ts` … `src/subjects/<primitive-6>.ts` — 6 subject primitive functions.
- `src/subjects/index.ts` — barrel re-exporting all 6.
- `tests/subjects/<primitive-1>.test.ts` … `tests/subjects/<primitive-6>.test.ts` — per-primitive structural tests.

Modified:
- `src/index.ts` — replace `[circle, polygon, path, star]` with the 6 subject primitives, replace `[layer, mask]` with `[subject]`, leave palette/tags unchanged.
- `tests/index.test.ts` — adjust uniqueness threshold expectations only if needed (current `> 40` should still pass).

**Modified docs:**
- `docs/THEME-AUTHORING.md` — describe the two-layer model.
- `docs/ARCHITECTURE.md` — append note that determinism baseline reset at this commit.
- `README.md` — no change required.

**Regenerated assets:**
- `starter-pack/` and `starter-pack.zip` — re-produced via `pnpm produce-pack`.

---

## Task 1: New `subject` composer in core

**Files:**
- Create: `packages/core/src/composers/subject.ts`
- Modify: `packages/core/src/composers/index.ts`
- Test: `packages/core/tests/composers/subject.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/core/tests/composers/subject.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { makeRng } from '../../src/seed';
import { definePalette } from '../../src/palette';
import { svgElement } from '../../src/svg-emitter';
import type { PrimitiveFn } from '../../src/primitives/types';
import { subject } from '../../src/composers/subject';

const palette = definePalette({
  id: 'p',
  primary: ['#ff0000'],
  secondary: ['#00ff00'],
  accent: ['#0000ff'],
  neutral: ['#222222'],
});

const fakeSubject: PrimitiveFn = ({ centerX, centerY }) =>
  svgElement('g', { 'data-role': 'subject' }, svgElement('rect', { x: centerX, y: centerY, width: 1, height: 1 }));

describe('subject composer', () => {
  it('emits a single <g> wrapper containing exactly one subject group', () => {
    const out = subject({
      rng: makeRng('abc'),
      palette,
      size: 64,
      primitives: [fakeSubject],
    });
    expect(out.startsWith('<g')).toBe(true);
    expect(out.endsWith('</g>')).toBe(true);
    const subjectMarkers = (out.match(/data-role="subject"/g) ?? []).length;
    expect(subjectMarkers).toBe(1);
  });

  it('produces 0–2 decoration elements before the subject group', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e']) {
      const out = subject({
        rng: makeRng(seed),
        palette,
        size: 64,
        primitives: [fakeSubject],
      });
      const subjectIdx = out.indexOf('data-role="subject"');
      const before = out.slice(0, subjectIdx);
      const decorationCount = (before.match(/<(circle|polygon|path)\b/g) ?? []).length;
      expect(decorationCount).toBeGreaterThanOrEqual(0);
      expect(decorationCount).toBeLessThanOrEqual(2);
    }
  });

  it('decoration count distribution is roughly 25/50/25 across 1000 seeds', () => {
    const counts = [0, 0, 0];
    for (let i = 0; i < 1000; i++) {
      const out = subject({
        rng: makeRng(`s${i}`),
        palette,
        size: 64,
        primitives: [fakeSubject],
      });
      const subjectIdx = out.indexOf('data-role="subject"');
      const before = out.slice(0, subjectIdx);
      const c = (before.match(/<(circle|polygon|path)\b/g) ?? []).length;
      counts[c] = (counts[c] ?? 0) + 1;
    }
    // Allow ±10 percentage points around 25/50/25.
    expect(counts[0]! / 1000).toBeGreaterThan(0.15);
    expect(counts[0]! / 1000).toBeLessThan(0.35);
    expect(counts[1]! / 1000).toBeGreaterThan(0.4);
    expect(counts[1]! / 1000).toBeLessThan(0.6);
    expect(counts[2]! / 1000).toBeGreaterThan(0.15);
    expect(counts[2]! / 1000).toBeLessThan(0.35);
  });

  it('is deterministic for the same seed', () => {
    const args = { palette, size: 64, primitives: [fakeSubject] };
    expect(subject({ ...args, rng: makeRng('z') })).toBe(subject({ ...args, rng: makeRng('z') }));
  });

  it('throws if primitives is empty', () => {
    expect(() =>
      subject({ rng: makeRng('s'), palette, size: 64, primitives: [] }),
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```
pnpm --filter @procforge/core exec vitest run tests/composers/subject.test.ts
```

Expected: FAIL with "Cannot find module '../../src/composers/subject'" or similar.

- [ ] **Step 3: Implement the composer**

Create `packages/core/src/composers/subject.ts`:

```ts
import { intRange, pick, range } from '../seed';
import { pickColor } from '../palette';
import { svgElement } from '../svg-emitter';
import { circle } from '../primitives/circle';
import { polygon } from '../primitives/polygon';
import { path } from '../primitives/path';
import { star } from '../primitives/star';
import type { PrimitiveFn } from '../primitives/types';
import type { ComposerFn } from './types';

const DECORATIONS: readonly PrimitiveFn[] = [circle, polygon, path, star];

export const subject: ComposerFn = ({ rng, palette, size, primitives }) => {
  if (primitives.length === 0) throw new Error('subject composer: primitives empty');
  const center = size / 2;
  const strokeWidth = Math.max(1, Math.round(size * 0.04));

  const r = rng();
  const decorationCount = r < 0.25 ? 0 : r < 0.75 ? 1 : 2;

  const decorationParts: string[] = [];
  for (let i = 0; i < decorationCount; i++) {
    const fn = pick(rng, DECORATIONS);
    const offsetMag = range(rng, size * 0.15, size * 0.35);
    const angle = range(rng, 0, Math.PI * 2);
    const cx = center + Math.cos(angle) * offsetMag;
    const cy = center + Math.sin(angle) * offsetMag;
    decorationParts.push(
      fn({
        rng,
        palette,
        size,
        centerX: cx,
        centerY: cy,
        strokeWidth,
      }),
    );
  }

  const subjectFn = pick(rng, primitives);
  const subjectFragment = subjectFn({
    rng,
    palette,
    size,
    centerX: center,
    centerY: center,
    strokeWidth,
  });

  // Suppress unused-pick warning if a future change drops palette pick. Keep
  // intRange/pickColor imports honest by using them in a no-op tied to RNG order.
  // (No-op intentionally omitted; the helpers are used inside primitives.)
  void intRange;
  void pickColor;

  return svgElement('g', {}, decorationParts.join('') + subjectFragment);
};
```

> Drop the `void intRange; void pickColor;` lines if your linter/typecheck doesn't complain — they exist only to silence "unused import" lint if you copy-paste this without removing the unused imports. The actual minimal imports needed are `intRange` (no), `pick`, `range`, `svgElement`, plus the four decoration primitives, plus types. Trim accordingly.

Cleaned-up minimal version (use this):

```ts
import { pick, range } from '../seed';
import { svgElement } from '../svg-emitter';
import { circle } from '../primitives/circle';
import { polygon } from '../primitives/polygon';
import { path } from '../primitives/path';
import { star } from '../primitives/star';
import type { PrimitiveFn } from '../primitives/types';
import type { ComposerFn } from './types';

const DECORATIONS: readonly PrimitiveFn[] = [circle, polygon, path, star];

export const subject: ComposerFn = ({ rng, palette, size, primitives }) => {
  if (primitives.length === 0) throw new Error('subject composer: primitives empty');
  const center = size / 2;
  const strokeWidth = Math.max(1, Math.round(size * 0.04));

  const r = rng();
  const decorationCount = r < 0.25 ? 0 : r < 0.75 ? 1 : 2;

  const decorationParts: string[] = [];
  for (let i = 0; i < decorationCount; i++) {
    const fn = pick(rng, DECORATIONS);
    const offsetMag = range(rng, size * 0.15, size * 0.35);
    const angle = range(rng, 0, Math.PI * 2);
    const cx = center + Math.cos(angle) * offsetMag;
    const cy = center + Math.sin(angle) * offsetMag;
    decorationParts.push(
      fn({ rng, palette, size, centerX: cx, centerY: cy, strokeWidth }),
    );
  }

  const subjectFn = pick(rng, primitives);
  const subjectFragment = subjectFn({
    rng,
    palette,
    size,
    centerX: center,
    centerY: center,
    strokeWidth,
  });

  return svgElement('g', {}, decorationParts.join('') + subjectFragment);
};
```

- [ ] **Step 4: Export `subject` from composers barrel**

Edit `packages/core/src/composers/index.ts`:

```ts
export * from './types';
export * from './layer';
export * from './mask';
export * from './subject';
```

- [ ] **Step 5: Run typecheck and tests**

Run:
```
pnpm --filter @procforge/core typecheck && pnpm --filter @procforge/core exec vitest run tests/composers/subject.test.ts
```

Expected: typecheck passes; subject tests all PASS.

- [ ] **Step 6: Run the full core test suite to ensure no regression**

Run:
```
pnpm --filter @procforge/core test
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```
git add packages/core/src/composers/subject.ts packages/core/src/composers/index.ts packages/core/tests/composers/subject.test.ts
git commit -m "feat(core): subject composer for centred-subject + decoration layout"
```

---

## Task 2: Medieval-fantasy subject primitives

**Files:**
- Create: `packages/themes/medieval-fantasy/src/subjects/sword-blade.ts`
- Create: `packages/themes/medieval-fantasy/src/subjects/shield-frame.ts`
- Create: `packages/themes/medieval-fantasy/src/subjects/potion-bottle.ts`
- Create: `packages/themes/medieval-fantasy/src/subjects/scroll-roll.ts`
- Create: `packages/themes/medieval-fantasy/src/subjects/axe-head.ts`
- Create: `packages/themes/medieval-fantasy/src/subjects/gemstone.ts`
- Create: `packages/themes/medieval-fantasy/src/subjects/index.ts`
- Create: corresponding test files under `packages/themes/medieval-fantasy/tests/subjects/`
- Modify: `packages/themes/medieval-fantasy/src/index.ts`
- Modify: `packages/themes/medieval-fantasy/tests/index.test.ts` (only if test fails)

### A common test-helper file

- [ ] **Step 1: Create a per-theme test-utils helper to keep per-primitive tests short**

Create `packages/themes/medieval-fantasy/tests/subjects/_utils.ts`:

```ts
import { makeRng } from '@procforge/core';
import { definePalette } from '@procforge/core';

export const palette = definePalette({
  id: 'mf-test',
  primary: ['#aa3322'],
  secondary: ['#33aa44'],
  accent: ['#ffcc00'],
  neutral: ['#111111'],
});

export const ctx = (seed: string) => ({
  rng: makeRng(seed),
  palette,
  size: 64,
  centerX: 32,
  centerY: 32,
  strokeWidth: 3,
});

export function countCoordsInBounds(svg: string, lo: number, hi: number): { ok: number; bad: number } {
  let ok = 0;
  let bad = 0;
  // Match coordinate-bearing attribute values: cx="…", cy="…", x="…", y="…",
  // x1="…" x2="…" y1="…" y2="…", r="…", points="x,y x,y …", d="M x y L x y …"
  const numRe = /-?\d+(?:\.\d+)?/g;
  for (const match of svg.matchAll(/(?:cx|cy|x|y|x1|x2|y1|y2|width|height|r)="([^"]+)"/g)) {
    for (const n of match[1]!.matchAll(numRe)) {
      const v = parseFloat(n[0]);
      if (Number.isNaN(v)) continue;
      if (v >= lo && v <= hi) ok++;
      else bad++;
    }
  }
  for (const match of svg.matchAll(/(?:points|d)="([^"]+)"/g)) {
    for (const n of match[1]!.matchAll(numRe)) {
      const v = parseFloat(n[0]);
      if (Number.isNaN(v)) continue;
      if (v >= lo && v <= hi) ok++;
      else bad++;
    }
  }
  return { ok, bad };
}
```

> The bounds-check helper is approximate (it also counts `width`/`height`/`r` which aren't strictly coordinates) but suffices for catching gross out-of-bounds geometry. Tests only assert `bad === 0` against a slightly looser bound (`-1` to `size + 1`) to allow for rounding.

### Per-primitive sub-tasks

For each of the 6 primitives below, follow this pattern:

- [ ] **Sword-Blade — Step 1: Write the failing test**

Create `packages/themes/medieval-fantasy/tests/subjects/sword-blade.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { swordBlade } from '../../src/subjects/sword-blade';
import { ctx, countCoordsInBounds } from './_utils';

describe('swordBlade', () => {
  it('emits a <g> wrapper', () => {
    const out = swordBlade(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out.endsWith('</g>')).toBe(true);
  });

  it('contains a blade polygon, a crossguard rect, a grip line and a pommel circle', () => {
    const out = swordBlade(ctx('s'));
    expect(out).toMatch(/<polygon\b/);
    expect(out).toMatch(/<rect\b/);
    expect(out).toMatch(/<line\b/);
    expect(out).toMatch(/<circle\b/);
  });

  it('keeps coordinates within [-1, size+1]', () => {
    const out = swordBlade(ctx('s'));
    const { bad } = countCoordsInBounds(out, -1, 65);
    expect(bad).toBe(0);
  });

  it('is deterministic for the same seed', () => {
    expect(swordBlade(ctx('z'))).toBe(swordBlade(ctx('z')));
  });

  it('produces different output for different seeds', () => {
    expect(swordBlade(ctx('a'))).not.toBe(swordBlade(ctx('b')));
  });
});
```

- [ ] **Sword-Blade — Step 2: Run test (expect fail)**

```
pnpm --filter @procforge/theme-medieval-fantasy exec vitest run tests/subjects/sword-blade.test.ts
```

Expected: FAIL with "Cannot find module".

- [ ] **Sword-Blade — Step 3: Implement**

Create `packages/themes/medieval-fantasy/src/subjects/sword-blade.ts`:

```ts
import { range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const swordBlade: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const bladeLen = range(rng, size * 0.45, size * 0.6);
  const bladeWidth = range(rng, size * 0.06, size * 0.12);
  const guardWidth = range(rng, size * 0.22, size * 0.32);
  const guardHeight = Math.max(2, size * 0.04);
  const gripLen = range(rng, size * 0.1, size * 0.16);
  const pommelR = range(rng, size * 0.04, size * 0.06);

  const tipY = centerY - bladeLen * 0.55;
  const guardY = centerY + bladeLen * 0.45;
  const gripBottomY = guardY + gripLen;
  const pommelY = gripBottomY + pommelR;

  const blade = svgElement('polygon', {
    points: `${r(centerX)},${r(tipY)} ${r(centerX + bladeWidth / 2)},${r(guardY)} ${r(centerX - bladeWidth / 2)},${r(guardY)}`,
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const guard = svgElement('rect', {
    x: r(centerX - guardWidth / 2),
    y: r(guardY),
    width: r(guardWidth),
    height: r(guardHeight),
    fill: stroke,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const grip = svgElement('line', {
    x1: r(centerX),
    y1: r(guardY + guardHeight),
    x2: r(centerX),
    y2: r(gripBottomY),
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.5),
    'stroke-linecap': 'round',
  });
  const pommel = svgElement('circle', {
    cx: r(centerX),
    cy: r(pommelY),
    r: r(pommelR),
    fill,
    stroke,
    'stroke-width': strokeWidth,
  });

  return svgElement('g', {}, blade + guard + grip + pommel);
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

- [ ] **Sword-Blade — Step 4: Run test (expect pass)**

```
pnpm --filter @procforge/theme-medieval-fantasy exec vitest run tests/subjects/sword-blade.test.ts
```

Expected: PASS.

---

Repeat the same Steps 1–4 pattern for each remaining primitive. The test files follow the same shape; only the imported function name and the expected element list change. Implementation code is given complete below.

- [ ] **Shield-Frame — Test, then implement**

Test file `packages/themes/medieval-fantasy/tests/subjects/shield-frame.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { shieldFrame } from '../../src/subjects/shield-frame';
import { ctx, countCoordsInBounds } from './_utils';

describe('shieldFrame', () => {
  it('emits a <g> wrapper containing two paths', () => {
    const out = shieldFrame(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out.endsWith('</g>')).toBe(true);
    expect((out.match(/<path\b/g) ?? []).length).toBe(2);
  });
  it('keeps coordinates within bounds', () => {
    const { bad } = countCoordsInBounds(shieldFrame(ctx('s')), -1, 65);
    expect(bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(shieldFrame(ctx('z'))).toBe(shieldFrame(ctx('z')));
  });
  it('different seeds yield different output', () => {
    expect(shieldFrame(ctx('a'))).not.toBe(shieldFrame(ctx('b')));
  });
});
```

Implementation `packages/themes/medieval-fantasy/src/subjects/shield-frame.ts`:

```ts
import { range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const shieldFrame: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const halfW = range(rng, size * 0.22, size * 0.3);
  const topY = centerY - range(rng, size * 0.28, size * 0.34);
  const shoulderY = topY + range(rng, size * 0.05, size * 0.08);
  const bottomY = centerY + range(rng, size * 0.3, size * 0.36);

  const outer = `M ${r(centerX - halfW)} ${r(topY)}
    Q ${r(centerX)} ${r(topY - halfW * 0.15)} ${r(centerX + halfW)} ${r(topY)}
    L ${r(centerX + halfW)} ${r(shoulderY + size * 0.18)}
    Q ${r(centerX)} ${r(bottomY)} ${r(centerX - halfW)} ${r(shoulderY + size * 0.18)}
    Z`;
  const innerHalfW = halfW * 0.7;
  const innerTopY = topY + size * 0.05;
  const innerBottomY = bottomY - size * 0.06;
  const inner = `M ${r(centerX - innerHalfW)} ${r(innerTopY)}
    Q ${r(centerX)} ${r(innerTopY - innerHalfW * 0.12)} ${r(centerX + innerHalfW)} ${r(innerTopY)}
    L ${r(centerX + innerHalfW)} ${r(innerTopY + size * 0.18)}
    Q ${r(centerX)} ${r(innerBottomY)} ${r(centerX - innerHalfW)} ${r(innerTopY + size * 0.18)}
    Z`;

  return svgElement(
    'g',
    {},
    svgElement('path', { d: outer, fill, stroke, 'stroke-width': strokeWidth, 'stroke-linejoin': 'round' }) +
      svgElement('path', {
        d: inner,
        fill: 'none',
        stroke,
        'stroke-width': Math.max(1, strokeWidth * 0.7),
        'stroke-linejoin': 'round',
      }),
  );
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

Run: `pnpm --filter @procforge/theme-medieval-fantasy exec vitest run tests/subjects/shield-frame.test.ts`. Expected: PASS.

- [ ] **Potion-Bottle — Test, then implement**

Test file `packages/themes/medieval-fantasy/tests/subjects/potion-bottle.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { potionBottle } from '../../src/subjects/potion-bottle';
import { ctx, countCoordsInBounds } from './_utils';

describe('potionBottle', () => {
  it('emits a <g> with body, neck and cork', () => {
    const out = potionBottle(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<ellipse\b/);
    expect((out.match(/<rect\b/g) ?? []).length).toBe(2);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(potionBottle(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(potionBottle(ctx('z'))).toBe(potionBottle(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(potionBottle(ctx('a'))).not.toBe(potionBottle(ctx('b')));
  });
});
```

Implementation `packages/themes/medieval-fantasy/src/subjects/potion-bottle.ts`:

```ts
import { range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const potionBottle: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const bodyRX = range(rng, size * 0.18, size * 0.24);
  const bodyRY = range(rng, size * 0.16, size * 0.22);
  const bodyCY = centerY + size * 0.12;
  const neckW = range(rng, size * 0.08, size * 0.12);
  const neckH = range(rng, size * 0.12, size * 0.18);
  const neckTopY = bodyCY - bodyRY - neckH;
  const corkH = range(rng, size * 0.05, size * 0.08);

  const body = svgElement('ellipse', {
    cx: r(centerX),
    cy: r(bodyCY),
    rx: r(bodyRX),
    ry: r(bodyRY),
    fill,
    stroke,
    'stroke-width': strokeWidth,
  });
  const neck = svgElement('rect', {
    x: r(centerX - neckW / 2),
    y: r(neckTopY),
    width: r(neckW),
    height: r(neckH),
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const cork = svgElement('rect', {
    x: r(centerX - neckW * 0.6),
    y: r(neckTopY - corkH),
    width: r(neckW * 1.2),
    height: r(corkH),
    fill: pickColor(rng, palette, 'secondary'),
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });

  return svgElement('g', {}, body + neck + cork);
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

- [ ] **Scroll-Roll — Test, then implement**

Test file `packages/themes/medieval-fantasy/tests/subjects/scroll-roll.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { scrollRoll } from '../../src/subjects/scroll-roll';
import { ctx, countCoordsInBounds } from './_utils';

describe('scrollRoll', () => {
  it('emits a <g> with two ellipses (rolled ends) and a body rect', () => {
    const out = scrollRoll(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect((out.match(/<ellipse\b/g) ?? []).length).toBe(2);
    expect(out).toMatch(/<rect\b/);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(scrollRoll(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(scrollRoll(ctx('z'))).toBe(scrollRoll(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(scrollRoll(ctx('a'))).not.toBe(scrollRoll(ctx('b')));
  });
});
```

Implementation `packages/themes/medieval-fantasy/src/subjects/scroll-roll.ts`:

```ts
import { range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const scrollRoll: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const bodyW = range(rng, size * 0.45, size * 0.55);
  const bodyH = range(rng, size * 0.18, size * 0.26);
  const capR = bodyH * 0.5;
  const leftX = centerX - bodyW / 2;
  const rightX = centerX + bodyW / 2;

  const body = svgElement('rect', {
    x: r(leftX),
    y: r(centerY - bodyH / 2),
    width: r(bodyW),
    height: r(bodyH),
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const leftCap = svgElement('ellipse', {
    cx: r(leftX),
    cy: r(centerY),
    rx: r(capR * 0.5),
    ry: r(capR),
    fill: pickColor(rng, palette, 'secondary'),
    stroke,
    'stroke-width': strokeWidth,
  });
  const rightCap = svgElement('ellipse', {
    cx: r(rightX),
    cy: r(centerY),
    rx: r(capR * 0.5),
    ry: r(capR),
    fill: pickColor(rng, palette, 'secondary'),
    stroke,
    'stroke-width': strokeWidth,
  });

  return svgElement('g', {}, body + leftCap + rightCap);
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

- [ ] **Axe-Head — Test, then implement**

Test file `packages/themes/medieval-fantasy/tests/subjects/axe-head.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { axeHead } from '../../src/subjects/axe-head';
import { ctx, countCoordsInBounds } from './_utils';

describe('axeHead', () => {
  it('emits a <g> with a haft line and a blade polygon', () => {
    const out = axeHead(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<line\b/);
    expect(out).toMatch(/<polygon\b/);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(axeHead(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(axeHead(ctx('z'))).toBe(axeHead(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(axeHead(ctx('a'))).not.toBe(axeHead(ctx('b')));
  });
});
```

Implementation `packages/themes/medieval-fantasy/src/subjects/axe-head.ts`:

```ts
import { range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const axeHead: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const haftLen = range(rng, size * 0.55, size * 0.7);
  const haftTop = centerY - haftLen / 2;
  const haftBottom = centerY + haftLen / 2;
  const bladeY = centerY - range(rng, size * 0.05, size * 0.1);
  const bladeOuter = centerX + range(rng, size * 0.18, size * 0.28);
  const bladeBack = centerX + range(rng, size * 0.05, size * 0.08);
  const bladeTopY = bladeY - range(rng, size * 0.12, size * 0.18);
  const bladeBottomY = bladeY + range(rng, size * 0.12, size * 0.18);

  const haft = svgElement('line', {
    x1: r(centerX),
    y1: r(haftTop),
    x2: r(centerX),
    y2: r(haftBottom),
    stroke: pickColor(rng, palette, 'secondary'),
    'stroke-width': Math.max(2, strokeWidth * 1.4),
    'stroke-linecap': 'round',
  });
  const blade = svgElement('polygon', {
    points: `${r(bladeBack)},${r(bladeTopY)} ${r(bladeOuter)},${r(bladeY)} ${r(bladeBack)},${r(bladeBottomY)}`,
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });

  return svgElement('g', {}, haft + blade);
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

- [ ] **Gemstone — Test, then implement**

Test file `packages/themes/medieval-fantasy/tests/subjects/gemstone.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { gemstone } from '../../src/subjects/gemstone';
import { ctx, countCoordsInBounds } from './_utils';

describe('gemstone', () => {
  it('emits a <g> with a polygon and at least one facet line', () => {
    const out = gemstone(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<polygon\b/);
    expect((out.match(/<line\b/g) ?? []).length).toBeGreaterThanOrEqual(1);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(gemstone(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(gemstone(ctx('z'))).toBe(gemstone(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(gemstone(ctx('a'))).not.toBe(gemstone(ctx('b')));
  });
});
```

Implementation `packages/themes/medieval-fantasy/src/subjects/gemstone.ts`:

```ts
import { intRange, range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const gemstone: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const facets = intRange(rng, 5, 7);
  const radius = range(rng, size * 0.22, size * 0.32);
  const points: string[] = [];
  const angleOffset = -Math.PI / 2;
  for (let i = 0; i < facets; i++) {
    const a = angleOffset + (i / facets) * Math.PI * 2;
    const x = centerX + Math.cos(a) * radius;
    const y = centerY + Math.sin(a) * radius;
    points.push(`${r(x)},${r(y)}`);
  }
  const body = svgElement('polygon', {
    points: points.join(' '),
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const facetCount = Math.min(facets, 5);
  const facetLines: string[] = [];
  for (let i = 0; i < facetCount; i++) {
    const a = angleOffset + (i / facets) * Math.PI * 2;
    const x = centerX + Math.cos(a) * radius;
    const y = centerY + Math.sin(a) * radius;
    facetLines.push(
      svgElement('line', {
        x1: r(centerX),
        y1: r(centerY),
        x2: r(x),
        y2: r(y),
        stroke,
        'stroke-width': Math.max(1, strokeWidth * 0.5),
        'stroke-linecap': 'round',
      }),
    );
  }
  return svgElement('g', {}, body + facetLines.join(''));
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

### Wire up the theme

- [ ] **Step 8: Create barrel `src/subjects/index.ts`**

```ts
export { swordBlade } from './sword-blade';
export { shieldFrame } from './shield-frame';
export { potionBottle } from './potion-bottle';
export { scrollRoll } from './scroll-roll';
export { axeHead } from './axe-head';
export { gemstone } from './gemstone';
```

- [ ] **Step 9: Rewrite `src/index.ts`**

Replace the contents of `packages/themes/medieval-fantasy/src/index.ts` with:

```ts
import { defineTheme, definePalette, subject, type Theme } from '@procforge/core';
import {
  swordBlade,
  shieldFrame,
  potionBottle,
  scrollRoll,
  axeHead,
  gemstone,
} from './subjects';

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
  primitives: [swordBlade, shieldFrame, potionBottle, scrollRoll, axeHead, gemstone],
  composers: [subject],
  tags: ['weapon', 'potion', 'shield', 'scroll', 'rpg', 'fantasy'],
});
```

- [ ] **Step 10: Run typecheck and full theme test suite**

```
pnpm --filter @procforge/theme-medieval-fantasy typecheck && pnpm --filter @procforge/theme-medieval-fantasy test
```

Expected: typecheck passes; all subject tests pass; existing `tests/index.test.ts` still passes (uniqueness > 40 holds easily).

- [ ] **Step 11: Commit**

```
git add packages/themes/medieval-fantasy/src/subjects packages/themes/medieval-fantasy/src/index.ts packages/themes/medieval-fantasy/tests/subjects
git commit -m "feat(theme-medieval-fantasy): 6 subject primitives + subject composer wiring"
```

---

## Task 3: Sci-fi subject primitives

**Files:** mirror Task 2 layout under `packages/themes/sci-fi/`. Six primitives: `blasterBody`, `chipBoard`, `energyOrb`, `hudFrame`, `cogGear`, `antennaArray`.

- [ ] **Step 1: Create `tests/subjects/_utils.ts`** (same shape as Task 2 step 1, but `id: 'sf-test'` and palette colours `#225588 / #44aa66 / #ffaa22 / #111111`).

```ts
import { makeRng } from '@procforge/core';
import { definePalette } from '@procforge/core';

export const palette = definePalette({
  id: 'sf-test',
  primary: ['#225588'],
  secondary: ['#44aa66'],
  accent: ['#ffaa22'],
  neutral: ['#111111'],
});

export const ctx = (seed: string) => ({
  rng: makeRng(seed),
  palette,
  size: 64,
  centerX: 32,
  centerY: 32,
  strokeWidth: 3,
});

// Same countCoordsInBounds as Task 2 step 1 — copy verbatim.
export function countCoordsInBounds(svg: string, lo: number, hi: number): { ok: number; bad: number } {
  let ok = 0;
  let bad = 0;
  const numRe = /-?\d+(?:\.\d+)?/g;
  for (const match of svg.matchAll(/(?:cx|cy|x|y|x1|x2|y1|y2|width|height|r)="([^"]+)"/g)) {
    for (const n of match[1]!.matchAll(numRe)) {
      const v = parseFloat(n[0]);
      if (Number.isNaN(v)) continue;
      if (v >= lo && v <= hi) ok++;
      else bad++;
    }
  }
  for (const match of svg.matchAll(/(?:points|d)="([^"]+)"/g)) {
    for (const n of match[1]!.matchAll(numRe)) {
      const v = parseFloat(n[0]);
      if (Number.isNaN(v)) continue;
      if (v >= lo && v <= hi) ok++;
      else bad++;
    }
  }
  return { ok, bad };
}
```

- [ ] **BlasterBody — test + impl**

Test `tests/subjects/blaster-body.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { blasterBody } from '../../src/subjects/blaster-body';
import { ctx, countCoordsInBounds } from './_utils';

describe('blasterBody', () => {
  it('emits a <g> with a body path, barrel rect and grip rect', () => {
    const out = blasterBody(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<path\b/);
    expect((out.match(/<rect\b/g) ?? []).length).toBe(2);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(blasterBody(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(blasterBody(ctx('z'))).toBe(blasterBody(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(blasterBody(ctx('a'))).not.toBe(blasterBody(ctx('b')));
  });
});
```

Impl `src/subjects/blaster-body.ts`:

```ts
import { range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const blasterBody: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const bodyW = range(rng, size * 0.32, size * 0.42);
  const bodyH = range(rng, size * 0.16, size * 0.22);
  const bodyX = centerX - bodyW / 2;
  const bodyY = centerY - bodyH / 2;
  const barrelW = range(rng, size * 0.22, size * 0.3);
  const barrelH = range(rng, size * 0.05, size * 0.08);
  const gripW = range(rng, size * 0.1, size * 0.14);
  const gripH = range(rng, size * 0.18, size * 0.24);

  const body = svgElement('path', {
    d: `M ${r(bodyX)} ${r(bodyY)}
        L ${r(bodyX + bodyW * 0.85)} ${r(bodyY)}
        L ${r(bodyX + bodyW)} ${r(bodyY + bodyH * 0.5)}
        L ${r(bodyX + bodyW)} ${r(bodyY + bodyH)}
        L ${r(bodyX)} ${r(bodyY + bodyH)} Z`,
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const barrel = svgElement('rect', {
    x: r(bodyX + bodyW),
    y: r(centerY - barrelH / 2),
    width: r(barrelW),
    height: r(barrelH),
    fill: pickColor(rng, palette, 'secondary'),
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const grip = svgElement('rect', {
    x: r(bodyX + bodyW * 0.2),
    y: r(bodyY + bodyH),
    width: r(gripW),
    height: r(gripH),
    fill: pickColor(rng, palette, 'secondary'),
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });

  return svgElement('g', {}, body + barrel + grip);
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

Run tests for the file before moving on.

- [ ] **ChipBoard — test + impl**

Test `tests/subjects/chip-board.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { chipBoard } from '../../src/subjects/chip-board';
import { ctx, countCoordsInBounds } from './_utils';

describe('chipBoard', () => {
  it('emits a <g> with a square rect, ≥ 8 pin lines and a centre dot', () => {
    const out = chipBoard(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<rect\b/);
    expect((out.match(/<line\b/g) ?? []).length).toBeGreaterThanOrEqual(8);
    expect(out).toMatch(/<circle\b/);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(chipBoard(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(chipBoard(ctx('z'))).toBe(chipBoard(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(chipBoard(ctx('a'))).not.toBe(chipBoard(ctx('b')));
  });
});
```

Impl `src/subjects/chip-board.ts`:

```ts
import { intRange, range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const chipBoard: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const half = range(rng, size * 0.18, size * 0.24);
  const pinsPerSide = intRange(rng, 3, 4);
  const pinLen = range(rng, size * 0.05, size * 0.08);

  const square = svgElement('rect', {
    x: r(centerX - half),
    y: r(centerY - half),
    width: r(half * 2),
    height: r(half * 2),
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });

  const pins: string[] = [];
  for (let i = 0; i < pinsPerSide; i++) {
    const t = (i + 1) / (pinsPerSide + 1);
    const along = -half + half * 2 * t;
    pins.push(line(centerX + along, centerY - half, centerX + along, centerY - half - pinLen, stroke, strokeWidth));
    pins.push(line(centerX + along, centerY + half, centerX + along, centerY + half + pinLen, stroke, strokeWidth));
    pins.push(line(centerX - half, centerY + along, centerX - half - pinLen, centerY + along, stroke, strokeWidth));
    pins.push(line(centerX + half, centerY + along, centerX + half + pinLen, centerY + along, stroke, strokeWidth));
  }

  const dot = svgElement('circle', {
    cx: r(centerX),
    cy: r(centerY),
    r: r(half * 0.18),
    fill: stroke,
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.5),
  });

  return svgElement('g', {}, square + pins.join('') + dot);
};

function line(x1: number, y1: number, x2: number, y2: number, stroke: string, sw: number): string {
  return svgElement('line', {
    x1: r(x1),
    y1: r(y1),
    x2: r(x2),
    y2: r(y2),
    stroke,
    'stroke-width': sw,
    'stroke-linecap': 'round',
  });
}

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

- [ ] **EnergyOrb — test + impl**

Test `tests/subjects/energy-orb.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { energyOrb } from '../../src/subjects/energy-orb';
import { ctx, countCoordsInBounds } from './_utils';

describe('energyOrb', () => {
  it('emits a <g> with two circles and ≥ 4 ray lines', () => {
    const out = energyOrb(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect((out.match(/<circle\b/g) ?? []).length).toBe(2);
    expect((out.match(/<line\b/g) ?? []).length).toBeGreaterThanOrEqual(4);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(energyOrb(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(energyOrb(ctx('z'))).toBe(energyOrb(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(energyOrb(ctx('a'))).not.toBe(energyOrb(ctx('b')));
  });
});
```

Impl `src/subjects/energy-orb.ts`:

```ts
import { intRange, range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const energyOrb: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const outerR = range(rng, size * 0.22, size * 0.3);
  const innerR = outerR * range(rng, 0.45, 0.65);
  const rays = intRange(rng, 4, 8);
  const rayInner = outerR * 1.05;
  const rayOuter = outerR * range(rng, 1.25, 1.4);

  const ringOuter = svgElement('circle', {
    cx: r(centerX),
    cy: r(centerY),
    r: r(outerR),
    fill,
    stroke,
    'stroke-width': strokeWidth,
  });
  const ringInner = svgElement('circle', {
    cx: r(centerX),
    cy: r(centerY),
    r: r(innerR),
    fill: pickColor(rng, palette, 'secondary'),
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.7),
  });
  const rayLines: string[] = [];
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2;
    rayLines.push(
      svgElement('line', {
        x1: r(centerX + Math.cos(a) * rayInner),
        y1: r(centerY + Math.sin(a) * rayInner),
        x2: r(centerX + Math.cos(a) * rayOuter),
        y2: r(centerY + Math.sin(a) * rayOuter),
        stroke,
        'stroke-width': Math.max(1, strokeWidth * 0.7),
        'stroke-linecap': 'round',
      }),
    );
  }
  return svgElement('g', {}, ringOuter + ringInner + rayLines.join(''));
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

- [ ] **HudFrame — test + impl**

Test `tests/subjects/hud-frame.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { hudFrame } from '../../src/subjects/hud-frame';
import { ctx, countCoordsInBounds } from './_utils';

describe('hudFrame', () => {
  it('emits a <g> with four corner-bracket paths and a centre dot circle', () => {
    const out = hudFrame(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect((out.match(/<path\b/g) ?? []).length).toBe(4);
    expect(out).toMatch(/<circle\b/);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(hudFrame(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(hudFrame(ctx('z'))).toBe(hudFrame(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(hudFrame(ctx('a'))).not.toBe(hudFrame(ctx('b')));
  });
});
```

Impl `src/subjects/hud-frame.ts`:

```ts
import { range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const hudFrame: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const half = range(rng, size * 0.25, size * 0.34);
  const armLen = half * range(rng, 0.45, 0.6);
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'accent') : pickColor(rng, palette, 'primary');

  const corner = (cx: number, cy: number, dx: number, dy: number): string =>
    svgElement('path', {
      d: `M ${r(cx)} ${r(cy + dy * armLen)} L ${r(cx)} ${r(cy)} L ${r(cx + dx * armLen)} ${r(cy)}`,
      fill: 'none',
      stroke,
      'stroke-width': Math.max(2, strokeWidth * 1.2),
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    });

  const tl = corner(centerX - half, centerY - half, +1, +1);
  const tr = corner(centerX + half, centerY - half, -1, +1);
  const bl = corner(centerX - half, centerY + half, +1, -1);
  const br = corner(centerX + half, centerY + half, -1, -1);

  const dot = svgElement('circle', {
    cx: r(centerX),
    cy: r(centerY),
    r: r(half * 0.12),
    fill,
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.6),
  });

  return svgElement('g', {}, tl + tr + bl + br + dot);
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

- [ ] **CogGear — test + impl**

Test `tests/subjects/cog-gear.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { cogGear } from '../../src/subjects/cog-gear';
import { ctx, countCoordsInBounds } from './_utils';

describe('cogGear', () => {
  it('emits a <g> with a teeth polygon and a centre hole circle', () => {
    const out = cogGear(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<polygon\b/);
    expect(out).toMatch(/<circle\b/);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(cogGear(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(cogGear(ctx('z'))).toBe(cogGear(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(cogGear(ctx('a'))).not.toBe(cogGear(ctx('b')));
  });
});
```

Impl `src/subjects/cog-gear.ts`:

```ts
import { intRange, range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const cogGear: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const teeth = intRange(rng, 6, 10);
  const outer = range(rng, size * 0.25, size * 0.32);
  const inner = outer * range(rng, 0.78, 0.86);
  const points: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const isOuter = i % 2 === 0;
    const radius = isOuter ? outer : inner;
    const a = (i / (teeth * 2)) * Math.PI * 2 - Math.PI / 2;
    points.push(`${r(centerX + Math.cos(a) * radius)},${r(centerY + Math.sin(a) * radius)}`);
  }
  const body = svgElement('polygon', {
    points: points.join(' '),
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const hole = svgElement('circle', {
    cx: r(centerX),
    cy: r(centerY),
    r: r(outer * 0.3),
    fill: pickColor(rng, palette, 'secondary'),
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.7),
  });
  return svgElement('g', {}, body + hole);
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

- [ ] **AntennaArray — test + impl**

Test `tests/subjects/antenna-array.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { antennaArray } from '../../src/subjects/antenna-array';
import { ctx, countCoordsInBounds } from './_utils';

describe('antennaArray', () => {
  it('emits a <g> with a vertical mast line plus ≥ 3 cross-bar lines', () => {
    const out = antennaArray(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect((out.match(/<line\b/g) ?? []).length).toBeGreaterThanOrEqual(4);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(antennaArray(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(antennaArray(ctx('z'))).toBe(antennaArray(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(antennaArray(ctx('a'))).not.toBe(antennaArray(ctx('b')));
  });
});
```

Impl `src/subjects/antenna-array.ts`:

```ts
import { intRange, range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const antennaArray: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const accent = pickColor(rng, palette, 'accent');
  const mastLen = range(rng, size * 0.55, size * 0.7);
  const mastTopY = centerY - mastLen / 2;
  const mastBottomY = centerY + mastLen / 2;
  const bars = intRange(rng, 3, 5);

  const mast = svgElement('line', {
    x1: r(centerX),
    y1: r(mastTopY),
    x2: r(centerX),
    y2: r(mastBottomY),
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.3),
    'stroke-linecap': 'round',
  });

  const crossBars: string[] = [];
  for (let i = 0; i < bars; i++) {
    const t = i / Math.max(1, bars - 1);
    const y = mastTopY + t * (mastLen * 0.6);
    const halfW = (size * 0.28) * (1 - t * 0.6);
    crossBars.push(
      svgElement('line', {
        x1: r(centerX - halfW),
        y1: r(y),
        x2: r(centerX + halfW),
        y2: r(y),
        stroke: i === 0 ? accent : stroke,
        'stroke-width': Math.max(1, strokeWidth * 0.8),
        'stroke-linecap': 'round',
      }),
    );
  }

  return svgElement('g', {}, mast + crossBars.join(''));
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

### Wire up the sci-fi theme

- [ ] **Step 8: Create `src/subjects/index.ts`**

```ts
export { blasterBody } from './blaster-body';
export { chipBoard } from './chip-board';
export { energyOrb } from './energy-orb';
export { hudFrame } from './hud-frame';
export { cogGear } from './cog-gear';
export { antennaArray } from './antenna-array';
```

- [ ] **Step 9: Rewrite `src/index.ts`**

Replace `packages/themes/sci-fi/src/index.ts` with:

```ts
import { defineTheme, definePalette, subject, type Theme } from '@procforge/core';
import {
  blasterBody,
  chipBoard,
  energyOrb,
  hudFrame,
  cogGear,
  antennaArray,
} from './subjects';

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
  primitives: [blasterBody, chipBoard, energyOrb, hudFrame, cogGear, antennaArray],
  composers: [subject],
  tags: ['hud', 'gun', 'chip', 'energy', 'sci-fi', 'cyberpunk'],
});
```

- [ ] **Step 10: Run typecheck and tests**

```
pnpm --filter @procforge/theme-sci-fi typecheck && pnpm --filter @procforge/theme-sci-fi test
```

Expected: all tests pass.

- [ ] **Step 11: Commit**

```
git add packages/themes/sci-fi/src/subjects packages/themes/sci-fi/src/index.ts packages/themes/sci-fi/tests/subjects
git commit -m "feat(theme-sci-fi): 6 subject primitives + subject composer wiring"
```

---

## Task 4: Cozy-farm subject primitives

**Files:** mirror under `packages/themes/cozy-farm/`. Six primitives: `hoeTool`, `fruit`, `seedPouch`, `animalHead`, `wateringCan`, `wheatStalk`.

- [ ] **Step 1: Create `tests/subjects/_utils.ts`**

```ts
import { makeRng } from '@procforge/core';
import { definePalette } from '@procforge/core';

export const palette = definePalette({
  id: 'cf-test',
  primary: ['#e07a5f'],
  secondary: ['#3a5a40'],
  accent: ['#f4d35e'],
  neutral: ['#3d3027'],
});

export const ctx = (seed: string) => ({
  rng: makeRng(seed),
  palette,
  size: 64,
  centerX: 32,
  centerY: 32,
  strokeWidth: 3,
});

export function countCoordsInBounds(svg: string, lo: number, hi: number): { ok: number; bad: number } {
  let ok = 0;
  let bad = 0;
  const numRe = /-?\d+(?:\.\d+)?/g;
  for (const match of svg.matchAll(/(?:cx|cy|x|y|x1|x2|y1|y2|width|height|r)="([^"]+)"/g)) {
    for (const n of match[1]!.matchAll(numRe)) {
      const v = parseFloat(n[0]);
      if (Number.isNaN(v)) continue;
      if (v >= lo && v <= hi) ok++;
      else bad++;
    }
  }
  for (const match of svg.matchAll(/(?:points|d)="([^"]+)"/g)) {
    for (const n of match[1]!.matchAll(numRe)) {
      const v = parseFloat(n[0]);
      if (Number.isNaN(v)) continue;
      if (v >= lo && v <= hi) ok++;
      else bad++;
    }
  }
  return { ok, bad };
}
```

- [ ] **HoeTool — test + impl**

Test `tests/subjects/hoe-tool.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { hoeTool } from '../../src/subjects/hoe-tool';
import { ctx, countCoordsInBounds } from './_utils';

describe('hoeTool', () => {
  it('emits a <g> with a handle line and a blade polygon', () => {
    const out = hoeTool(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<line\b/);
    expect(out).toMatch(/<polygon\b/);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(hoeTool(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(hoeTool(ctx('z'))).toBe(hoeTool(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(hoeTool(ctx('a'))).not.toBe(hoeTool(ctx('b')));
  });
});
```

Impl `src/subjects/hoe-tool.ts`:

```ts
import { range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const hoeTool: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const handleColor = pickColor(rng, palette, 'secondary');
  const bladeColor = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');

  const handleAngle = -Math.PI / 4 + range(rng, -0.1, 0.1);
  const handleLen = range(rng, size * 0.55, size * 0.65);
  const x1 = centerX - Math.cos(handleAngle) * handleLen / 2;
  const y1 = centerY - Math.sin(handleAngle) * handleLen / 2;
  const x2 = centerX + Math.cos(handleAngle) * handleLen / 2;
  const y2 = centerY + Math.sin(handleAngle) * handleLen / 2;

  const bladeW = range(rng, size * 0.18, size * 0.24);
  const bladeH = range(rng, size * 0.1, size * 0.14);
  const bx = x2;
  const by = y2;

  const handle = svgElement('line', {
    x1: r(x1),
    y1: r(y1),
    x2: r(x2),
    y2: r(y2),
    stroke: handleColor,
    'stroke-width': Math.max(2, strokeWidth * 1.3),
    'stroke-linecap': 'round',
  });
  const blade = svgElement('polygon', {
    points: `${r(bx)},${r(by - bladeH / 2)} ${r(bx + bladeW)},${r(by - bladeH * 0.2)} ${r(bx + bladeW)},${r(by + bladeH * 0.6)} ${r(bx)},${r(by + bladeH / 2)}`,
    fill: bladeColor,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });

  return svgElement('g', {}, handle + blade);
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

- [ ] **Fruit — test + impl**

Test `tests/subjects/fruit.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { fruit } from '../../src/subjects/fruit';
import { ctx, countCoordsInBounds } from './_utils';

describe('fruit', () => {
  it('emits a <g> with a body circle, a stem line and a leaf polygon', () => {
    const out = fruit(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<circle\b/);
    expect(out).toMatch(/<line\b/);
    expect(out).toMatch(/<polygon\b/);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(fruit(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(fruit(ctx('z'))).toBe(fruit(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(fruit(ctx('a'))).not.toBe(fruit(ctx('b')));
  });
});
```

Impl `src/subjects/fruit.ts`:

```ts
import { range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const fruit: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const body = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const leafColor = pickColor(rng, palette, 'secondary');
  const radius = range(rng, size * 0.22, size * 0.3);
  const stemLen = range(rng, size * 0.08, size * 0.14);
  const stemTopY = centerY - radius - stemLen;
  const leafW = range(rng, size * 0.1, size * 0.14);
  const leafH = range(rng, size * 0.06, size * 0.1);

  const bodyCircle = svgElement('circle', {
    cx: r(centerX),
    cy: r(centerY + radius * 0.05),
    r: r(radius),
    fill: body,
    stroke,
    'stroke-width': strokeWidth,
  });
  const stem = svgElement('line', {
    x1: r(centerX),
    y1: r(centerY - radius),
    x2: r(centerX),
    y2: r(stemTopY),
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.1),
    'stroke-linecap': 'round',
  });
  const leaf = svgElement('polygon', {
    points: `${r(centerX)},${r(stemTopY)} ${r(centerX + leafW)},${r(stemTopY - leafH * 0.4)} ${r(centerX + leafW * 0.3)},${r(stemTopY + leafH * 0.6)}`,
    fill: leafColor,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });

  return svgElement('g', {}, bodyCircle + stem + leaf);
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

- [ ] **SeedPouch — test + impl**

Test `tests/subjects/seed-pouch.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { seedPouch } from '../../src/subjects/seed-pouch';
import { ctx, countCoordsInBounds } from './_utils';

describe('seedPouch', () => {
  it('emits a <g> with a sack path and at least one drawstring line', () => {
    const out = seedPouch(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<path\b/);
    expect((out.match(/<line\b/g) ?? []).length).toBeGreaterThanOrEqual(1);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(seedPouch(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(seedPouch(ctx('z'))).toBe(seedPouch(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(seedPouch(ctx('a'))).not.toBe(seedPouch(ctx('b')));
  });
});
```

Impl `src/subjects/seed-pouch.ts`:

```ts
import { range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const seedPouch: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const halfW = range(rng, size * 0.2, size * 0.26);
  const topY = centerY - range(rng, size * 0.18, size * 0.24);
  const bottomY = centerY + range(rng, size * 0.22, size * 0.3);
  const neckW = halfW * 0.5;

  const sack = `M ${r(centerX - neckW)} ${r(topY)}
    L ${r(centerX + neckW)} ${r(topY)}
    Q ${r(centerX + halfW * 1.1)} ${r(centerY)} ${r(centerX + halfW * 0.6)} ${r(bottomY)}
    Q ${r(centerX)} ${r(bottomY + size * 0.04)} ${r(centerX - halfW * 0.6)} ${r(bottomY)}
    Q ${r(centerX - halfW * 1.1)} ${r(centerY)} ${r(centerX - neckW)} ${r(topY)} Z`;

  const body = svgElement('path', {
    d: sack,
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const tieY = topY - size * 0.04;
  const tie = svgElement('line', {
    x1: r(centerX - neckW),
    y1: r(topY),
    x2: r(centerX + neckW),
    y2: r(tieY),
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.7),
    'stroke-linecap': 'round',
  });
  const tie2 = svgElement('line', {
    x1: r(centerX - neckW),
    y1: r(tieY),
    x2: r(centerX + neckW),
    y2: r(topY),
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.7),
    'stroke-linecap': 'round',
  });

  return svgElement('g', {}, body + tie + tie2);
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

- [ ] **AnimalHead — test + impl**

Test `tests/subjects/animal-head.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { animalHead } from '../../src/subjects/animal-head';
import { ctx, countCoordsInBounds } from './_utils';

describe('animalHead', () => {
  it('emits a <g> with a face circle, two ear polygons and ≥ 2 dot circles', () => {
    const out = animalHead(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect((out.match(/<circle\b/g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect((out.match(/<polygon\b/g) ?? []).length).toBe(2);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(animalHead(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(animalHead(ctx('z'))).toBe(animalHead(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(animalHead(ctx('a'))).not.toBe(animalHead(ctx('b')));
  });
});
```

Impl `src/subjects/animal-head.ts`:

```ts
import { range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const animalHead: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const radius = range(rng, size * 0.22, size * 0.28);
  const earBase = radius * 0.6;
  const earTip = radius * range(rng, 1.0, 1.2);

  const face = svgElement('circle', {
    cx: r(centerX),
    cy: r(centerY + size * 0.04),
    r: r(radius),
    fill,
    stroke,
    'stroke-width': strokeWidth,
  });
  const leftEar = svgElement('polygon', {
    points: `${r(centerX - radius * 0.7)},${r(centerY - radius * 0.6)} ${r(centerX - earBase)},${r(centerY - earTip)} ${r(centerX - radius * 0.3)},${r(centerY - radius * 0.5)}`,
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const rightEar = svgElement('polygon', {
    points: `${r(centerX + radius * 0.7)},${r(centerY - radius * 0.6)} ${r(centerX + earBase)},${r(centerY - earTip)} ${r(centerX + radius * 0.3)},${r(centerY - radius * 0.5)}`,
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const eye = (cx: number) =>
    svgElement('circle', {
      cx: r(cx),
      cy: r(centerY),
      r: r(size * 0.025),
      fill: stroke,
      stroke,
      'stroke-width': 1,
    });
  const snout = svgElement('circle', {
    cx: r(centerX),
    cy: r(centerY + radius * 0.4),
    r: r(size * 0.04),
    fill: pickColor(rng, palette, 'secondary'),
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.6),
  });

  return svgElement('g', {}, leftEar + rightEar + face + eye(centerX - radius * 0.35) + eye(centerX + radius * 0.35) + snout);
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

- [ ] **WateringCan — test + impl**

Test `tests/subjects/watering-can.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { wateringCan } from '../../src/subjects/watering-can';
import { ctx, countCoordsInBounds } from './_utils';

describe('wateringCan', () => {
  it('emits a <g> with a body path, spout polygon and handle path', () => {
    const out = wateringCan(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect((out.match(/<path\b/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(out).toMatch(/<polygon\b/);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(wateringCan(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(wateringCan(ctx('z'))).toBe(wateringCan(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(wateringCan(ctx('a'))).not.toBe(wateringCan(ctx('b')));
  });
});
```

Impl `src/subjects/watering-can.ts`:

```ts
import { range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const wateringCan: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const bodyW = range(rng, size * 0.32, size * 0.4);
  const bodyH = range(rng, size * 0.28, size * 0.34);
  const left = centerX - bodyW * 0.4;
  const right = centerX + bodyW * 0.4;
  const top = centerY - bodyH * 0.3;
  const bottom = centerY + bodyH * 0.6;

  const body = svgElement('path', {
    d: `M ${r(left)} ${r(top)} L ${r(right)} ${r(top)} L ${r(right + size * 0.05)} ${r(bottom)} L ${r(left - size * 0.05)} ${r(bottom)} Z`,
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const spout = svgElement('polygon', {
    points: `${r(right)},${r(top + size * 0.04)} ${r(right + size * 0.18)},${r(top - size * 0.06)} ${r(right + size * 0.18)},${r(top + size * 0.02)} ${r(right + size * 0.02)},${r(top + size * 0.12)}`,
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const handle = svgElement('path', {
    d: `M ${r(left)} ${r(top)} Q ${r(centerX)} ${r(top - size * 0.18)} ${r(right)} ${r(top)}`,
    fill: 'none',
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.2),
    'stroke-linecap': 'round',
  });
  return svgElement('g', {}, body + spout + handle);
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

- [ ] **WheatStalk — test + impl**

Test `tests/subjects/wheat-stalk.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { wheatStalk } from '../../src/subjects/wheat-stalk';
import { ctx, countCoordsInBounds } from './_utils';

describe('wheatStalk', () => {
  it('emits a <g> with a stalk line and ≥ 4 grain ellipses', () => {
    const out = wheatStalk(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<line\b/);
    expect((out.match(/<ellipse\b/g) ?? []).length).toBeGreaterThanOrEqual(4);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(wheatStalk(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(wheatStalk(ctx('z'))).toBe(wheatStalk(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(wheatStalk(ctx('a'))).not.toBe(wheatStalk(ctx('b')));
  });
});
```

Impl `src/subjects/wheat-stalk.ts`:

```ts
import { intRange, range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const wheatStalk: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const grainColor = pickColor(rng, palette, 'accent');
  const stalkLen = range(rng, size * 0.6, size * 0.72);
  const top = centerY - stalkLen / 2;
  const bottom = centerY + stalkLen / 2;
  const grains = intRange(rng, 4, 6);
  const grainRX = range(rng, size * 0.05, size * 0.07);
  const grainRY = range(rng, size * 0.07, size * 0.1);

  const stalk = svgElement('line', {
    x1: r(centerX),
    y1: r(top),
    x2: r(centerX),
    y2: r(bottom),
    stroke: pickColor(rng, palette, 'secondary'),
    'stroke-width': Math.max(2, strokeWidth * 1.1),
    'stroke-linecap': 'round',
  });

  const grainEls: string[] = [];
  for (let i = 0; i < grains; i++) {
    const t = i / Math.max(1, grains - 1);
    const y = top + t * (stalkLen * 0.55);
    const dx = (i % 2 === 0 ? -1 : 1) * grainRX * 1.2;
    const angle = (i % 2 === 0 ? -25 : 25);
    grainEls.push(
      svgElement('ellipse', {
        cx: r(centerX + dx),
        cy: r(y),
        rx: r(grainRX),
        ry: r(grainRY),
        fill: grainColor,
        stroke,
        'stroke-width': Math.max(1, strokeWidth * 0.6),
        transform: `rotate(${angle} ${r(centerX + dx)} ${r(y)})`,
      }),
    );
  }
  return svgElement('g', {}, stalk + grainEls.join(''));
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

> Note: the `transform="rotate(…)"` adds a `transform` attribute the bounds-checker doesn't read. Bounds remain valid because the un-transformed cx/cy/rx/ry are within the canvas.

### Wire up the cozy-farm theme

- [ ] **Step 8: Create `src/subjects/index.ts`**

```ts
export { hoeTool } from './hoe-tool';
export { fruit } from './fruit';
export { seedPouch } from './seed-pouch';
export { animalHead } from './animal-head';
export { wateringCan } from './watering-can';
export { wheatStalk } from './wheat-stalk';
```

- [ ] **Step 9: Rewrite `src/index.ts`**

```ts
import { defineTheme, definePalette, subject, type Theme } from '@procforge/core';
import {
  hoeTool,
  fruit,
  seedPouch,
  animalHead,
  wateringCan,
  wheatStalk,
} from './subjects';

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
  primitives: [hoeTool, fruit, seedPouch, animalHead, wateringCan, wheatStalk],
  composers: [subject],
  tags: ['food', 'seed', 'tool', 'animal', 'cozy', 'farm'],
});
```

- [ ] **Step 10: Run typecheck and tests**

```
pnpm --filter @procforge/theme-cozy-farm typecheck && pnpm --filter @procforge/theme-cozy-farm test
```

Expected: all tests pass.

- [ ] **Step 11: Commit**

```
git add packages/themes/cozy-farm/src/subjects packages/themes/cozy-farm/src/index.ts packages/themes/cozy-farm/tests/subjects
git commit -m "feat(theme-cozy-farm): 6 subject primitives + subject composer wiring"
```

---

## Task 5: Roguelike-inventory subject primitives

**Files:** mirror under `packages/themes/roguelike-inventory/`. Six primitives: `coin`, `gem`, `key`, `bookCover`, `ringBand`, `dagger`.

- [ ] **Step 1: Create `tests/subjects/_utils.ts`**

```ts
import { makeRng } from '@procforge/core';
import { definePalette } from '@procforge/core';

export const palette = definePalette({
  id: 'rl-test',
  primary: ['#7d4f50'],
  secondary: ['#557c63'],
  accent: ['#f7b801'],
  neutral: ['#181a1f'],
});

export const ctx = (seed: string) => ({
  rng: makeRng(seed),
  palette,
  size: 64,
  centerX: 32,
  centerY: 32,
  strokeWidth: 3,
});

export function countCoordsInBounds(svg: string, lo: number, hi: number): { ok: number; bad: number } {
  let ok = 0;
  let bad = 0;
  const numRe = /-?\d+(?:\.\d+)?/g;
  for (const match of svg.matchAll(/(?:cx|cy|x|y|x1|x2|y1|y2|width|height|r)="([^"]+)"/g)) {
    for (const n of match[1]!.matchAll(numRe)) {
      const v = parseFloat(n[0]);
      if (Number.isNaN(v)) continue;
      if (v >= lo && v <= hi) ok++;
      else bad++;
    }
  }
  for (const match of svg.matchAll(/(?:points|d)="([^"]+)"/g)) {
    for (const n of match[1]!.matchAll(numRe)) {
      const v = parseFloat(n[0]);
      if (Number.isNaN(v)) continue;
      if (v >= lo && v <= hi) ok++;
      else bad++;
    }
  }
  return { ok, bad };
}
```

- [ ] **Coin — test + impl**

Test `tests/subjects/coin.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { coin } from '../../src/subjects/coin';
import { ctx, countCoordsInBounds } from './_utils';

describe('coin', () => {
  it('emits a <g> with two circles and a glyph polygon', () => {
    const out = coin(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect((out.match(/<circle\b/g) ?? []).length).toBe(2);
    expect(out).toMatch(/<polygon\b/);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(coin(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(coin(ctx('z'))).toBe(coin(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(coin(ctx('a'))).not.toBe(coin(ctx('b')));
  });
});
```

Impl `src/subjects/coin.ts`:

```ts
import { intRange, range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const coin: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const outer = range(rng, size * 0.26, size * 0.32);
  const inner = outer * range(rng, 0.78, 0.85);
  const sides = intRange(rng, 4, 6);
  const glyphR = inner * 0.6;
  const points: string[] = [];
  for (let i = 0; i < sides; i++) {
    const a = -Math.PI / 2 + (i / sides) * Math.PI * 2;
    points.push(`${r(centerX + Math.cos(a) * glyphR)},${r(centerY + Math.sin(a) * glyphR)}`);
  }
  return svgElement(
    'g',
    {},
    svgElement('circle', { cx: r(centerX), cy: r(centerY), r: r(outer), fill, stroke, 'stroke-width': strokeWidth }) +
      svgElement('circle', {
        cx: r(centerX),
        cy: r(centerY),
        r: r(inner),
        fill: 'none',
        stroke,
        'stroke-width': Math.max(1, strokeWidth * 0.6),
      }) +
      svgElement('polygon', {
        points: points.join(' '),
        fill: stroke,
        stroke,
        'stroke-width': Math.max(1, strokeWidth * 0.6),
        'stroke-linejoin': 'round',
      }),
  );
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

- [ ] **Gem — test + impl**

Test `tests/subjects/gem.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { gem } from '../../src/subjects/gem';
import { ctx, countCoordsInBounds } from './_utils';

describe('gem', () => {
  it('emits a <g> with a polygon and ≥ 2 facet lines', () => {
    const out = gem(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<polygon\b/);
    expect((out.match(/<line\b/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(gem(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(gem(ctx('z'))).toBe(gem(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(gem(ctx('a'))).not.toBe(gem(ctx('b')));
  });
});
```

Impl `src/subjects/gem.ts`:

```ts
import { range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const gem: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const w = range(rng, size * 0.4, size * 0.5);
  const h = range(rng, size * 0.5, size * 0.6);
  const tipY = centerY + h * 0.5;
  const shoulderY = centerY - h * 0.15;
  const topY = centerY - h * 0.5;

  const points = [
    [centerX, topY],
    [centerX + w / 2, shoulderY],
    [centerX + w / 4, tipY - h * 0.05],
    [centerX, tipY],
    [centerX - w / 4, tipY - h * 0.05],
    [centerX - w / 2, shoulderY],
  ];
  const polyPts = points.map(([x, y]) => `${r(x!)},${r(y!)}`).join(' ');
  const facetA = svgElement('line', {
    x1: r(centerX - w / 2),
    y1: r(shoulderY),
    x2: r(centerX + w / 2),
    y2: r(shoulderY),
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.5),
    'stroke-linecap': 'round',
  });
  const facetB = svgElement('line', {
    x1: r(centerX),
    y1: r(topY),
    x2: r(centerX),
    y2: r(tipY),
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.5),
    'stroke-linecap': 'round',
  });
  const body = svgElement('polygon', {
    points: polyPts,
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  return svgElement('g', {}, body + facetA + facetB);
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

- [ ] **Key — test + impl**

Test `tests/subjects/key.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { key } from '../../src/subjects/key';
import { ctx, countCoordsInBounds } from './_utils';

describe('key', () => {
  it('emits a <g> with bow circle, shaft line and ≥ 2 bit rects', () => {
    const out = key(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<circle\b/);
    expect(out).toMatch(/<line\b/);
    expect((out.match(/<rect\b/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(key(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(key(ctx('z'))).toBe(key(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(key(ctx('a'))).not.toBe(key(ctx('b')));
  });
});
```

Impl `src/subjects/key.ts`:

```ts
import { range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const key: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const bowR = range(rng, size * 0.12, size * 0.16);
  const shaftLen = range(rng, size * 0.36, size * 0.48);
  const bowX = centerX - shaftLen / 2 - bowR * 0.5;
  const tipX = bowX + shaftLen;
  const toothW = range(rng, size * 0.06, size * 0.08);
  const toothH = range(rng, size * 0.08, size * 0.12);

  const bow = svgElement('circle', {
    cx: r(bowX),
    cy: r(centerY),
    r: r(bowR),
    fill,
    stroke,
    'stroke-width': strokeWidth,
  });
  const shaft = svgElement('line', {
    x1: r(bowX + bowR),
    y1: r(centerY),
    x2: r(tipX),
    y2: r(centerY),
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.3),
    'stroke-linecap': 'round',
  });
  const tooth1 = svgElement('rect', {
    x: r(tipX - toothW),
    y: r(centerY),
    width: r(toothW),
    height: r(toothH),
    fill: stroke,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const tooth2 = svgElement('rect', {
    x: r(tipX - toothW * 2.5),
    y: r(centerY),
    width: r(toothW * 0.7),
    height: r(toothH * 0.7),
    fill: stroke,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });

  return svgElement('g', {}, shaft + tooth1 + tooth2 + bow);
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

- [ ] **BookCover — test + impl**

Test `tests/subjects/book-cover.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { bookCover } from '../../src/subjects/book-cover';
import { ctx, countCoordsInBounds } from './_utils';

describe('bookCover', () => {
  it('emits a <g> with a cover rect, a spine line and a clasp rect', () => {
    const out = bookCover(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect((out.match(/<rect\b/g) ?? []).length).toBe(2);
    expect(out).toMatch(/<line\b/);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(bookCover(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(bookCover(ctx('z'))).toBe(bookCover(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(bookCover(ctx('a'))).not.toBe(bookCover(ctx('b')));
  });
});
```

Impl `src/subjects/book-cover.ts`:

```ts
import { range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const bookCover: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const w = range(rng, size * 0.36, size * 0.46);
  const h = range(rng, size * 0.5, size * 0.6);
  const x = centerX - w / 2;
  const y = centerY - h / 2;
  const spineX = x + size * 0.05;
  const claspW = w * 0.08;
  const claspH = h * 0.18;

  const cover = svgElement('rect', {
    x: r(x),
    y: r(y),
    width: r(w),
    height: r(h),
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const spine = svgElement('line', {
    x1: r(spineX),
    y1: r(y),
    x2: r(spineX),
    y2: r(y + h),
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.7),
    'stroke-linecap': 'round',
  });
  const clasp = svgElement('rect', {
    x: r(x + w - claspW * 0.3),
    y: r(centerY - claspH / 2),
    width: r(claspW),
    height: r(claspH),
    fill: pickColor(rng, palette, 'secondary'),
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.7),
    'stroke-linejoin': 'round',
  });

  return svgElement('g', {}, cover + spine + clasp);
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

- [ ] **RingBand — test + impl**

Test `tests/subjects/ring-band.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { ringBand } from '../../src/subjects/ring-band';
import { ctx, countCoordsInBounds } from './_utils';

describe('ringBand', () => {
  it('emits a <g> with a band circle, a setting polygon and a stone circle', () => {
    const out = ringBand(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect((out.match(/<circle\b/g) ?? []).length).toBe(2);
    expect(out).toMatch(/<polygon\b/);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(ringBand(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(ringBand(ctx('z'))).toBe(ringBand(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(ringBand(ctx('a'))).not.toBe(ringBand(ctx('b')));
  });
});
```

Impl `src/subjects/ring-band.ts`:

```ts
import { range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const ringBand: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const bandColor = pickColor(rng, palette, 'primary');
  const stoneColor = pickColor(rng, palette, 'accent');
  const bandR = range(rng, size * 0.22, size * 0.28);
  const settingW = range(rng, size * 0.16, size * 0.22);
  const settingH = range(rng, size * 0.12, size * 0.16);
  const settingY = centerY - bandR;

  const band = svgElement('circle', {
    cx: r(centerX),
    cy: r(centerY + size * 0.04),
    r: r(bandR),
    fill: 'none',
    stroke: bandColor,
    'stroke-width': Math.max(2, strokeWidth * 1.4),
  });
  const setting = svgElement('polygon', {
    points: `${r(centerX - settingW / 2)},${r(settingY)} ${r(centerX + settingW / 2)},${r(settingY)} ${r(centerX + settingW * 0.4)},${r(settingY - settingH)} ${r(centerX - settingW * 0.4)},${r(settingY - settingH)}`,
    fill: bandColor,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const stone = svgElement('circle', {
    cx: r(centerX),
    cy: r(settingY - settingH * 0.45),
    r: r(settingH * 0.32),
    fill: stoneColor,
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.7),
  });
  return svgElement('g', {}, band + setting + stone);
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

- [ ] **Dagger — test + impl**

Test `tests/subjects/dagger.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { dagger } from '../../src/subjects/dagger';
import { ctx, countCoordsInBounds } from './_utils';

describe('dagger', () => {
  it('emits a <g> with a blade polygon, crossguard rect and pommel circle', () => {
    const out = dagger(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<polygon\b/);
    expect(out).toMatch(/<rect\b/);
    expect(out).toMatch(/<circle\b/);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(dagger(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(dagger(ctx('z'))).toBe(dagger(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(dagger(ctx('a'))).not.toBe(dagger(ctx('b')));
  });
});
```

Impl `src/subjects/dagger.ts`:

```ts
import { range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const dagger: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const bladeLen = range(rng, size * 0.36, size * 0.46);
  const bladeW = range(rng, size * 0.05, size * 0.08);
  const guardW = range(rng, size * 0.16, size * 0.22);
  const guardH = Math.max(2, size * 0.04);
  const gripLen = range(rng, size * 0.08, size * 0.12);
  const pommelR = range(rng, size * 0.04, size * 0.06);

  const tipY = centerY - bladeLen * 0.5;
  const guardY = centerY + bladeLen * 0.45;
  const pommelY = guardY + guardH + gripLen + pommelR;

  const blade = svgElement('polygon', {
    points: `${r(centerX)},${r(tipY)} ${r(centerX + bladeW / 2)},${r(guardY)} ${r(centerX - bladeW / 2)},${r(guardY)}`,
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const guard = svgElement('rect', {
    x: r(centerX - guardW / 2),
    y: r(guardY),
    width: r(guardW),
    height: r(guardH),
    fill: stroke,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const pommel = svgElement('circle', {
    cx: r(centerX),
    cy: r(pommelY),
    r: r(pommelR),
    fill,
    stroke,
    'stroke-width': strokeWidth,
  });
  return svgElement('g', {}, blade + guard + pommel);
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
```

### Wire up the roguelike-inventory theme

- [ ] **Step 8: Create `src/subjects/index.ts`**

```ts
export { coin } from './coin';
export { gem } from './gem';
export { key } from './key';
export { bookCover } from './book-cover';
export { ringBand } from './ring-band';
export { dagger } from './dagger';
```

- [ ] **Step 9: Rewrite `src/index.ts`**

```ts
import { defineTheme, definePalette, subject, type Theme } from '@procforge/core';
import {
  coin,
  gem,
  key,
  bookCover,
  ringBand,
  dagger,
} from './subjects';

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
  primitives: [coin, gem, key, bookCover, ringBand, dagger],
  composers: [subject],
  tags: ['inventory', 'item', 'potion', 'rune', 'roguelike', 'rpg'],
});
```

- [ ] **Step 10: Run typecheck and tests**

```
pnpm --filter @procforge/theme-roguelike-inventory typecheck && pnpm --filter @procforge/theme-roguelike-inventory test
```

Expected: all tests pass.

- [ ] **Step 11: Commit**

```
git add packages/themes/roguelike-inventory/src/subjects packages/themes/roguelike-inventory/src/index.ts packages/themes/roguelike-inventory/tests/subjects
git commit -m "feat(theme-roguelike-inventory): 6 subject primitives + subject composer wiring"
```

---

## Task 6: Repo-wide verification + regenerate starter pack

**Files:** none (orchestration + asset regeneration).

- [ ] **Step 1: Build all packages**

```
pnpm install && pnpm build
```

Expected: all packages compile; `packages/cli/dist/cli.js` exists.

- [ ] **Step 2: Run repo-wide lint + typecheck + tests**

```
pnpm lint && pnpm typecheck && pnpm test
```

Expected: zero lint errors; typecheck clean; every package's vitest passes.

- [ ] **Step 3: Regenerate the starter pack**

```
pnpm produce-pack
```

Expected: console reports "200 icons" and a zip size under 6 MB. `starter-pack/` directory + `starter-pack.zip` are written.

- [ ] **Step 4: Run prelaunch-check (full mode, not --ci)**

```
pnpm prelaunch-check
```

Expected: all checks PASS (200 SVGs, 1000 PNGs, manifest shape, itch assets, repo LICENSE, v1.0.0 tag).

- [ ] **Step 5: Visual QA — manually inspect a sample**

Run:
```
pnpm qa-sample
```

Then open one PNG per theme and visually confirm the subject is identifiable:
- `starter-pack/png/256/medieval-fantasy/pf-0000.png` — should look like a sword/shield/potion/scroll/axe/gem with optional decoration shapes behind it.
- `starter-pack/png/256/sci-fi/pf-0000.png` — should look like a blaster/chip/orb/HUD/gear/antenna.
- `starter-pack/png/256/cozy-farm/pf-0000.png` — should look like a hoe/fruit/pouch/animal-head/can/wheat.
- `starter-pack/png/256/roguelike-inventory/pf-0000.png` — should look like a coin/gem/key/book/ring/dagger.

If any output looks wrong (subject occluded by decoration, off-canvas), open the relevant primitive `.ts` and adjust ranges. Re-run `pnpm produce-pack`.

- [ ] **Step 6: Commit regenerated assets**

```
git add starter-pack starter-pack.zip
git commit -m "chore: regenerate starter-pack against new subject primitives"
```

If `starter-pack` is `.gitignore`-d, skip this step. Verify with `git status` first.

---

## Task 7: Documentation updates

**Files:**
- Modify: `docs/THEME-AUTHORING.md`
- Modify: `docs/ARCHITECTURE.md`

- [ ] **Step 1: Update THEME-AUTHORING.md to describe the two-layer model**

Replace section "## 3. Pick primitives + composers" of `docs/THEME-AUTHORING.md` with:

```markdown
## 3. Pick primitives + composers

Procforge ships these in `@procforge/core`:

- **Decoration primitives:** `circle`, `polygon`, `path`, `star` — generic geometric shapes used by the `subject` composer as background flourishes behind a subject.
- **Subject composer:** `subject` — places one of the theme's subject primitives at the centre and adds 0–2 decoration primitives behind it. This is what every Phase 1 starter theme uses.
- **Legacy composers:** `layer`, `mask` — kept exported for expansion-pack themes that want pure abstract output. Phase 1 themes do not register them.

A Phase 1-style theme defines its own **subject primitives** (theme-specific game objects: a sword, a potion bottle, a blaster) and registers only the `subject` composer.
```

Replace section "## 4. Define the theme" with:

```markdown
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
```

Replace section "## 7. Write a custom primitive (advanced)" with:

```markdown
## 7. Write a subject primitive

A subject primitive is `(ctx) => string` returning a single `<g>...</g>` SVG fragment that depicts one game object. Example:

```ts
import { range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const ring: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = pickColor(rng, palette, 'accent');
  const r = range(rng, size * 0.22, size * 0.3);
  return svgElement(
    'g',
    {},
    svgElement('circle', { cx: centerX, cy: centerY, r, fill: 'none', stroke, 'stroke-width': strokeWidth * 1.5 }),
  );
};
```

**Subject contract:**
- Returns a single `<g>` wrapping all sub-elements.
- Coordinates stay inside `[size * 0.1, size * 0.9]`.
- Stroke colour from `palette.neutral`. Subject fill from `palette.primary` ∪ `palette.accent` (no `'none'`).
- `stroke-linejoin="round"` and `stroke-linecap="round"` where applicable.
- Internal jitter (proportions, rotation, segment counts) consumes RNG so different seeds produce visibly different output. Two identical seeds must produce byte-identical output.

Add it to your theme's `primitives` array. Aim for 6 subjects per theme — enough variety, balanced authoring effort.
```

- [ ] **Step 2: Append a determinism-baseline note to ARCHITECTURE.md**

At the bottom of `docs/ARCHITECTURE.md`, append:

```markdown

## Determinism baseline

The deterministic-output guarantee is byte-stable from a baseline. Adding or changing primitives, composers, or palette entries in any theme breaks the byte-identity for that theme — `(theme.id, seed)` after the change will produce a different SVG than before.

The current baseline began with the introduction of theme-specific subject primitives (see `docs/superpowers/specs/2026-05-01-game-oriented-primitives-design.md`). Earlier abstract output produced before this baseline is not regenerable from the same seeds.

Future theme-content changes (palette tweaks, new primitives) reset the baseline again. Document any baseline reset in CHANGELOG / release notes so buyers who depend on specific seeds are aware.
```

- [ ] **Step 3: Commit docs**

```
git add docs/THEME-AUTHORING.md docs/ARCHITECTURE.md
git commit -m "docs: two-layer primitive model + determinism baseline note"
```

---

## Task 8: Final verification

**Files:** none.

- [ ] **Step 1: Confirm CI-equivalent pipeline passes locally**

Run the same sequence CI runs:

```
pnpm install && pnpm build && pnpm lint && pnpm typecheck && pnpm test && pnpm produce-pack && pnpm prelaunch-check --ci
```

Expected: every step exits 0.

- [ ] **Step 2: Spot-check the web preview**

Run:
```
pnpm --filter @procforge/web-preview dev
```

Open `http://localhost:5173`, switch theme dropdown across all four themes, click "Generate" repeatedly, confirm each theme produces recognisable subjects with decoration variation.

- [ ] **Step 3: Final summary commit if any tweaks were made**

If Step 1 or Step 2 surfaced last-minute fixes, commit them with a focused message. Otherwise, this step is a no-op.

```
git status
```

If clean, no commit. If dirty, `git add -p` only the relevant files, commit with a message describing the tweak.

---

## Self-Review (already performed by plan author)

- **Spec coverage:** §2 (goals/non-goals) → covered by all tasks. §3.1 (file layout) → Task 1 (composer), Tasks 2–5 (subjects + barrels + theme rewires). §3.2 (subject composer algorithm) → Task 1 implementation. §3.3 (theme module changes) → Tasks 2–5 step 9. §3.4 (subject primitive contract) → Tasks 2–5 implementation code. §3.5 (24 subject primitives, 6 per theme) → Tasks 2–5 each implement 6. §3.6 (determinism) → preserved by passing same `rng` through; Task 7 step 2 adds the baseline note. §4 (testing) → per-primitive structural tests in Tasks 2–5; composer tests in Task 1; existing per-theme uniqueness tests retained. §5 (migration) → Task 6 regenerates assets, Task 7 updates docs. §6 (open questions) → `layer`/`mask` retained in core barrel, `Theme.primitives` semantically repurposed without rename.
- **Placeholder scan:** no TBDs/TODOs in steps; every code block is complete.
- **Type consistency:** `PrimitiveFn` signature used identically in all 24 primitives. `subject` composer signature matches `ComposerFn`. `Theme.primitives` shape is unchanged.
- **Ambiguity:** "decoration count distribution roughly matches 25/50/25" — Task 1's test allows ±10pp tolerance so the assertion is concrete, not vibes-based.
