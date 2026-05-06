import { describe, it, expect } from 'vitest';
import { generateOne, makeRng } from '@procforge/core';
import { medievalFantasy } from '../src/index';
import { swordBlade } from '../src/subjects/sword-blade';
import { swordBladeBases } from '../src/subjects/sword-blade.bases';

describe('swordBlade primitive (Path B)', () => {
  it('exposes 5 bases', () => {
    expect(swordBladeBases).toHaveLength(5);
  });

  it('produces deterministic output for same seed', () => {
    const a = generateOne({ theme: medievalFantasy, seed: 'sword-X', size: 64 });
    const b = generateOne({ theme: medievalFantasy, seed: 'sword-X', size: 64 });
    expect(a).toBe(b);
  });

  it('replaces every {{role}} token', () => {
    const out = generateOne({ theme: medievalFantasy, seed: 'sword-Y', size: 64 });
    expect(out).not.toContain('{{');
  });

  it('emits a transform inside the declared bounds', () => {
    const rng = makeRng('test-seed');
    const fragment = swordBlade({
      rng,
      palette: medievalFantasy.palette,
      size: 64,
      centerX: 32,
      centerY: 32,
      strokeWidth: 2,
    });
    const m = fragment.match(/rotate\((-?\d+(?:\.\d+)?)\)/);
    expect(m, fragment).not.toBeNull();
    const deg = Number(m![1]);
    expect(deg).toBeGreaterThanOrEqual(-8);
    expect(deg).toBeLessThanOrEqual(8);
  });

  it('does not mirror (asymmetric subject)', () => {
    // Run many seeds; sx never goes negative.
    for (let i = 0; i < 30; i++) {
      const rng = makeRng(`mir-${i}`);
      const fragment = swordBlade({
        rng,
        palette: medievalFantasy.palette,
        size: 64,
        centerX: 32,
        centerY: 32,
        strokeWidth: 2,
      });
      const sm = fragment.match(/scale\((-?\d+(?:\.\d+)?),/);
      expect(sm, fragment).not.toBeNull();
      expect(Number(sm![1])).toBeGreaterThan(0);
    }
  });
});
