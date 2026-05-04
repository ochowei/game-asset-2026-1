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

const fakeDecoration: PrimitiveFn = ({ centerX, centerY }) =>
  svgElement('circle', { cx: centerX, cy: centerY, r: 2, fill: 'none', stroke: '#000', 'stroke-width': 1 });

describe('subject composer', () => {
  it('emits a single <g> wrapper containing exactly one subject group', () => {
    const out = subject({
      rng: makeRng('abc'),
      palette,
      size: 64,
      primitives: [fakeSubject],
      decorations: [fakeDecoration],
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
        decorations: [fakeDecoration],
      });
      const subjectIdx = out.indexOf('data-role="subject"');
      const before = out.slice(0, subjectIdx);
      const decorationCount = (before.match(/<circle\b/g) ?? []).length;
      expect(decorationCount).toBeGreaterThanOrEqual(0);
      expect(decorationCount).toBeLessThanOrEqual(2);
    }
  });

  it('decoration count distribution is roughly 75/20/5 across 1000 seeds', () => {
    const counts = [0, 0, 0];
    for (let i = 0; i < 1000; i++) {
      const out = subject({
        rng: makeRng(`s${i}`),
        palette,
        size: 64,
        primitives: [fakeSubject],
        decorations: [fakeDecoration],
      });
      const subjectIdx = out.indexOf('data-role="subject"');
      const before = out.slice(0, subjectIdx);
      const c = (before.match(/<circle\b/g) ?? []).length;
      counts[c] = (counts[c] ?? 0) + 1;
    }
    expect(counts[0]! / 1000).toBeGreaterThan(0.68);
    expect(counts[0]! / 1000).toBeLessThan(0.82);
    expect(counts[1]! / 1000).toBeGreaterThan(0.14);
    expect(counts[1]! / 1000).toBeLessThan(0.26);
    expect(counts[2]! / 1000).toBeGreaterThan(0.02);
    expect(counts[2]! / 1000).toBeLessThan(0.10);
  });

  it('emits zero decorations when theme.decorations is empty', () => {
    for (let i = 0; i < 50; i++) {
      const out = subject({
        rng: makeRng(`empty-${i}`),
        palette,
        size: 64,
        primitives: [fakeSubject],
        decorations: [],
      });
      const subjectIdx = out.indexOf('data-role="subject"');
      const before = out.slice(0, subjectIdx);
      expect(before).not.toMatch(/<circle\b/);
    }
  });

  it('is deterministic for the same seed', () => {
    const args = { palette, size: 64, primitives: [fakeSubject], decorations: [fakeDecoration] };
    expect(subject({ ...args, rng: makeRng('z') })).toBe(subject({ ...args, rng: makeRng('z') }));
  });

  it('throws if primitives is empty', () => {
    expect(() =>
      subject({ rng: makeRng('s'), palette, size: 64, primitives: [], decorations: [fakeDecoration] }),
    ).toThrow();
  });
});
