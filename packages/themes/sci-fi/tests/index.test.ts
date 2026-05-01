import { describe, it, expect } from 'vitest';
import { generateOne, generateMany } from '@procforge/core';
import { sciFi } from '../src/index';

describe('sciFi theme', () => {
  it('exports a Theme with id "sci-fi"', () => {
    expect(sciFi.id).toBe('sci-fi');
    expect(sciFi.displayName).toMatch(/sci/i);
  });

  it('produces 50 unique SVGs via generateMany', () => {
    const items = generateMany({ theme: sciFi, baseSeed: 'sf', count: 50, size: 64 });
    expect(items).toHaveLength(50);
    const uniq = new Set(items.map((i) => i.svg));
    expect(uniq.size).toBeGreaterThan(40);
    expect(generateOne({ theme: sciFi, seed: 'x', size: 64 }).startsWith('<svg ')).toBe(true);
  });

  it('declares sci-fi tags', () => {
    expect(sciFi.tags).toContain('hud');
  });
});
