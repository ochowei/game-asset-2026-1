import { describe, it, expect } from 'vitest';
import { gem } from '../../src/subjects/gem';
import { ctx, assertCoordsInBounds } from './_utils';

describe('gem', () => {
  it('emits a <g> with a polygon and >= 2 facet lines', () => {
    const out = gem(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<polygon\b/);
    expect((out.match(/<line\b/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });
  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(gem(ctx(seed)), 64)).not.toThrow();
    }
  });
  it('uses neutral palette for stroke and a non-none fill on the body', () => {
    const out = gem(ctx('s'));
    expect(out).toContain('stroke="#181a1f"');
    const firstFill = /<\w+\b[^>]*\bfill="([^"]+)"/.exec(out);
    expect(firstFill?.[1]).toBeDefined();
    expect(firstFill?.[1]).not.toBe('none');
  });
  it('applies stroke-linejoin or stroke-linecap "round"', () => {
    const out = gem(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });
  it('is deterministic', () => {
    expect(gem(ctx('z'))).toBe(gem(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(gem(ctx('a'))).not.toBe(gem(ctx('b')));
  });
});
