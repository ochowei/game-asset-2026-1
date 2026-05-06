import { describe, it, expect } from 'vitest';
import { generateOne, makeRng } from '@procforge/core';
import { medievalFantasy } from '../src/index';
import { gemstone } from '../src/subjects/gemstone';
import { gemstoneBases } from '../src/subjects/gemstone.bases';

describe('gemstone primitive (Path B)', () => {
  it('exposes 5 bases', () => {
    expect(gemstoneBases).toHaveLength(5);
  });

  it('produces deterministic output for same seed', () => {
    const a = generateOne({ theme: medievalFantasy, seed: 'gem-X', size: 64 });
    const b = generateOne({ theme: medievalFantasy, seed: 'gem-X', size: 64 });
    expect(a).toBe(b);
  });

  it('replaces every {{role}} token across many seeds', () => {
    for (let i = 0; i < 20; i++) {
      const out = generateOne({ theme: medievalFantasy, seed: `gem-${i}`, size: 64 });
      expect(out, `seed gem-${i}`).not.toContain('{{');
    }
  });

  it('emits a transform inside the declared bounds', () => {
    const rng = makeRng('test-gem');
    const fragment = gemstone({
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
