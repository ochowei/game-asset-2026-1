import { describe, it, expect } from 'vitest';
import { generateOne, generateMany } from '@procforge/core';
import { medievalFantasy } from '../src/index';

describe('medievalFantasy theme', () => {
  it('exports a Theme with id "medieval-fantasy"', () => {
    expect(medievalFantasy.id).toBe('medieval-fantasy');
    expect(medievalFantasy.displayName).toMatch(/medieval/i);
  });

  it('declares non-empty primitives, composers, palette', () => {
    expect(medievalFantasy.primitives.length).toBeGreaterThan(0);
    expect(medievalFantasy.composers.length).toBeGreaterThan(0);
    expect(medievalFantasy.palette.primary.length).toBeGreaterThan(0);
  });

  it('produces a valid SVG document via generateOne', () => {
    const svg = generateOne({ theme: medievalFantasy, seed: 'sword-1', size: 64 });
    expect(svg.startsWith('<svg ')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
  });

  it('produces 50 unique SVGs via generateMany', () => {
    const items = generateMany({ theme: medievalFantasy, baseSeed: 'm', count: 50, size: 64 });
    expect(items).toHaveLength(50);
    const uniq = new Set(items.map((i) => i.svg));
    expect(uniq.size).toBeGreaterThan(40);
  });

  it('declares game-relevant tags', () => {
    expect(medievalFantasy.tags).toContain('weapon');
  });
});
