import { describe, it, expect } from 'vitest';
import { blasterBody } from '../../src/subjects/blaster-body';
import { ctx, assertCoordsInBounds } from './_utils';

describe('blasterBody', () => {
  it('emits a <g> with a body path, barrel rect and grip rect', () => {
    const out = blasterBody(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<path\b/);
    expect((out.match(/<rect\b/g) ?? []).length).toBe(2);
  });
  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(blasterBody(ctx(seed)), 64)).not.toThrow();
    }
  });
  it('uses neutral palette for stroke and a non-none fill on the body', () => {
    const out = blasterBody(ctx('s'));
    expect(out).toContain('stroke="#111111"');
    const firstFill = /<\w+\b[^>]*\bfill="([^"]+)"/.exec(out);
    expect(firstFill?.[1]).toBeDefined();
    expect(firstFill?.[1]).not.toBe('none');
  });
  it('applies stroke-linejoin or stroke-linecap "round"', () => {
    const out = blasterBody(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });
  it('is deterministic', () => {
    expect(blasterBody(ctx('z'))).toBe(blasterBody(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(blasterBody(ctx('a'))).not.toBe(blasterBody(ctx('b')));
  });
});
