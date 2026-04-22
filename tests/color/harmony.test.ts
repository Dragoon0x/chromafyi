import { harmony } from '@/color/harmony';
import { describe, expect, it } from 'vitest';

describe('harmony', () => {
  const base = { l: 0.7, c: 0.1, h: 100 };

  it('complementary shifts by 180', () => {
    const [a, b] = harmony(base, 'complementary');
    expect(a?.h).toBeCloseTo(100, 1);
    expect(b?.h).toBeCloseTo(280, 1);
  });
  it('triadic produces 3 evenly-spaced hues', () => {
    const h = harmony(base, 'triadic');
    expect(h.length).toBe(3);
    expect(h[0]?.h).toBeCloseTo(100, 1);
    expect(h[1]?.h).toBeCloseTo(220, 1);
    expect(h[2]?.h).toBeCloseTo(340, 1);
  });
  it('tetradic produces 4 hues', () => {
    expect(harmony(base, 'tetradic').length).toBe(4);
  });
  it('analogous honors count', () => {
    expect(harmony(base, 'analogous', 7).length).toBe(7);
  });
  it('monochromatic varies L, holds H', () => {
    const mono = harmony(base, 'monochromatic', 5);
    expect(mono.length).toBe(5);
    for (const c of mono) expect(c.h).toBeCloseTo(100, 1);
  });
});
