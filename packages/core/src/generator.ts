import { makeRng, pick } from './seed';
import { svgDocument } from './svg-emitter';
import type { Theme } from './theme';

export interface GenerateOneOptions {
  theme: Theme;
  seed: string;
  size: number;
}

export interface GenerateManyOptions {
  theme: Theme;
  baseSeed: string;
  count: number;
  size: number;
}

export interface GeneratedIcon {
  seed: string;
  svg: string;
}

export function generateOne({ theme, seed, size }: GenerateOneOptions): string {
  const rng = makeRng(`${theme.id}:${seed}`);
  const composer = pick(rng, theme.composers);
  const body = composer({ rng, palette: theme.palette, size, primitives: theme.primitives });
  return svgDocument({ size, body });
}

export function generateMany({ theme, baseSeed, count, size }: GenerateManyOptions): GeneratedIcon[] {
  const out: GeneratedIcon[] = [];
  for (let i = 0; i < count; i++) {
    const seed = `${baseSeed}-${i.toString().padStart(4, '0')}`;
    out.push({ seed, svg: generateOne({ theme, seed, size }) });
  }
  return out;
}
