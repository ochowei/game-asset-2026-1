import { describe, it, expect } from 'vitest';
import { ringBand } from '../../src/subjects/ring-band';
import { ctx, assertCoordsInBounds } from './_utils';

describe('ringBand', () => {
  it('emits a <g> with a band circle, a setting polygon and a stone circle', () => {
    const out = ringBand(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect((out.match(/<circle\b/g) ?? []).length).toBe(2);
    expect(out).toMatch(/<polygon\b/);
  });
  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(ringBand(ctx(seed)), 64)).not.toThrow();
    }
  });
  it('uses neutral palette for stroke and a non-none fill on the body', () => {
    const out = ringBand(ctx('s'));
    expect(out).toContain('stroke="#181a1f"');
    // ringBand's first child is the band <circle> with fill="none" — visually
    // rendered as a ring outline by stroke per spec §3.4 stroke-only carve-out.
    // The setting <polygon> and stone <circle> carry the non-none fills.
    const stoneFill = /<circle\b[^>]*\bfill="(?!none\b)([^"]+)"/.exec(out);
    expect(stoneFill?.[1]).toBeDefined();
    expect(stoneFill?.[1]).not.toBe('none');
  });
  it('applies stroke-linejoin or stroke-linecap "round"', () => {
    const out = ringBand(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });
  it('is deterministic', () => {
    expect(ringBand(ctx('z'))).toBe(ringBand(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(ringBand(ctx('a'))).not.toBe(ringBand(ctx('b')));
  });
});
