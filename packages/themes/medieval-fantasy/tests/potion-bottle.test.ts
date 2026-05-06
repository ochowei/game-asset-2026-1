import { describe, it, expect } from 'vitest';
import { generateOne, makeRng } from '@procforge/core';
import { medievalFantasy } from '../src/index';
import { potionBottle } from '../src/subjects/potion-bottle';
import { potionBottleBases } from '../src/subjects/potion-bottle.bases';

describe('potionBottle primitive (Path B)', () => {
  it('exposes 5 bases', () => {
    expect(potionBottleBases).toHaveLength(5);
  });

  it('produces deterministic output for same seed', () => {
    const a = generateOne({ theme: medievalFantasy, seed: 'potion-X', size: 64 });
    const b = generateOne({ theme: medievalFantasy, seed: 'potion-X', size: 64 });
    expect(a).toBe(b);
  });

  it('replaces every {{role}} token across many seeds', () => {
    for (let i = 0; i < 20; i++) {
      const out = generateOne({ theme: medievalFantasy, seed: `potion-${i}`, size: 64 });
      expect(out, `seed potion-${i}`).not.toContain('{{');
    }
  });

  it('emits a transform inside the declared bounds', () => {
    const rng = makeRng('test-potion');
    const fragment = potionBottle({
      rng,
      palette: medievalFantasy.palette,
      size: 64,
      centerX: 32,
      centerY: 32,
      strokeWidth: 2,
    });
    const m = fragment.match(/rotate\((-?\d+(?:\.\d+)?)\)/);
    expect(m, fragment).not.toBeNull();
    expect(Number(m![1])).toBeGreaterThanOrEqual(-8);
    expect(Number(m![1])).toBeLessThanOrEqual(8);
  });
});
