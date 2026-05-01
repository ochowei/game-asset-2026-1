import { describe, it, expect } from 'vitest';
import { gemstone } from '../../src/subjects/gemstone';
import { ctx, countCoordsInBounds } from './_utils';

describe('gemstone', () => {
  it('emits a <g> with a polygon and at least one facet line', () => {
    const out = gemstone(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<polygon\b/);
    expect((out.match(/<line\b/g) ?? []).length).toBeGreaterThanOrEqual(1);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(gemstone(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(gemstone(ctx('z'))).toBe(gemstone(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(gemstone(ctx('a'))).not.toBe(gemstone(ctx('b')));
  });
});
