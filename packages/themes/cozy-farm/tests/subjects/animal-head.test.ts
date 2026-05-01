import { describe, it, expect } from 'vitest';
import { animalHead } from '../../src/subjects/animal-head';
import { ctx, assertCoordsInBounds } from './_utils';

describe('animalHead', () => {
  it('emits a <g> with a face circle, two ear polygons and >= 2 dot circles', () => {
    const out = animalHead(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect((out.match(/<circle\b/g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect((out.match(/<polygon\b/g) ?? []).length).toBe(2);
  });
  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(animalHead(ctx(seed)), 64)).not.toThrow();
    }
  });
  it('uses neutral palette for stroke and a non-none fill on the body', () => {
    const out = animalHead(ctx('s'));
    expect(out).toContain('stroke="#3d3027"');
    const firstFill = /<\w+\b[^>]*\bfill="([^"]+)"/.exec(out);
    expect(firstFill?.[1]).toBeDefined();
    expect(firstFill?.[1]).not.toBe('none');
  });
  it('applies stroke-linejoin or stroke-linecap "round"', () => {
    const out = animalHead(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });
  it('is deterministic', () => {
    expect(animalHead(ctx('z'))).toBe(animalHead(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(animalHead(ctx('a'))).not.toBe(animalHead(ctx('b')));
  });
});
