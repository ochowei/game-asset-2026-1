import { describe, it, expect } from 'vitest';
import { generateOne, makeRng } from '@procforge/core';
import { medievalFantasy } from '../src/index';
import { axeHead } from '../src/subjects/axe-head';
import { axeHeadBases } from '../src/subjects/axe-head.bases';

describe('axeHead primitive (Path B)', () => {
  it('exposes 5 bases', () => {
    expect(axeHeadBases).toHaveLength(5);
  });

  it('produces deterministic output for same seed', () => {
    const a = generateOne({ theme: medievalFantasy, seed: 'axe-X', size: 64 });
    const b = generateOne({ theme: medievalFantasy, seed: 'axe-X', size: 64 });
    expect(a).toBe(b);
  });

  it('replaces every {{role}} token across many seeds', () => {
    for (let i = 0; i < 20; i++) {
      const out = generateOne({ theme: medievalFantasy, seed: `axe-${i}`, size: 64 });
      expect(out, `seed axe-${i}`).not.toContain('{{');
    }
  });

  it('does not mirror (asymmetric subject)', () => {
    for (let i = 0; i < 30; i++) {
      const rng = makeRng(`axe-mir-${i}`);
      const fragment = axeHead({
        rng,
        palette: medievalFantasy.palette,
        size: 64,
        centerX: 32,
        centerY: 32,
        strokeWidth: 2,
      });
      const sm = fragment.match(/scale\((-?\d+(?:\.\d+)?),/);
      expect(sm).not.toBeNull();
      expect(Number(sm![1])).toBeGreaterThan(0);
    }
  });
});
