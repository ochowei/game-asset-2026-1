import { intRange, range, pick } from '../seed';
import { svgElement } from '../svg-emitter';
import type { PrimitiveFn } from './types';

export const star: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const points = intRange(rng, 4, 8);
  const outer = range(rng, size * 0.25, size * 0.42);
  const inner = outer * range(rng, 0.4, 0.6);
  const rotation = -Math.PI / 2;

  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const theta = rotation + (i / (points * 2)) * Math.PI * 2;
    const x = clamp(centerX + Math.cos(theta) * r, 0, size);
    const y = clamp(centerY + Math.sin(theta) * r, 0, size);
    pts.push(`${round(x)},${round(y)}`);
  }

  const stroke = pick(rng, palette.neutral);
  const fill = pick(rng, palette.accent);
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
