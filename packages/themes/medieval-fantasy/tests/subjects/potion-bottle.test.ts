import { describe, it, expect } from 'vitest';
import { potionBottle } from '../../src/subjects/potion-bottle';
import { ctx, countCoordsInBounds } from './_utils';

describe('potionBottle', () => {
  it('emits a <g> with body, neck and cork', () => {
    const out = potionBottle(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<ellipse\b/);
    expect((out.match(/<rect\b/g) ?? []).length).toBe(2);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(potionBottle(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(potionBottle(ctx('z'))).toBe(potionBottle(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(potionBottle(ctx('a'))).not.toBe(potionBottle(ctx('b')));
  });
});
