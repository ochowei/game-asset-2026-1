import { applyBaseVariation, type PrimitiveFn } from '@procforge/core';
import { scrollRollBases } from './scroll-roll.bases';

// Scroll could be horizontally rolled or vertically rolled depending on base —
// mirror disabled to preserve roll direction intent.
export const scrollRoll: PrimitiveFn = ({ rng, palette, size }) => {
  return applyBaseVariation({
    rng,
    bases: scrollRollBases,
    palette,
    size,
    allowMirror: false,
  });
};
