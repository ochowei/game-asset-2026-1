import { pick, range, type RNG } from '../seed';
import { pickColor, type Palette, type ColorRole } from '../palette';
import { round2 } from '../numeric';
import { svgElement } from '../svg-emitter';

export interface ApplyBaseVariationOptions {
  rng: RNG;
  bases: readonly string[];
  palette: Palette;
  size: number;
  allowMirror: boolean;
}

const ROLES: readonly ColorRole[] = ['primary', 'secondary', 'accent', 'neutral'];
const BASE_VIEW = 64;

export function applyBaseVariation(opts: ApplyBaseVariationOptions): string {
  if (opts.bases.length === 0) throw new Error('applyBaseVariation: bases empty');

  // Step 1: pick base
  const base = pick(opts.rng, opts.bases);

  // Steps 2-5: pick palette color per role (always 4 draws regardless of usage)
  let body = base;
  for (const role of ROLES) {
    const hex = pickColor(opts.rng, opts.palette, role);
    body = body.split(`{{${role}}}`).join(hex);
  }

  // Step 6: rotation
  const rotateDeg = range(opts.rng, -8, 8);
  // Step 7: uniform scale
  const scaleVar = range(opts.rng, 0.95, 1.05);
  // Step 8: conditional mirror
  const mirror = opts.allowMirror ? opts.rng() < 0.5 : false;

  const canvasScale = opts.size / BASE_VIEW;
  const sx = (mirror ? -1 : 1) * scaleVar * canvasScale;
  const sy = scaleVar * canvasScale;

  const tx = round2(opts.size / 2);
  const ty = round2(opts.size / 2);
  const transform =
    `translate(${tx} ${ty}) ` +
    `scale(${round2(sx)},${round2(sy)}) ` +
    `rotate(${round2(rotateDeg)}) ` +
    `translate(-${round2(BASE_VIEW / 2)} -${round2(BASE_VIEW / 2)})`;

  return svgElement('g', { transform }, body);
}
