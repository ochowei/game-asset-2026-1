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
  const decorationCount = r < 0.25 ? 0 : r < 0.75 ? 1 : 2;

  const decorationParts: string[] = [];
  for (let i = 0; i < decorationCount; i++) {
    const fn = pick(rng, DECORATIONS);
    const offsetMag = range(rng, size * 0.15, size * 0.35);
    const angle = range(rng, 0, Math.PI * 2);
    const cx = center + Math.cos(angle) * offsetMag;
    const cy = center + Math.sin(angle) * offsetMag;
    decorationParts.push(
      fn({ rng, palette, size, centerX: cx, centerY: cy, strokeWidth }),
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
