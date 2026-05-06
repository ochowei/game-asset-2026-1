import { applyBaseVariation, type PrimitiveFn } from '@procforge/core';
import { swordBladeBases } from './sword-blade.bases';

// Sword silhouette is asymmetric (handle vs blade), so mirror is disabled.
export const swordBlade: PrimitiveFn = ({ rng, palette, size }) => {
  return applyBaseVariation({
    rng,
    bases: swordBladeBases,
    palette,
    size,
    allowMirror: false,
  });
};
