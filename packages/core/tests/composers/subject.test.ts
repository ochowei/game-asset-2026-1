import { describe, it, expect } from 'vitest';
import { makeRng } from '../../src/seed';
import { definePalette } from '../../src/palette';
import { svgElement } from '../../src/svg-emitter';
import type { PrimitiveFn } from '../../src/primitives/types';
import { subject } from '../../src/composers/subject';

const palette = definePalette({
  id: 'p',
  primary: ['#ff0000'],
  secondary: ['#00ff00'],
  accent: ['#0000ff'],
  neutral: ['#222222'],
});

const fakeSubject: PrimitiveFn = ({ centerX, centerY }) =>
  svgElement('g', { 'data-role': 'subject' }, svgElement('rect', { x: centerX, y: centerY, width: 1, height: 1 }));

describe('subject composer', () => {
  it('emits a single <g> wrapper containing exactly one subject group', () => {
    const out = subject({
      rng: makeRng('abc'),
      palette,
      size: 64,
      primitives: [fakeSubject],
    });
    expect(out.startsWith('<g')).toBe(true);
    expect(out.endsWith('</g>')).toBe(true);
    const subjectMarkers = (out.match(/data-role="subject"/g) ?? []).length;
    expect(subjectMarkers).toBe(1);
  });

  it('produces 0–2 decoration elements before the subject group', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e']) {
      const out = subject({
        rng: makeRng(seed),
        palette,
        size: 64,
        primitives: [fakeSubject],
      });
      const subjectIdx = out.indexOf('data-role="subject"');
      const before = out.slice(0, subjectIdx);
      const decorationCount = (before.match(/<(circle|polygon|path)\b/g) ?? []).length;
      expect(decorationCount).toBeGreaterThanOrEqual(0);
      expect(decorationCount).toBeLessThanOrEqual(2);
    }
  });

  it('decoration count distribution is roughly 50/40/10 across 1000 seeds', () => {
    const counts = [0, 0, 0];
    for (let i = 0; i < 1000; i++) {
      const out = subject({
        rng: makeRng(`s${i}`),
        palette,
        size: 64,
        primitives: [fakeSubject],
      });
      const subjectIdx = out.indexOf('data-role="subject"');
      const before = out.slice(0, subjectIdx);
      const c = (before.match(/<(circle|polygon|path)\b/g) ?? []).length;
      counts[c] = (counts[c] ?? 0) + 1;
    }
    expect(counts[0]! / 1000).toBeGreaterThan(0.4);
    expect(counts[0]! / 1000).toBeLessThan(0.6);
    expect(counts[1]! / 1000).toBeGreaterThan(0.3);
    expect(counts[1]! / 1000).toBeLessThan(0.5);
    expect(counts[2]! / 1000).toBeGreaterThan(0.05);
    expect(counts[2]! / 1000).toBeLessThan(0.2);
  });

  it('is deterministic for the same seed', () => {
    const args = { palette, size: 64, primitives: [fakeSubject] };
    expect(subject({ ...args, rng: makeRng('z') })).toBe(subject({ ...args, rng: makeRng('z') }));
  });

  it('throws if primitives is empty', () => {
    expect(() =>
      subject({ rng: makeRng('s'), palette, size: 64, primitives: [] }),
    ).toThrow();
  });

  it('scales decorations smaller than the subject (decorations within size*0.6 bbox around their centre)', () => {
    // Render with a real primitive (circle) as the subject, sample many seeds, and
    // confirm decoration <circle> radii are bounded.
    for (let i = 0; i < 200; i++) {
      const out = subject({
        rng: makeRng(`s${i}`),
        palette,
        size: 64,
        primitives: [fakeSubject],
      });
      // The fake subject doesn't emit <circle>, so any <circle> in the output is a decoration.
      // Decorations should now produce r values bounded by `decorationSize * 0.4` ≈ 12.8.
      for (const m of out.matchAll(/<circle\b[^>]*\br="([^"]+)"/g)) {
        const r = parseFloat(m[1]!);
        expect(r).toBeLessThan(13); // 64 * 0.5 * 0.4 = 12.8, with small float tolerance
      }
    }
  });
});
