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
