import { defineTheme, definePalette, subject, type Theme } from '@procforge/core';
import {
  swordBlade,
  shieldFrame,
  potionBottle,
  scrollRoll,
  axeHead,
  gemstone,
} from './subjects';
import { fleurMark, beadRing, cornerL } from './decorations';

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
  primitives: [swordBlade, shieldFrame, potionBottle, scrollRoll, axeHead, gemstone],
  decorations: [fleurMark, beadRing, cornerL],
  composers: [subject],
  tags: ['weapon', 'potion', 'shield', 'scroll', 'rpg', 'fantasy'],
});
