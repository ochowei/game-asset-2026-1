import { applyBaseVariation, type PrimitiveFn } from '@procforge/core';
import { potionBottleBases } from './potion-bottle.bases';

// Potion bottle is left-right symmetric — mirror allowed.
export const potionBottle: PrimitiveFn = ({ rng, palette, size }) => {
  return applyBaseVariation({
    rng,
    bases: potionBottleBases,
    palette,
    size,
    allowMirror: true,
  });
};
