import { describe, it, expect } from 'vitest';
import { generateOne, generateMany } from '@procforge/core';
import { roguelikeInventory } from '../src/index';

describe('roguelikeInventory theme', () => {
  it('exports a Theme with id "roguelike-inventory"', () => {
    expect(roguelikeInventory.id).toBe('roguelike-inventory');
  });
  it('produces 50 SVGs', () => {
    const items = generateMany({
      theme: roguelikeInventory,
      baseSeed: 'r',
      count: 50,
      size: 64,
    });
    expect(items).toHaveLength(50);
    expect(generateOne({ theme: roguelikeInventory, seed: 'x', size: 64 }).startsWith('<svg ')).toBe(
      true,
    );
  });
  it('declares roguelike tags', () => {
    expect(roguelikeInventory.tags).toContain('inventory');
  });
});
