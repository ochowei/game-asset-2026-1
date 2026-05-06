import { applyBaseVariation, type PrimitiveFn } from '@procforge/core';
import { axeHeadBases } from './axe-head.bases';

// Axe is intentionally asymmetric (blade direction matters) — mirror disabled.
export const axeHead: PrimitiveFn = ({ rng, palette, size }) => {
  return applyBaseVariation({
    rng,
    bases: axeHeadBases,
    palette,
    size,
    allowMirror: false,
  });
};
