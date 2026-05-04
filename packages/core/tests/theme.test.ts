import { describe, it, expect } from 'vitest';
import { definePalette } from '../src/palette';
import { circle } from '../src/primitives';
import { layer } from '../src/composers';
import { defineTheme, ThemeRegistry } from '../src/theme';

const palette = definePalette({
  id: 'p',
  primary: ['#ff0000'],
  secondary: ['#00ff00'],
  accent: ['#0000ff'],
  neutral: ['#222222'],
});

const t = defineTheme({
  id: 'demo',
  displayName: 'Demo',
  palette,
  primitives: [circle],
  decorations: [circle],
  composers: [layer],
  tags: ['demo'],
});

describe('defineTheme', () => {
  it('returns a frozen theme with the given id', () => {
    expect(t.id).toBe('demo');
    expect(t.displayName).toBe('Demo');
    expect(Object.isFrozen(t)).toBe(true);
  });

  it('rejects empty primitives', () => {
    expect(() =>
      defineTheme({
        id: 'bad',
        displayName: 'Bad',
        palette,
        primitives: [],
        decorations: [circle],
        composers: [layer],
        tags: [],
      }),
    ).toThrow(/primitive/);
  });

  it('rejects empty decorations', () => {
    expect(() =>
      defineTheme({
        id: 'bad',
        displayName: 'Bad',
        palette,
        primitives: [circle],
        decorations: [],
        composers: [layer],
        tags: [],
      }),
    ).toThrow(/decoration/);
  });

  it('rejects empty composers', () => {
    expect(() =>
      defineTheme({
        id: 'bad',
        displayName: 'Bad',
        palette,
        primitives: [circle],
        decorations: [circle],
        composers: [],
        tags: [],
      }),
    ).toThrow(/composer/);
  });
});

describe('ThemeRegistry', () => {
  it('registers and looks up themes by id', () => {
    const r = new ThemeRegistry();
    r.register(t);
    expect(r.get('demo')).toBe(t);
    expect(r.list().map((x) => x.id)).toEqual(['demo']);
  });

  it('throws on duplicate registration', () => {
    const r = new ThemeRegistry();
    r.register(t);
    expect(() => r.register(t)).toThrow(/duplicate/);
  });

  it('throws on unknown lookup', () => {
    const r = new ThemeRegistry();
    expect(() => r.get('nope')).toThrow(/unknown theme/);
  });
});
