import { applyBaseVariation, type PrimitiveFn } from '@procforge/core';
import { shieldFrameBases } from './shield-frame.bases';

// Shield is left-right symmetric — mirror is allowed.
export const shieldFrame: PrimitiveFn = ({ rng, palette, size }) => {
  return applyBaseVariation({
    rng,
    bases: shieldFrameBases,
    palette,
    size,
    allowMirror: true,
  });
};
