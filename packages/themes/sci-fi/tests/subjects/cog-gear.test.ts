import { describe, it, expect } from 'vitest';
import { cogGear } from '../../src/subjects/cog-gear';
import { ctx, assertCoordsInBounds } from './_utils';

describe('cogGear', () => {
  it('emits a <g> with a teeth polygon and a centre hole circle', () => {
    const out = cogGear(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<polygon\b/);
    expect(out).toMatch(/<circle\b/);
  });
  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(cogGear(ctx(seed)), 64)).not.toThrow();
    }
  });
  it('uses neutral palette for stroke and a non-none fill on the body', () => {
    const out = cogGear(ctx('s'));
    expect(out).toContain('stroke="#111111"');
    const firstFill = /<\w+\b[^>]*\bfill="([^"]+)"/.exec(out);
    expect(firstFill?.[1]).toBeDefined();
    expect(firstFill?.[1]).not.toBe('none');
  });
  it('applies stroke-linejoin or stroke-linecap "round"', () => {
    const out = cogGear(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });
  it('is deterministic', () => {
    expect(cogGear(ctx('z'))).toBe(cogGear(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(cogGear(ctx('a'))).not.toBe(cogGear(ctx('b')));
  });
});
