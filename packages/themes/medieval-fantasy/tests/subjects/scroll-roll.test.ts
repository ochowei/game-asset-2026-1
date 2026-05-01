import { describe, it, expect } from 'vitest';
import { scrollRoll } from '../../src/subjects/scroll-roll';
import { ctx, assertCoordsInBounds } from './_utils';

describe('scrollRoll', () => {
  it('emits a <g> with two ellipses (rolled ends) and a body rect', () => {
    const out = scrollRoll(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect((out.match(/<ellipse\b/g) ?? []).length).toBe(2);
    expect(out).toMatch(/<rect\b/);
  });
  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(scrollRoll(ctx(seed)), 64)).not.toThrow();
    }
  });
  it('uses neutral palette for stroke and a non-none fill on the body', () => {
    const out = scrollRoll(ctx('s'));
    expect(out).toContain('stroke="#111111"');
    const firstFill = /<\w+\b[^>]*\bfill="([^"]+)"/.exec(out);
    expect(firstFill?.[1]).toBeDefined();
    expect(firstFill?.[1]).not.toBe('none');
  });
  it('applies stroke-linejoin="round" or stroke-linecap="round" on stroked elements', () => {
    const out = scrollRoll(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });
  it('is deterministic', () => {
    expect(scrollRoll(ctx('z'))).toBe(scrollRoll(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(scrollRoll(ctx('a'))).not.toBe(scrollRoll(ctx('b')));
  });
});
