import { describe, it, expect } from 'vitest';
import { swordBlade } from '../../src/subjects/sword-blade';
import { ctx, countCoordsInBounds } from './_utils';

describe('swordBlade', () => {
  it('emits a <g> wrapper', () => {
    const out = swordBlade(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out.endsWith('</g>')).toBe(true);
  });

  it('contains a blade polygon, a crossguard rect, a grip line and a pommel circle', () => {
    const out = swordBlade(ctx('s'));
    expect(out).toMatch(/<polygon\b/);
    expect(out).toMatch(/<rect\b/);
    expect(out).toMatch(/<line\b/);
    expect(out).toMatch(/<circle\b/);
  });

  it('keeps coordinates within [-1, size+1]', () => {
    const out = swordBlade(ctx('s'));
    const { bad } = countCoordsInBounds(out, -1, 65);
    expect(bad).toBe(0);
  });

  it('is deterministic for the same seed', () => {
    expect(swordBlade(ctx('z'))).toBe(swordBlade(ctx('z')));
  });

  it('produces different output for different seeds', () => {
    expect(swordBlade(ctx('a'))).not.toBe(swordBlade(ctx('b')));
  });
});
