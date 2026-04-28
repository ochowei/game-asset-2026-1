import type { RNG } from './seed';
import { pick } from './seed';

export type ColorRole = 'primary' | 'secondary' | 'accent' | 'neutral';

export interface Palette {
  readonly id: string;
  readonly primary: readonly string[];
  readonly secondary: readonly string[];
  readonly accent: readonly string[];
  readonly neutral: readonly string[];
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function definePalette(p: {
  id: string;
  primary: string[];
  secondary: string[];
  accent: string[];
  neutral: string[];
}): Palette {
  for (const role of ['primary', 'secondary', 'accent', 'neutral'] as const) {
    const arr = p[role];
    if (arr.length === 0) throw new Error(`palette ${p.id}: ${role} is empty`);
    for (const c of arr) {
      if (!HEX_RE.test(c)) throw new Error(`palette ${p.id}: invalid hex "${c}"`);
    }
  }
  return Object.freeze({
    id: p.id,
    primary: Object.freeze([...p.primary]),
    secondary: Object.freeze([...p.secondary]),
    accent: Object.freeze([...p.accent]),
    neutral: Object.freeze([...p.neutral]),
  });
}

export function pickColor(rng: RNG, palette: Palette, role: ColorRole): string {
  return pick(rng, palette[role]);
}
