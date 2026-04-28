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
