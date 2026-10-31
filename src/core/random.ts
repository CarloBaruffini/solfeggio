/** A source of uniformly distributed numbers in `[0, 1)`, with the same contract as `Math.random`. */
export type Random = () => number;

/** The browser's random source. Use {@link createSeededRandom} in tests. */
export const defaultRandom: Random = () => Math.random();

/**
 * Creates a deterministic random source (mulberry32), so that tests and
 * reproducible exercises get the same sequence for the same seed.
 */
export function createSeededRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Returns a uniformly random integer in `[min, max]` (both inclusive). */
export function randomInt(min: number, max: number, random: Random): number {
  return min + Math.floor(random() * (max - min + 1));
}

/** Returns a uniformly random element of a non-empty list. */
export function pickRandom<T>(items: readonly [T, ...T[]], random: Random): T {
  return items[randomInt(0, items.length - 1, random)] ?? items[0];
}
