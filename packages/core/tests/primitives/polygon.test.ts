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
