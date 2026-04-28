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
    expect(pts.length).toBeGreaterThanOrEqual(8);
  });

  it('is deterministic', () => {
    const ctx = { palette, size: 64, centerX: 32, centerY: 32, strokeWidth: 2 };
    expect(star({ ...ctx, rng: makeRng('z') })).toBe(star({ ...ctx, rng: makeRng('z') }));
  });
});
