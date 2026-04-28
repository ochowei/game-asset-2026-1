import { describe, it, expect } from 'vitest';
import { makeRng, pick, range, intRange } from '../src/seed';

describe('makeRng', () => {
  it('produces deterministic output for the same seed', () => {
    const a = makeRng('abc');
    const b = makeRng('abc');
    expect(a()).toBe(b());
    expect(a()).toBe(b());
  });

  it('produces different output for different seeds', () => {
    expect(makeRng('abc')()).not.toBe(makeRng('xyz')());
  });
});

describe('pick', () => {
  it('returns an item from the list', () => {
    const rng = makeRng('seed');
    expect(['a', 'b', 'c']).toContain(pick(rng, ['a', 'b', 'c']));
  });

  it('throws on empty array', () => {
    expect(() => pick(makeRng('s'), [])).toThrow(/empty/);
  });
});

describe('range', () => {
  it('returns a value in [min, max)', () => {
    const rng = makeRng('seed');
    for (let i = 0; i < 200; i++) {
      const v = range(rng, 5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThan(10);
    }
  });
});

describe('intRange', () => {
  it('returns an integer in [min, max] (inclusive)', () => {
    const rng = makeRng('seed');
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) {
      const v = intRange(rng, 1, 5);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(5);
      seen.add(v);
    }
    expect(seen.size).toBe(5);
  });
});
