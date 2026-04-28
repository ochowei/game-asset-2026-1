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
  id: 'cozy-farm',
  primary: ['#f4a261', '#e76f51', '#e9c46a'],
  secondary: ['#a3b18a', '#588157', '#3a5a40'],
  accent: ['#ffb4a2', '#e5989b', '#b5838d'],
  neutral: ['#3d3027', '#5e4b3c', '#fff8e7'],
});

export const cozyFarm: Theme = defineTheme({
  id: 'cozy-farm',
  displayName: 'Cozy Farm',
  palette,
  primitives: [circle, polygon, path, star],
  composers: [layer, mask],
  tags: ['food', 'seed', 'tool', 'animal', 'cozy', 'farm'],
});
