import { inGamut, toGamut, widestGamut } from '@/color/gamut';
import { describe, expect, it } from 'vitest';

describe('inGamut', () => {
  it('detects an obviously in-sRGB color', () => {
    expect(inGamut({ l: 0.5, c: 0.05, h: 0 }, 'srgb')).toBe(true);
  });
  it('detects an obviously out-of-sRGB color', () => {
    // Very high chroma at moderate L is typically out of sRGB
    expect(inGamut({ l: 0.6, c: 0.35, h: 140 }, 'srgb')).toBe(false);
  });
  it('P3 is a superset of sRGB', () => {
    const c = { l: 0.5, c: 0.1, h: 90 };
    if (inGamut(c, 'srgb')) {
      expect(inGamut(c, 'p3')).toBe(true);
    }
  });
});

describe('toGamut', () => {
  it('returns the same color when already in gamut', () => {
    const c = { l: 0.5, c: 0.05, h: 0 };
    const mapped = toGamut(c, 'srgb');
    expect(mapped.l).toBeCloseTo(c.l, 3);
    expect(mapped.c).toBeCloseTo(c.c, 3);
  });
  it('reduces chroma for out-of-gamut colors', () => {
    const c = { l: 0.6, c: 0.35, h: 140 };
    const mapped = toGamut(c, 'srgb');
    expect(mapped.c).toBeLessThan(c.c);
    expect(inGamut(mapped, 'srgb')).toBe(true);
  });
});

describe('widestGamut', () => {
  it('labels normal colors as sRGB', () => {
    expect(widestGamut({ l: 0.5, c: 0.05, h: 0 })).toBe('srgb');
  });
});
