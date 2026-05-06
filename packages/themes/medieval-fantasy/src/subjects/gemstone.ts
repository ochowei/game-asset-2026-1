import { applyBaseVariation, type PrimitiveFn } from '@procforge/core';
import { gemstoneBases } from './gemstone.bases';

// Gemstone is left-right symmetric (or close) — mirror allowed.
export const gemstone: PrimitiveFn = ({ rng, palette, size }) => {
  return applyBaseVariation({
    rng,
    bases: gemstoneBases,
    palette,
    size,
    allowMirror: true,
  });
};
