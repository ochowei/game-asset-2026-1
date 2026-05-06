import { describe, it, expect } from 'vitest';
import { makeRng, definePalette, applyBaseVariation } from '../src';

const palette = definePalette({
  id: 'test',
  primary: ['#aa0000'],
  secondary: ['#00aa00'],
  accent: ['#0000aa'],
  neutral: ['#111111'],
});

const baseA = '<g><rect x="10" y="10" width="20" height="20" fill="{{primary}}" stroke="{{neutral}}"/></g>';
const baseB = '<g><circle cx="32" cy="32" r="16" fill="{{accent}}"/></g>';

describe('applyBaseVariation', () => {
  it('picks one of the supplied bases deterministically given seed', () => {
    const rng1 = makeRng('seed-x');
    const rng2 = makeRng('seed-x');
    const a = applyBaseVariation({ rng: rng1, bases: [baseA, baseB], palette, size: 64, allowMirror: false });
    const b = applyBaseVariation({ rng: rng2, bases: [baseA, baseB], palette, size: 64, allowMirror: false });
    expect(a).toBe(b);
  });

  it('replaces every {{role}} token with a hex value', () => {
    const rng = makeRng('seed-y');
    const out = applyBaseVariation({ rng, bases: [baseA], palette, size: 64, allowMirror: false });
    expect(out).not.toContain('{{');
    expect(out).toMatch(/#[0-9a-fA-F]{6}/);
  });

  it('emits a transform within declared bounds', () => {
    const rng = makeRng('seed-z');
    const out = applyBaseVariation({ rng, bases: [baseA], palette, size: 64, allowMirror: false });
    const m = out.match(/rotate\((-?\d+(?:\.\d+)?)\)/);
    expect(m).not.toBeNull();
    const deg = Number(m![1]);
    expect(deg).toBeGreaterThanOrEqual(-8);
    expect(deg).toBeLessThanOrEqual(8);
    const sm = out.match(/scale\((-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\)/);
    expect(sm).not.toBeNull();
    const sx = Math.abs(Number(sm![1]));
    expect(sx).toBeGreaterThanOrEqual(0.95);
    expect(sx).toBeLessThanOrEqual(1.05);
  });

  it('only mirrors when allowMirror=true', () => {
    const rng = makeRng('mirror-seed');
    const out = applyBaseVariation({ rng, bases: [baseA], palette, size: 64, allowMirror: false });
    const m = out.match(/scale\(([^,]+),/);
    expect(Number(m![1])).toBeGreaterThan(0);
  });

  it('mirror gate actually flips sx when allowMirror=true (vs always positive when false)', () => {
    // Find any seed where allowMirror=true produces a mirrored output, then
    // confirm the same seed with allowMirror=false produces a non-mirrored output.
    let mirrorSeed: string | null = null;
    for (let i = 0; i < 100 && mirrorSeed === null; i++) {
      const s = `mir-probe-${i}`;
      const rng = makeRng(s);
      const out = applyBaseVariation({ rng, bases: [baseA], palette, size: 64, allowMirror: true });
      const m = out.match(/scale\((-?\d+(?:\.\d+)?),/);
      expect(m).not.toBeNull();
      if (Number(m![1]) < 0) mirrorSeed = s;
    }
    expect(mirrorSeed, 'expected at least one seed in 100 to mirror with allowMirror=true').not.toBeNull();

    const rngOff = makeRng(mirrorSeed!);
    const offOut = applyBaseVariation({ rng: rngOff, bases: [baseA], palette, size: 64, allowMirror: false });
    const offMatch = offOut.match(/scale\((-?\d+(?:\.\d+)?),/);
    expect(offMatch).not.toBeNull();
    expect(Number(offMatch![1])).toBeGreaterThan(0);
  });

  it('consumes the same number of RNG draws regardless of which {{role}} tokens the base uses', () => {
    // baseA uses {primary, neutral}; baseC below uses only {accent}. After
    // applyBaseVariation runs on each with the same starting seed, the next
    // RNG draw must produce the same value — which is only possible if all
    // 4 palette draws happened in both cases.
    const baseC = '<g><polygon points="32,8 56,56 8,56" fill="{{accent}}"/></g>';

    const rng1 = makeRng('cross-base-seed');
    applyBaseVariation({ rng: rng1, bases: [baseA], palette, size: 64, allowMirror: false });
    const after1 = rng1();

    const rng2 = makeRng('cross-base-seed');
    applyBaseVariation({ rng: rng2, bases: [baseC], palette, size: 64, allowMirror: false });
    const after2 = rng2();

    expect(after1).toBe(after2);
  });
});
