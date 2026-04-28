import { range, pick } from '../seed';
import { svgElement } from '../svg-emitter';
import type { PrimitiveFn } from './types';

export const circle: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const r = range(rng, size * 0.15, size * 0.4);
  const stroke = pick(rng, palette.neutral);
  const fill = pick(rng, [...palette.primary, ...palette.secondary, ...palette.accent, 'none']);
  return svgElement('circle', {
    cx: round(centerX),
    cy: round(centerY),
    r: round(r),
    fill,
    stroke,
    'stroke-width': strokeWidth,
  });
};

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
