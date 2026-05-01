import { describe, it, expect } from 'vitest';
import { energyOrb } from '../../src/subjects/energy-orb';
import { ctx, assertCoordsInBounds } from './_utils';

describe('energyOrb', () => {
  it('emits a <g> with two circles and >= 4 ray lines', () => {
    const out = energyOrb(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect((out.match(/<circle\b/g) ?? []).length).toBe(2);
    expect((out.match(/<line\b/g) ?? []).length).toBeGreaterThanOrEqual(4);
  });
  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(energyOrb(ctx(seed)), 64)).not.toThrow();
    }
  });
  it('uses neutral palette for stroke and a non-none fill on the body', () => {
    const out = energyOrb(ctx('s'));
    expect(out).toContain('stroke="#111111"');
    const firstFill = /<\w+\b[^>]*\bfill="([^"]+)"/.exec(out);
    expect(firstFill?.[1]).toBeDefined();
    expect(firstFill?.[1]).not.toBe('none');
  });
  it('applies stroke-linejoin or stroke-linecap "round"', () => {
    const out = energyOrb(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });
  it('is deterministic', () => {
    expect(energyOrb(ctx('z'))).toBe(energyOrb(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(energyOrb(ctx('a'))).not.toBe(energyOrb(ctx('b')));
  });
});
