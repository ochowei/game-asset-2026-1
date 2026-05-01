import { describe, it, expect } from 'vitest';
import { hoeTool } from '../../src/subjects/hoe-tool';
import { ctx, assertCoordsInBounds } from './_utils';

describe('hoeTool', () => {
  it('emits a <g> with a handle line and a blade polygon', () => {
    const out = hoeTool(ctx('s'));
    expect(out.startsWith('<g')).toBe(true);
    expect(out).toMatch(/<line\b/);
    expect(out).toMatch(/<polygon\b/);
  });
  it('keeps geometry within [size*0.1, size*0.9]', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(() => assertCoordsInBounds(hoeTool(ctx(seed)), 64)).not.toThrow();
    }
  });
  it('uses neutral palette for stroke and a non-none fill on the body', () => {
    const out = hoeTool(ctx('s'));
    expect(out).toContain('stroke="#3d3027"');
    const firstFill = /<\w+\b[^>]*\bfill="([^"]+)"/.exec(out);
    expect(firstFill?.[1]).toBeDefined();
    expect(firstFill?.[1]).not.toBe('none');
  });
  it('applies stroke-linejoin or stroke-linecap "round"', () => {
    const out = hoeTool(ctx('s'));
    expect(/stroke-(linejoin|linecap)="round"/.test(out)).toBe(true);
  });
  it('is deterministic', () => {
    expect(hoeTool(ctx('z'))).toBe(hoeTool(ctx('z')));
  });
  it('different seeds differ', () => {
    expect(hoeTool(ctx('a'))).not.toBe(hoeTool(ctx('b')));
  });
});
