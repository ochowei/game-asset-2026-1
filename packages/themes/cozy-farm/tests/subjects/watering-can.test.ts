import { describe, it, expect } from 'vitest';
import { wateringCan } from '../../src/subjects/watering-can';
import { ctx, assertCoordsInBounds } from './_utils';

describe('wateringCan', () => {
  it('emits a <g> with a body path, spout polygon and handle path', () => {
    const out = wateringCan(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect((out.match(/<path\b/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(out).toMatch(/<polygon\b/);
  });
  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(wateringCan(ctx(seed)), 64)).not.toThrow();
    }
  });
  it('uses neutral palette for stroke and a non-none fill on the body', () => {
    const out = wateringCan(ctx('s'));
    expect(out).toContain('stroke="#3d3027"');
    const firstFill = /<\w+\b[^>]*\bfill="([^"]+)"/.exec(out);
    expect(firstFill?.[1]).toBeDefined();
    expect(firstFill?.[1]).not.toBe('none');
  });
  it('applies stroke-linejoin or stroke-linecap "round"', () => {
    const out = wateringCan(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });
  it('is deterministic', () => {
    expect(wateringCan(ctx('z'))).toBe(wateringCan(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(wateringCan(ctx('a'))).not.toBe(wateringCan(ctx('b')));
  });
});
