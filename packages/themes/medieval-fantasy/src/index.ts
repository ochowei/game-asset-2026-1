import {
  defineTheme,
  definePalette,
  circle,
  polygon,
  path,
  star,
  layer,
  mask,
  type Theme,
} from '@procforge/core';

const palette = definePalette({
  id: 'medieval-fantasy',
  primary: ['#8b3a1f', '#a85432', '#c97f3e', '#5a4632'],
  secondary: ['#3a5a4a', '#6b8e6b', '#2d4a3a'],
  accent: ['#d4a73a', '#f0c75a', '#b8851f'],
  neutral: ['#1f1a14', '#3a322a', '#d8cfc0'],
});

export const medievalFantasy: Theme = defineTheme({
  id: 'medieval-fantasy',
  displayName: 'Medieval Fantasy',
  palette,
  primitives: [circle, polygon, path, star],
  composers: [layer, mask],
  tags: ['weapon', 'potion', 'shield', 'scroll', 'rpg', 'fantasy'],
});
