import { describe, it, expect } from 'vitest';
import { scrollRoll } from '../../src/subjects/scroll-roll';
import { ctx, countCoordsInBounds } from './_utils';

describe('scrollRoll', () => {
  it('emits a <g> with two ellipses (rolled ends) and a body rect', () => {
    const out = scrollRoll(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect((out.match(/<ellipse\b/g) ?? []).length).toBe(2);
    expect(out).toMatch(/<rect\b/);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(scrollRoll(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(scrollRoll(ctx('z'))).toBe(scrollRoll(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(scrollRoll(ctx('a'))).not.toBe(scrollRoll(ctx('b')));
  });
});
