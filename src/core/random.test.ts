import { describe, expect, it } from 'vitest';

import { createSeededRandom, pickRandom, randomInt } from './random';

describe('createSeededRandom', () => {
  it('returns the same sequence for the same seed', () => {
    const a = createSeededRandom(42);
    const b = createSeededRandom(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('returns numbers in [0, 1)', () => {
    const random = createSeededRandom(7);
    for (let i = 0; i < 1000; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('randomInt', () => {
  it('covers the whole inclusive range', () => {
    const random = createSeededRandom(1);
    const seen = new Set(Array.from({ length: 500 }, () => randomInt(3, 6, random)));
    expect([...seen].sort()).toEqual([3, 4, 5, 6]);
  });
});

describe('pickRandom', () => {
  it('only returns elements of the list', () => {
    const random = createSeededRandom(3);
    for (let i = 0; i < 100; i++) {
      expect(['a', 'b']).toContain(pickRandom(['a', 'b'], random));
    }
  });
});
