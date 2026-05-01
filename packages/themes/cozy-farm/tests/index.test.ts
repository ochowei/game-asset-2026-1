import { describe, it, expect } from 'vitest';
import { generateOne, generateMany } from '@procforge/core';
import { cozyFarm } from '../src/index';

describe('cozyFarm theme', () => {
  it('exports a Theme with id "cozy-farm"', () => {
    expect(cozyFarm.id).toBe('cozy-farm');
  });
  it('produces 50 unique SVGs via generateMany', () => {
    const items = generateMany({ theme: cozyFarm, baseSeed: 'cf', count: 50, size: 64 });
    expect(items).toHaveLength(50);
    const uniq = new Set(items.map((i) => i.svg));
    expect(uniq.size).toBeGreaterThan(40);
    expect(generateOne({ theme: cozyFarm, seed: 'x', size: 64 }).startsWith('<svg ')).toBe(true);
  });
  it('declares cozy tags', () => {
    expect(cozyFarm.tags).toContain('food');
  });
});
