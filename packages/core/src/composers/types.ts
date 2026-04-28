import type { RNG } from '../seed';
import type { Palette } from '../palette';
import type { PrimitiveFn } from '../primitives/types';

export interface ComposerContext {
  rng: RNG;
  palette: Palette;
  size: number;
  primitives: readonly PrimitiveFn[];
}

export type ComposerFn = (ctx: ComposerContext) => string;
