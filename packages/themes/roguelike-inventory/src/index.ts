import { defineTheme, definePalette, subject, type Theme } from '@procforge/core';
import { coin, gem, key, bookCover, ringBand, dagger } from './subjects';

const palette = definePalette({
  id: 'roguelike-inventory',
  primary: ['#7d4f50', '#a87c5a', '#d4a373'],
  secondary: ['#3a4f41', '#557c63', '#8aab8e'],
  accent: ['#c9a961', '#f2d49b', '#f7b801'],
  neutral: ['#181a1f', '#2c2f37', '#e6e6e6'],
});

export const roguelikeInventory: Theme = defineTheme({
  id: 'roguelike-inventory',
  displayName: 'Roguelike Inventory',
  palette,
  primitives: [coin, gem, key, bookCover, ringBand, dagger],
  composers: [subject],
  tags: ['inventory', 'item', 'potion', 'rune', 'roguelike', 'rpg'],
});
