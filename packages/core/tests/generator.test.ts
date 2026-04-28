import { describe, it, expect } from 'vitest';
import { definePalette } from '../src/palette';
import { circle, polygon } from '../src/primitives';
import { layer } from '../src/composers';
import { defineTheme } from '../src/theme';
import { generateOne, generateMany } from '../src/generator';

const t = defineTheme({
  id: 'demo',
  displayName: 'Demo',
  palette: definePalette({
    id: 'p',
    primary: ['#ff0000'],
    secondary: ['#00ff00'],
    accent: ['#0000ff'],
    neutral: ['#222222'],
  }),
  primitives: [circle, polygon],
  composers: [layer],
  tags: [],
});

describe('generateOne', () => {
  it('returns a complete SVG document', () => {
    const svg = generateOne({ theme: t, seed: 'a', size: 64 });
    expect(svg.startsWith('<svg ')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
    expect(svg).toContain('viewBox="0 0 64 64"');
  });

  it('is deterministic', () => {
    expect(generateOne({ theme: t, seed: 'a', size: 64 })).toBe(
      generateOne({ theme: t, seed: 'a', size: 64 }),
    );
  });

  it('different seeds yield different SVGs', () => {
    expect(generateOne({ theme: t, seed: 'a', size: 64 })).not.toBe(
      generateOne({ theme: t, seed: 'b', size: 64 }),
    );
  });
});

describe('generateMany', () => {
  it('returns the requested number of SVGs', () => {
    const items = generateMany({ theme: t, baseSeed: 'batch', count: 5, size: 64 });
    expect(items).toHaveLength(5);
    for (const it of items) {
      expect(it.svg.startsWith('<svg ')).toBe(true);
      expect(typeof it.seed).toBe('string');
    }
  });

  it('seeds are unique within a batch', () => {
    const items = generateMany({ theme: t, baseSeed: 'batch', count: 10, size: 64 });
    const seeds = new Set(items.map((i) => i.seed));
    expect(seeds.size).toBe(10);
  });
});
