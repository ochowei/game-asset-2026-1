import { describe, it, expect } from 'vitest';
import { makeRng } from '../src/seed';
import { definePalette, pickColor, type Palette } from '../src/palette';

const p: Palette = definePalette({
  id: 'test',
  primary: ['#aa0000', '#bb0000'],
  secondary: ['#0000aa'],
  accent: ['#00aa00'],
  neutral: ['#222222', '#dddddd'],
});

describe('definePalette', () => {
  it('returns the palette as-is and freezes arrays', () => {
    expect(p.id).toBe('test');
    expect(p.primary).toEqual(['#aa0000', '#bb0000']);
    expect(Object.isFrozen(p.primary)).toBe(true);
  });

  it('rejects empty role arrays', () => {
    expect(() =>
      definePalette({ id: 'bad', primary: [], secondary: ['#000'], accent: ['#000'], neutral: ['#000'] }),
    ).toThrow(/primary/);
  });

  it('rejects invalid hex colors', () => {
    expect(() =>
      definePalette({ id: 'bad', primary: ['red'], secondary: ['#000'], accent: ['#000'], neutral: ['#000'] }),
    ).toThrow(/hex/);
  });
});

describe('pickColor', () => {
  it('picks from the requested role', () => {
    const rng = makeRng('s');
    expect(p.primary).toContain(pickColor(rng, p, 'primary'));
    expect(pickColor(rng, p, 'secondary')).toBe('#0000aa');
  });
});
