import { describe, it, expect } from 'vitest';
import { svgElement, svgDocument } from '../src/svg-emitter';

describe('svgElement', () => {
  it('emits self-closing tag with attributes', () => {
    expect(svgElement('circle', { cx: 10, cy: 10, r: 5, fill: '#ff0000' })).toBe(
      '<circle cx="10" cy="10" r="5" fill="#ff0000"/>',
    );
  });

  it('emits with children when provided', () => {
    expect(svgElement('g', { id: 'a' }, '<circle r="1"/>')).toBe('<g id="a"><circle r="1"/></g>');
  });

  it('escapes attribute values containing double-quote', () => {
    expect(svgElement('text', { 'data-x': 'a"b' }, 'hi')).toBe('<text data-x="a&quot;b">hi</text>');
  });

  it('skips undefined attribute values', () => {
    expect(svgElement('rect', { x: 0, y: undefined, width: 10 })).toBe('<rect x="0" width="10"/>');
  });
});

describe('svgDocument', () => {
  it('wraps body in <svg> with viewBox and namespace', () => {
    const doc = svgDocument({ size: 64, viewBox: '0 0 64 64', body: '<circle r="10"/>' });
    expect(doc).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle r="10"/></svg>',
    );
  });

  it('defaults viewBox to "0 0 size size"', () => {
    expect(svgDocument({ size: 32, body: '' })).toContain('viewBox="0 0 32 32"');
  });
});
