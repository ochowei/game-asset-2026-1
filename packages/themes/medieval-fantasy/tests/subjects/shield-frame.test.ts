import { describe, it, expect } from 'vitest';
import { shieldFrame } from '../../src/subjects/shield-frame';
import { ctx, countCoordsInBounds } from './_utils';

describe('shieldFrame', () => {
  it('emits a <g> wrapper containing two paths', () => {
    const out = shieldFrame(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out.endsWith('</g>')).toBe(true);
    expect((out.match(/<path\b/g) ?? []).length).toBe(2);
  });
  it('keeps coordinates within bounds', () => {
    const { bad } = countCoordsInBounds(shieldFrame(ctx('s')), -1, 65);
    expect(bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(shieldFrame(ctx('z'))).toBe(shieldFrame(ctx('z')));
  });
  it('different seeds yield different output', () => {
    expect(shieldFrame(ctx('a'))).not.toBe(shieldFrame(ctx('b')));
  });
});
