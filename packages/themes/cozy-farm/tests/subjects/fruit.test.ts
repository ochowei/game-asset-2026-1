import { describe, it, expect } from 'vitest';
import { fruit } from '../../src/subjects/fruit';
import { ctx, assertCoordsInBounds } from './_utils';

describe('fruit', () => {
  it('emits a <g> with a body circle, a stem line and a leaf polygon', () => {
    const out = fruit(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<circle\b/);
    expect(out).toMatch(/<line\b/);
    expect(out).toMatch(/<polygon\b/);
  });
  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(fruit(ctx(seed)), 64)).not.toThrow();
    }
  });
  it('uses neutral palette for stroke and a non-none fill on the body', () => {
    const out = fruit(ctx('s'));
    expect(out).toContain('stroke="#3d3027"');
    const firstFill = /<\w+\b[^>]*\bfill="([^"]+)"/.exec(out);
    expect(firstFill?.[1]).toBeDefined();
    expect(firstFill?.[1]).not.toBe('none');
  });
  it('applies stroke-linejoin or stroke-linecap "round"', () => {
    const out = fruit(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });
  it('is deterministic', () => {
    expect(fruit(ctx('z'))).toBe(fruit(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(fruit(ctx('a'))).not.toBe(fruit(ctx('b')));
  });
});
