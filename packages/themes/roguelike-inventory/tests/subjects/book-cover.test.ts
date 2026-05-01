import { describe, it, expect } from 'vitest';
import { bookCover } from '../../src/subjects/book-cover';
import { ctx, assertCoordsInBounds } from './_utils';

describe('bookCover', () => {
  it('emits a <g> with a cover rect, a spine line and a clasp rect', () => {
    const out = bookCover(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect((out.match(/<rect\b/g) ?? []).length).toBe(2);
    expect(out).toMatch(/<line\b/);
  });
  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(bookCover(ctx(seed)), 64)).not.toThrow();
    }
  });
  it('uses neutral palette for stroke and a non-none fill on the body', () => {
    const out = bookCover(ctx('s'));
    expect(out).toContain('stroke="#181a1f"');
    const firstFill = /<\w+\b[^>]*\bfill="([^"]+)"/.exec(out);
    expect(firstFill?.[1]).toBeDefined();
    expect(firstFill?.[1]).not.toBe('none');
  });
  it('applies stroke-linejoin or stroke-linecap "round"', () => {
    const out = bookCover(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });
  it('is deterministic', () => {
    expect(bookCover(ctx('z'))).toBe(bookCover(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(bookCover(ctx('a'))).not.toBe(bookCover(ctx('b')));
  });
});
