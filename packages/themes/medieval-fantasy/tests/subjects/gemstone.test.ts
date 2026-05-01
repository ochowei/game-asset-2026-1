import { describe, it, expect } from 'vitest';
import { gemstone } from '../../src/subjects/gemstone';
import { ctx, assertCoordsInBounds } from './_utils';

describe('gemstone', () => {
  it('emits a <g> with a polygon and at least one facet line', () => {
    const out = gemstone(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<polygon\b/);
    expect((out.match(/<line\b/g) ?? []).length).toBeGreaterThanOrEqual(1);
  });
  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(gemstone(ctx(seed)), 64)).not.toThrow();
    }
  });
  it('uses neutral palette for stroke and a non-none fill on the body', () => {
    const out = gemstone(ctx('s'));
    expect(out).toContain('stroke="#111111"');
    const firstFill = /<\w+\b[^>]*\bfill="([^"]+)"/.exec(out);
    expect(firstFill?.[1]).toBeDefined();
    expect(firstFill?.[1]).not.toBe('none');
  });
  it('applies stroke-linejoin="round" or stroke-linecap="round" on stroked elements', () => {
    const out = gemstone(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });
  it('is deterministic', () => {
    expect(gemstone(ctx('z'))).toBe(gemstone(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(gemstone(ctx('a'))).not.toBe(gemstone(ctx('b')));
  });
});
