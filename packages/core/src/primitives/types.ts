import type { RNG } from '../seed';
import type { Palette } from '../palette';

export interface PrimitiveContext {
  rng: RNG;
  palette: Palette;
  size: number;
  centerX: number;
  centerY: number;
  strokeWidth: number;
}

export type PrimitiveFn = (ctx: PrimitiveContext) => string;
