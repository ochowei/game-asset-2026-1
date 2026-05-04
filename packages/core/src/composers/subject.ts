import { pick, range } from '../seed';
import { svgElement } from '../svg-emitter';
import type { ComposerFn } from './types';

export const subject: ComposerFn = ({ rng, palette, size, primitives, decorations }) => {
  if (primitives.length === 0) throw new Error('subject composer: primitives empty');
  const center = size / 2;
  const strokeWidth = Math.max(1, Math.round(size * 0.04));

  const r = rng();
  // 75/20/5 distribution (0/1/2 decorations). Biasing toward 0 keeps procgen
  // variation while making clean subject the common case. v1.3.1 also moved
  // from generic core decorations (circle/polygon/path/star) to theme-authored
  // motifs supplied via `theme.decorations`, so the 25% with decoration now
  // carry theme-recognisable accents (fleur, dot-grid, leaf, rune) instead of
  // semantically blank shapes.
  const decorationCount = decorations.length === 0 ? 0 : r < 0.75 ? 0 : r < 0.95 ? 1 : 2;

  // Decorations render at half virtual size so their internal radii stay
  // visibly smaller than the centred subject (subject dominance, spec §3.2).
  // Stroke width is computed from the FULL canvas size so decorations remain
  // visible at small icon sizes.
  const decorationSize = size * 0.5;
  const decorationParts: string[] = [];
  for (let i = 0; i < decorationCount; i++) {
    const fn = pick(rng, decorations);
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
