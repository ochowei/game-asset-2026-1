import { describe, it, expect } from 'vitest';
import { swordBlade } from '../../src/subjects/sword-blade';
import { ctx, assertCoordsInBounds } from './_utils';

describe('swordBlade', () => {
  it('emits a <g> wrapper', () => {
    const out = swordBlade(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out.endsWith('</g>')).toBe(true);
  });

  it('contains a blade polygon, a crossguard rect, a grip line and a pommel circle', () => {
    const out = swordBlade(ctx('s'));
    expect(out).toMatch(/<polygon\b/);
    expect(out).toMatch(/<rect\b/);
    expect(out).toMatch(/<line\b/);
    expect(out).toMatch(/<circle\b/);
  });

  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(swordBlade(ctx(seed)), 64)).not.toThrow();
    }
  });

  it('uses neutral palette for stroke and a non-none fill on the body', () => {
    const out = swordBlade(ctx('s'));
    expect(out).toContain('stroke="#111111"');
    const firstFill = /<\w+\b[^>]*\bfill="([^"]+)"/.exec(out);
    expect(firstFill?.[1]).toBeDefined();
    expect(firstFill?.[1]).not.toBe('none');
  });

  it('applies stroke-linejoin="round" or stroke-linecap="round" on stroked elements', () => {
    const out = swordBlade(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });

  it('is deterministic for the same seed', () => {
    expect(swordBlade(ctx('z'))).toBe(swordBlade(ctx('z')));
  });

  it('produces different output for different seeds', () => {
    expect(swordBlade(ctx('a'))).not.toBe(swordBlade(ctx('b')));
  });
});
