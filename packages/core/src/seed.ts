import seedrandom from 'seedrandom';

export type RNG = () => number;

export function makeRng(seed: string | number): RNG {
  return seedrandom(String(seed));
}

export function pick<T>(rng: RNG, items: readonly T[]): T {
  if (items.length === 0) throw new Error('pick: empty array');
  const i = Math.floor(rng() * items.length);
  return items[i] as T;
}

export function range(rng: RNG, min: number, max: number): number {
  return min + rng() * (max - min);
}

export function intRange(rng: RNG, min: number, max: number): number {
  return Math.floor(min + rng() * (max - min + 1));
}
