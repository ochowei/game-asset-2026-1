import { defineTheme, definePalette, subject, type Theme } from '@procforge/core';
import {
  blasterBody,
  chipBoard,
  energyOrb,
  hudFrame,
  cogGear,
  antennaArray,
} from './subjects';
import { dotGrid, bracketFrame, scanlineBars } from './decorations';

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
  primitives: [blasterBody, chipBoard, energyOrb, hudFrame, cogGear, antennaArray],
  decorations: [dotGrid, bracketFrame, scanlineBars],
  composers: [subject],
  tags: ['hud', 'gun', 'chip', 'energy', 'sci-fi', 'cyberpunk'],
});
