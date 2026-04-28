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
