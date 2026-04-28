import { intRange, pick, range } from '../seed';
import { svgElement } from '../svg-emitter';
import type { ComposerFn } from './types';

export const layer: ComposerFn = ({ rng, palette, size, primitives }) => {
  const count = intRange(rng, 2, 4);
  const center = size / 2;
  const strokeWidth = Math.max(1, Math.round(size * 0.04));
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const fn = pick(rng, primitives);
    const offsetX = range(rng, -size * 0.1, size * 0.1);
    const offsetY = range(rng, -size * 0.1, size * 0.1);
    parts.push(
      fn({
        rng,
        palette,
        size,
        centerX: center + offsetX,
        centerY: center + offsetY,
        strokeWidth,
      }),
    );
  }
  return svgElement('g', {}, parts.join(''));
};
