import { describe, it, expect } from 'vitest';
import { generateOne, makeRng } from '@procforge/core';
import { medievalFantasy } from '../src/index';
import { shieldFrame } from '../src/subjects/shield-frame';
import { shieldFrameBases } from '../src/subjects/shield-frame.bases';

describe('shieldFrame primitive (Path B)', () => {
  it('exposes 5 bases', () => {
    expect(shieldFrameBases).toHaveLength(5);
  });

  it('produces deterministic output for same seed', () => {
    const a = generateOne({ theme: medievalFantasy, seed: 'shield-X', size: 64 });
    const b = generateOne({ theme: medievalFantasy, seed: 'shield-X', size: 64 });
    expect(a).toBe(b);
  });

  it('replaces every {{role}} token across many seeds', () => {
    for (let i = 0; i < 20; i++) {
      const out = generateOne({ theme: medievalFantasy, seed: `shield-${i}`, size: 64 });
      expect(out, `seed shield-${i}`).not.toContain('{{');
    }
  });

  it('emits a transform inside the declared bounds', () => {
    const rng = makeRng('test-shield');
    const fragment = shieldFrame({
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

  it('may produce mirrored output (negative sx) over many seeds', () => {
    let sawMirror = false;
    for (let i = 0; i < 50 && !sawMirror; i++) {
      const rng = makeRng(`shield-mir-${i}`);
      const fragment = shieldFrame({
        rng,
        palette: medievalFantasy.palette,
        size: 64,
        centerX: 32,
        centerY: 32,
        strokeWidth: 2,
      });
      const sm = fragment.match(/scale\((-?\d+(?:\.\d+)?),/);
      if (sm && Number(sm[1]) < 0) sawMirror = true;
    }
    expect(sawMirror).toBe(true);
  });
});
