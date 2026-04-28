import { intRange, range, pick } from '../seed';
import { svgElement } from '../svg-emitter';
import type { PrimitiveFn } from './types';

export const path: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const points = intRange(rng, 4, 8);
  const radius = range(rng, size * 0.2, size * 0.4);
  const segments: string[] = [];

  for (let i = 0; i < points; i++) {
    const t = (i / points) * Math.PI * 2;
    const r = radius * range(rng, 0.6, 1.0);
    const x = clamp(centerX + Math.cos(t) * r, 0, size);
    const y = clamp(centerY + Math.sin(t) * r, 0, size);
    segments.push(`${i === 0 ? 'M' : 'L'}${round(x)} ${round(y)}`);
  }
  segments.push('Z');

  const stroke = pick(rng, palette.neutral);
  const fill = pick(rng, [...palette.accent, ...palette.secondary, 'none']);
  return svgElement('path', {
    d: segments.join(' '),
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
