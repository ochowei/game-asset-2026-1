import { describe, it, expect } from 'vitest';
import { potionBottle } from '../../src/subjects/potion-bottle';
import { ctx, assertCoordsInBounds } from './_utils';

describe('potionBottle', () => {
  it('emits a <g> with body, neck and cork', () => {
    const out = potionBottle(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<ellipse\b/);
    expect((out.match(/<rect\b/g) ?? []).length).toBe(2);
  });
  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(potionBottle(ctx(seed)), 64)).not.toThrow();
    }
  });
  it('uses neutral palette for stroke and a non-none fill on the body', () => {
    const out = potionBottle(ctx('s'));
    expect(out).toContain('stroke="#111111"');
    const firstFill = /<\w+\b[^>]*\bfill="([^"]+)"/.exec(out);
    expect(firstFill?.[1]).toBeDefined();
    expect(firstFill?.[1]).not.toBe('none');
  });
  it('applies stroke-linejoin="round" or stroke-linecap="round" on stroked elements', () => {
    const out = potionBottle(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });
  it('is deterministic', () => {
    expect(potionBottle(ctx('z'))).toBe(potionBottle(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(potionBottle(ctx('a'))).not.toBe(potionBottle(ctx('b')));
  });
});
