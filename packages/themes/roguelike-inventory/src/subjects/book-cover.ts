import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const bookCover: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  // Lucide-aligned: slimmer + taller book proportion — `lucide:book`
  // register where the cover is portrait-oriented.
  const w = range(rng, size * 0.36, size * 0.42);
  const h = range(rng, size * 0.54, size * 0.60);
  const x = centerX - w / 2;
  const y = centerY - h / 2;
  const spineX = x + size * 0.05;
  const claspW = w * 0.08;
  const claspH = h * 0.18;

  const cover = svgElement('rect', {
    x: round2(x),
    y: round2(y),
    width: round2(w),
    height: round2(h),
    fill,
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.4),
    'stroke-linejoin': 'round',
  });
  // Spine line is the affordance hint that distinguishes the book from a plain
  // rectangle; boost stroke so it stays visible at small sizes.
  const spine = svgElement('line', {
    x1: round2(spineX),
    y1: round2(y),
    x2: round2(spineX),
    y2: round2(y + h),
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.0),
    'stroke-linecap': 'round',
  });
  const clasp = svgElement('rect', {
    x: round2(x + w - claspW * 0.3),
    y: round2(centerY - claspH / 2),
    width: round2(claspW),
    height: round2(claspH),
    fill: pickColor(rng, palette, 'secondary'),
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.7),
    'stroke-linejoin': 'round',
  });

  return svgElement('g', {}, cover + spine + clasp);
};
