import { describe, it, expect } from 'vitest';
import { seedPouch } from '../../src/subjects/seed-pouch';
import { ctx, assertCoordsInBounds } from './_utils';

describe('seedPouch', () => {
  it('emits a <g> with a sack path and at least one drawstring line', () => {
    const out = seedPouch(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<path\b/);
    expect((out.match(/<line\b/g) ?? []).length).toBeGreaterThanOrEqual(1);
  });
  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(seedPouch(ctx(seed)), 64)).not.toThrow();
    }
  });
  it('uses neutral palette for stroke and a non-none fill on the body', () => {
    const out = seedPouch(ctx('s'));
    expect(out).toContain('stroke="#3d3027"');
    const firstFill = /<\w+\b[^>]*\bfill="([^"]+)"/.exec(out);
    expect(firstFill?.[1]).toBeDefined();
    expect(firstFill?.[1]).not.toBe('none');
  });
  it('applies stroke-linejoin or stroke-linecap "round"', () => {
    const out = seedPouch(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });
  it('is deterministic', () => {
    expect(seedPouch(ctx('z'))).toBe(seedPouch(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(seedPouch(ctx('a'))).not.toBe(seedPouch(ctx('b')));
  });
});
