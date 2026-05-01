import { describe, it, expect } from 'vitest';
import { chipBoard } from '../../src/subjects/chip-board';
import { ctx, assertCoordsInBounds } from './_utils';

describe('chipBoard', () => {
  it('emits a <g> with a square rect, >= 8 pin lines and a centre dot', () => {
    const out = chipBoard(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<rect\b/);
    expect((out.match(/<line\b/g) ?? []).length).toBeGreaterThanOrEqual(8);
    expect(out).toMatch(/<circle\b/);
  });
  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(chipBoard(ctx(seed)), 64)).not.toThrow();
    }
  });
  it('uses neutral palette for stroke and a non-none fill on the body', () => {
    const out = chipBoard(ctx('s'));
    expect(out).toContain('stroke="#111111"');
    const firstFill = /<\w+\b[^>]*\bfill="([^"]+)"/.exec(out);
    expect(firstFill?.[1]).toBeDefined();
    expect(firstFill?.[1]).not.toBe('none');
  });
  it('applies stroke-linejoin or stroke-linecap "round"', () => {
    const out = chipBoard(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });
  it('is deterministic', () => {
    expect(chipBoard(ctx('z'))).toBe(chipBoard(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(chipBoard(ctx('a'))).not.toBe(chipBoard(ctx('b')));
  });
});
