import { defineTheme, definePalette, subject, type Theme } from '@procforge/core';
import {
  hoeTool,
  fruit,
  seedPouch,
  animalHead,
  wateringCan,
  wheatStalk,
} from './subjects';
import { leafSprig, seedCluster, flowerMini } from './decorations';

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
  primitives: [hoeTool, fruit, seedPouch, animalHead, wateringCan, wheatStalk],
  decorations: [leafSprig, seedCluster, flowerMini],
  composers: [subject],
  tags: ['food', 'seed', 'tool', 'animal', 'cozy', 'farm'],
});
