import { describe, it, expect } from 'vitest';
import { hudFrame } from '../../src/subjects/hud-frame';
import { ctx, assertCoordsInBounds } from './_utils';

describe('hudFrame', () => {
  it('emits a <g> with four corner-bracket paths and a centre dot circle', () => {
    const out = hudFrame(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect((out.match(/<path\b/g) ?? []).length).toBe(4);
    expect(out).toMatch(/<circle\b/);
  });
  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(hudFrame(ctx(seed)), 64)).not.toThrow();
    }
  });
  it('uses neutral palette for stroke and a non-none fill on the body', () => {
    const out = hudFrame(ctx('s'));
    expect(out).toContain('stroke="#111111"');
    // hudFrame's first four children are corner-bracket <path> elements with
    // fill="none". The centre dot <circle> carries the non-none fill.
    const dotFill = /<circle\b[^>]*\bfill="([^"]+)"/.exec(out);
    expect(dotFill?.[1]).toBeDefined();
    expect(dotFill?.[1]).not.toBe('none');
  });
  it('applies stroke-linejoin or stroke-linecap "round"', () => {
    const out = hudFrame(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });
  it('is deterministic', () => {
    expect(hudFrame(ctx('z'))).toBe(hudFrame(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(hudFrame(ctx('a'))).not.toBe(hudFrame(ctx('b')));
  });
});
