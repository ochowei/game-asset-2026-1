import { describe, it, expect } from 'vitest';
import { round2 } from '../src/numeric';

describe('round2', () => {
  it('rounds to two decimal places', () => {
    expect(round2(1.234)).toBe(1.23);
    expect(round2(1.235)).toBe(1.24);
    expect(round2(0.005)).toBe(0.01);
  });

  it('returns whole numbers unchanged', () => {
    expect(round2(0)).toBe(0);
    expect(round2(7)).toBe(7);
    expect(round2(-3)).toBe(-3);
  });

  it('handles negatives', () => {
    expect(round2(-1.234)).toBe(-1.23);
    expect(round2(-1.236)).toBe(-1.24);
  });

  it('keeps already-2dp values', () => {
    expect(round2(1.23)).toBe(1.23);
    expect(round2(57.6)).toBe(57.6);
  });
});
