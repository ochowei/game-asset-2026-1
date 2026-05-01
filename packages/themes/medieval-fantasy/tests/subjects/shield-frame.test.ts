import { describe, it, expect } from 'vitest';
import { shieldFrame } from '../../src/subjects/shield-frame';
import { ctx, assertCoordsInBounds } from './_utils';

describe('shieldFrame', () => {
  it('emits a <g> wrapper containing two paths', () => {
    const out = shieldFrame(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out.endsWith('</g>')).toBe(true);
    expect((out.match(/<path\b/g) ?? []).length).toBe(2);
  });
  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(shieldFrame(ctx(seed)), 64)).not.toThrow();
    }
  });
  it('uses neutral palette for stroke and a non-none fill on the body', () => {
    const out = shieldFrame(ctx('s'));
    expect(out).toContain('stroke="#111111"');
    const firstFill = /<\w+\b[^>]*\bfill="([^"]+)"/.exec(out);
    expect(firstFill?.[1]).toBeDefined();
    expect(firstFill?.[1]).not.toBe('none');
  });
  it('applies stroke-linejoin="round" or stroke-linecap="round" on stroked elements', () => {
    const out = shieldFrame(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });
  it('is deterministic', () => {
    expect(shieldFrame(ctx('z'))).toBe(shieldFrame(ctx('z')));
  });
  it('different seeds yield different output', () => {
    expect(shieldFrame(ctx('a'))).not.toBe(shieldFrame(ctx('b')));
  });
});
