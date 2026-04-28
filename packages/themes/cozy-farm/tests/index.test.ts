import { describe, it, expect } from 'vitest';
import { generateOne, generateMany } from '@procforge/core';
import { cozyFarm } from '../src/index';

describe('cozyFarm theme', () => {
  it('exports a Theme with id "cozy-farm"', () => {
    expect(cozyFarm.id).toBe('cozy-farm');
  });
  it('produces 50 SVGs', () => {
    const items = generateMany({ theme: cozyFarm, baseSeed: 'c', count: 50, size: 64 });
    expect(items).toHaveLength(50);
    expect(generateOne({ theme: cozyFarm, seed: 'x', size: 64 }).startsWith('<svg ')).toBe(true);
  });
  it('declares cozy tags', () => {
    expect(cozyFarm.tags).toContain('food');
  });
});
