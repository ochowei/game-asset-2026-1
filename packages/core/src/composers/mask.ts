import { pick, intRange } from '../seed';
import { svgElement } from '../svg-emitter';
import type { ComposerFn } from './types';

export const mask: ComposerFn = ({ rng, palette, size, primitives }) => {
  const id = `m${Math.floor(rng() * 1_000_000).toString(36)}`;
  const center = size / 2;
  const strokeWidth = Math.max(1, Math.round(size * 0.04));

  const maskShape = pick(rng, primitives)({
    rng,
    palette,
    size,
    centerX: center,
    centerY: center,
    strokeWidth,
  })
    .replace(/fill="[^"]*"/, 'fill="white"')
    .replace(/stroke="[^"]*"/, 'stroke="white"');

  const bodyCount = intRange(rng, 2, 3);
  const bodyParts: string[] = [];
  for (let i = 0; i < bodyCount; i++) {
    bodyParts.push(
      pick(rng, primitives)({
        rng,
        palette,
        size,
        centerX: center,
        centerY: center,
        strokeWidth,
      }),
    );
  }
  const body = svgElement('g', { mask: `url(#${id})` }, bodyParts.join(''));

  const defs = svgElement('defs', {}, svgElement('mask', { id }, maskShape));
  return defs + body;
};
