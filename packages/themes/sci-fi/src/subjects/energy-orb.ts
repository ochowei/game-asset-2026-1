import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

// Energy orb identity: concentric circles with 8 radiating rays at fixed
// angles (sun-like). Ray count is fixed (was variable 4-8) so the orb
// always reads as "energy radiating outward" rather than collapsing into
// a plain double-circle that could be mistaken for a coin.
const RAYS = 8;

export const energyOrb: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  // Lucide-aligned: smaller compact orb with longer pronounced rays —
  // matches `lucide:sun` register (small center, 8 visible rays).
  const outerR = range(rng, size * 0.20, size * 0.24);
  const innerR = outerR * range(rng, 0.45, 0.55);
  const rays = RAYS;
  const rayInner = outerR * 1.10;
  const rayOuter = outerR * range(rng, 1.40, 1.55);

  const ringOuter = svgElement('circle', {
    cx: round2(centerX),
    cy: round2(centerY),
    r: round2(outerR),
    fill,
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.4),
  });
  const ringInner = svgElement('circle', {
    cx: round2(centerX),
    cy: round2(centerY),
    r: round2(innerR),
    fill: pickColor(rng, palette, 'secondary'),
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.7),
  });
  const rayLines: string[] = [];
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2;
    rayLines.push(
      svgElement('line', {
        x1: round2(centerX + Math.cos(a) * rayInner),
        y1: round2(centerY + Math.sin(a) * rayInner),
        x2: round2(centerX + Math.cos(a) * rayOuter),
        y2: round2(centerY + Math.sin(a) * rayOuter),
        stroke,
        'stroke-width': Math.max(1, strokeWidth * 0.7),
        'stroke-linecap': 'round',
      }),
    );
  }
  return svgElement('g', {}, ringOuter + ringInner + rayLines.join(''));
};
