import type { Palette } from './palette';
import type { PrimitiveFn } from './primitives/types';
import type { ComposerFn } from './composers/types';

export interface Theme {
  readonly id: string;
  readonly displayName: string;
  readonly palette: Palette;
  readonly primitives: readonly PrimitiveFn[];
  readonly decorations: readonly PrimitiveFn[];
  readonly composers: readonly ComposerFn[];
  readonly tags: readonly string[];
}

export function defineTheme(t: {
  id: string;
  displayName: string;
  palette: Palette;
  primitives: PrimitiveFn[];
  decorations: PrimitiveFn[];
  composers: ComposerFn[];
  tags: string[];
}): Theme {
  if (t.primitives.length === 0) throw new Error(`theme ${t.id}: primitives empty`);
  if (t.decorations.length === 0) throw new Error(`theme ${t.id}: decorations empty`);
  if (t.composers.length === 0) throw new Error(`theme ${t.id}: composers empty`);
  return Object.freeze({
    id: t.id,
    displayName: t.displayName,
    palette: t.palette,
    primitives: Object.freeze([...t.primitives]),
    decorations: Object.freeze([...t.decorations]),
    composers: Object.freeze([...t.composers]),
    tags: Object.freeze([...t.tags]),
  });
}

export class ThemeRegistry {
  private readonly themes = new Map<string, Theme>();

  register(theme: Theme): void {
    if (this.themes.has(theme.id)) throw new Error(`duplicate theme: ${theme.id}`);
    this.themes.set(theme.id, theme);
  }

  get(id: string): Theme {
    const t = this.themes.get(id);
    if (!t) throw new Error(`unknown theme: ${id}`);
    return t;
  }

  list(): Theme[] {
    return [...this.themes.values()];
  }
}
