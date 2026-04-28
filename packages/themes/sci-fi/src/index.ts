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
  id: 'sci-fi',
  primary: ['#0fa3b1', '#1d6e7a', '#0a4854'],
  secondary: ['#ff3864', '#c91341', '#7a0a25'],
  accent: ['#fcf6bd', '#f4d35e', '#e8c547'],
  neutral: ['#0b1623', '#1e2d3f', '#cfd8e3'],
});

export const sciFi: Theme = defineTheme({
  id: 'sci-fi',
  displayName: 'Sci-Fi / Cyberpunk',
  palette,
  primitives: [circle, polygon, path, star],
  composers: [layer, mask],
  tags: ['hud', 'gun', 'chip', 'energy', 'sci-fi', 'cyberpunk'],
});
