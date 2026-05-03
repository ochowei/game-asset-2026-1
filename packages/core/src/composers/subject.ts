import { pick, range } from '../seed';
import { svgElement } from '../svg-emitter';
import { circle } from '../primitives/circle';
import { polygon } from '../primitives/polygon';
import { path } from '../primitives/path';
import { star } from '../primitives/star';
import type { PrimitiveFn } from '../primitives/types';
import type { ComposerFn } from './types';

const DECORATIONS: readonly PrimitiveFn[] = [circle, polygon, path, star];

export const subject: ComposerFn = ({ rng, palette, size, primitives }) => {
  if (primitives.length === 0) throw new Error('subject composer: primitives empty');
  const center = size / 2;
  const strokeWidth = Math.max(1, Math.round(size * 0.04));

  const r = rng();
  const decorationCount = r < 0.5 ? 0 : r < 0.9 ? 1 : 2;

  // Decorations render at half virtual size so their internal radii stay
  // visibly smaller than the centred subject (subject dominance, spec §3.2).
  // Stroke width is computed from the FULL canvas size so decorations remain
  // visible at small icon sizes.
  const decorationSize = size * 0.5;
  const decorationParts: string[] = [];
  for (let i = 0; i < decorationCount; i++) {
    const fn = pick(rng, DECORATIONS);
    const offsetMag = range(rng, size * 0.18, size * 0.32);
    const angle = range(rng, 0, Math.PI * 2);
    const cx = center + Math.cos(angle) * offsetMag;
    const cy = center + Math.sin(angle) * offsetMag;
    decorationParts.push(
      fn({ rng, palette, size: decorationSize, centerX: cx, centerY: cy, strokeWidth }),
    );
  }

  const subjectFn = pick(rng, primitives);
  const subjectFragment = subjectFn({
    rng,
    palette,
    size,
    centerX: center,
    centerY: center,
    strokeWidth,
  });

  return svgElement('g', {}, decorationParts.join('') + subjectFragment);
};
