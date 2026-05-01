import { describe, it, expect } from 'vitest';
import { axeHead } from '../../src/subjects/axe-head';
import { ctx, countCoordsInBounds } from './_utils';

describe('axeHead', () => {
  it('emits a <g> with a haft line and a blade polygon', () => {
    const out = axeHead(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<line\b/);
    expect(out).toMatch(/<polygon\b/);
  });
  it('keeps coordinates within bounds', () => {
    expect(countCoordsInBounds(axeHead(ctx('s')), -1, 65).bad).toBe(0);
  });
  it('is deterministic', () => {
    expect(axeHead(ctx('z'))).toBe(axeHead(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(axeHead(ctx('a'))).not.toBe(axeHead(ctx('b')));
  });
});
