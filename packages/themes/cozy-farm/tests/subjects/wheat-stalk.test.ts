import { describe, it, expect } from 'vitest';
import { wheatStalk } from '../../src/subjects/wheat-stalk';
import { ctx, assertCoordsInBounds } from './_utils';

describe('wheatStalk', () => {
  it('emits a <g> with a stalk line and >= 4 grain ellipses', () => {
    const out = wheatStalk(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<line\b/);
    expect((out.match(/<ellipse\b/g) ?? []).length).toBeGreaterThanOrEqual(4);
  });
  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(wheatStalk(ctx(seed)), 64)).not.toThrow();
    }
  });
  it('uses neutral palette for stroke and a non-none fill on the body', () => {
    const out = wheatStalk(ctx('s'));
    expect(out).toContain('stroke="#3d3027"');
    const firstFill = /<\w+\b[^>]*\bfill="([^"]+)"/.exec(out);
    expect(firstFill?.[1]).toBeDefined();
    expect(firstFill?.[1]).not.toBe('none');
  });
  it('applies stroke-linejoin or stroke-linecap "round"', () => {
    const out = wheatStalk(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });
  it('is deterministic', () => {
    expect(wheatStalk(ctx('z'))).toBe(wheatStalk(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(wheatStalk(ctx('a'))).not.toBe(wheatStalk(ctx('b')));
  });
});
