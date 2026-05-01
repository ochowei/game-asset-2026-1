import { describe, it, expect } from 'vitest';
import { coin } from '../../src/subjects/coin';
import { ctx, assertCoordsInBounds } from './_utils';

describe('coin', () => {
  it('emits a <g> with two circles and a glyph polygon', () => {
    const out = coin(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect((out.match(/<circle\b/g) ?? []).length).toBe(2);
    expect(out).toMatch(/<polygon\b/);
  });
  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(coin(ctx(seed)), 64)).not.toThrow();
    }
  });
  it('uses neutral palette for stroke and a non-none fill on the body', () => {
    const out = coin(ctx('s'));
    expect(out).toContain('stroke="#181a1f"');
    const firstFill = /<\w+\b[^>]*\bfill="([^"]+)"/.exec(out);
    expect(firstFill?.[1]).toBeDefined();
    expect(firstFill?.[1]).not.toBe('none');
  });
  it('applies stroke-linejoin or stroke-linecap "round"', () => {
    const out = coin(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });
  it('is deterministic', () => {
    expect(coin(ctx('z'))).toBe(coin(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(coin(ctx('a'))).not.toBe(coin(ctx('b')));
  });
});
