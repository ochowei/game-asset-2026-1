import { describe, it, expect } from 'vitest';
import { axeHead } from '../../src/subjects/axe-head';
import { ctx, assertCoordsInBounds } from './_utils';

describe('axeHead', () => {
  it('emits a <g> with a haft line and a blade polygon', () => {
    const out = axeHead(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<line\b/);
    expect(out).toMatch(/<polygon\b/);
  });
  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(axeHead(ctx(seed)), 64)).not.toThrow();
    }
  });
  it('uses neutral palette for stroke and a non-none fill on the body', () => {
    const out = axeHead(ctx('s'));
    expect(out).toContain('stroke="#111111"');
    // axeHead's first child is the haft <line>, which has no fill. Find the
    // first element that DOES carry a fill attribute (the blade polygon).
    const firstFill = /<\w+\b[^>]*\bfill="([^"]+)"/.exec(out);
    expect(firstFill?.[1]).toBeDefined();
    expect(firstFill?.[1]).not.toBe('none');
  });
  it('applies stroke-linejoin="round" or stroke-linecap="round" on stroked elements', () => {
    const out = axeHead(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });
  it('is deterministic', () => {
    expect(axeHead(ctx('z'))).toBe(axeHead(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(axeHead(ctx('a'))).not.toBe(axeHead(ctx('b')));
  });
});
