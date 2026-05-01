import { describe, it, expect } from 'vitest';
import { dagger } from '../../src/subjects/dagger';
import { ctx, assertCoordsInBounds } from './_utils';

describe('dagger', () => {
  it('emits a <g> with a blade polygon, crossguard rect and pommel circle', () => {
    const out = dagger(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<polygon\b/);
    expect(out).toMatch(/<rect\b/);
    expect(out).toMatch(/<circle\b/);
  });
  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(dagger(ctx(seed)), 64)).not.toThrow();
    }
  });
  it('uses neutral palette for stroke and a non-none fill on the body', () => {
    const out = dagger(ctx('s'));
    expect(out).toContain('stroke="#181a1f"');
    const firstFill = /<\w+\b[^>]*\bfill="([^"]+)"/.exec(out);
    expect(firstFill?.[1]).toBeDefined();
    expect(firstFill?.[1]).not.toBe('none');
  });
  it('applies stroke-linejoin or stroke-linecap "round"', () => {
    const out = dagger(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });
  it('is deterministic', () => {
    expect(dagger(ctx('z'))).toBe(dagger(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(dagger(ctx('a'))).not.toBe(dagger(ctx('b')));
  });
});
