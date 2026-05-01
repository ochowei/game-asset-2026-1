import { describe, it, expect } from 'vitest';
import { antennaArray } from '../../src/subjects/antenna-array';
import { ctx, assertCoordsInBounds } from './_utils';

describe('antennaArray', () => {
  it('emits a <g> with a vertical mast line plus >= 3 cross-bar lines', () => {
    const out = antennaArray(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect((out.match(/<line\b/g) ?? []).length).toBeGreaterThanOrEqual(4);
  });
  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(antennaArray(ctx(seed)), 64)).not.toThrow();
    }
  });
  it('uses neutral palette for stroke and emits no fill="none" placeholder', () => {
    const out = antennaArray(ctx('s'));
    expect(out).toContain('stroke="#111111"');
    // antennaArray is a stroke-only silhouette (mast + cross-bars are <line>
    // elements); no element carries a fill attribute, so the non-none-fill
    // contract from the other primitives doesn't apply. We instead assert
    // that no element accidentally renders an invisible fill="none" hole.
    expect(out).not.toContain('fill="none"');
  });
  it('applies stroke-linejoin or stroke-linecap "round"', () => {
    const out = antennaArray(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });
  it('is deterministic', () => {
    expect(antennaArray(ctx('z'))).toBe(antennaArray(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(antennaArray(ctx('a'))).not.toBe(antennaArray(ctx('b')));
  });
});
