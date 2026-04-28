import { intRange, range, pick } from '../seed';
import { svgElement } from '../svg-emitter';
import type { PrimitiveFn } from './types';

export const polygon: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const sides = intRange(rng, 3, 8);
  const radius = range(rng, size * 0.18, size * 0.42);
  const rotation = rng() * Math.PI * 2;

  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const theta = rotation + (i / sides) * Math.PI * 2;
    const x = clamp(centerX + Math.cos(theta) * radius, 0, size);
    const y = clamp(centerY + Math.sin(theta) * radius, 0, size);
    pts.push(`${round(x)},${round(y)}`);
  }

  const stroke = pick(rng, palette.neutral);
  const fill = pick(rng, [...palette.primary, ...palette.secondary, 'none']);
  return svgElement('polygon', {
    points: pts.join(' '),
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
};

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
