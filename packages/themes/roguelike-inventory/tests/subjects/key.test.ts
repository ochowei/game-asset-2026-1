import { describe, it, expect } from 'vitest';
import { key } from '../../src/subjects/key';
import { ctx, assertCoordsInBounds } from './_utils';

describe('key', () => {
  it('emits a <g> with bow circle, shaft line and >= 2 bit rects', () => {
    const out = key(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<circle\b/);
    expect(out).toMatch(/<line\b/);
    expect((out.match(/<rect\b/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });
  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(key(ctx(seed)), 64)).not.toThrow();
    }
  });
  it('uses neutral palette for stroke and a non-none fill on the body', () => {
    const out = key(ctx('s'));
    expect(out).toContain('stroke="#181a1f"');
    const firstFill = /<\w+\b[^>]*\bfill="([^"]+)"/.exec(out);
    expect(firstFill?.[1]).toBeDefined();
    expect(firstFill?.[1]).not.toBe('none');
  });
  it('applies stroke-linejoin or stroke-linecap "round"', () => {
    const out = key(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });
  it('is deterministic', () => {
    expect(key(ctx('z'))).toBe(key(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(key(ctx('a'))).not.toBe(key(ctx('b')));
  });
});
