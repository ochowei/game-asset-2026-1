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
