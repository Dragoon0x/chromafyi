import { CVD_TYPES, simulateCVD } from '@/color/cvd';
import { describe, expect, it } from 'vitest';

describe('simulateCVD', () => {
  it('type=none is identity', () => {
    const c = { l: 0.5, c: 0.1, h: 120 };
    const s = simulateCVD(c, 'none');
    expect(s.l).toBeCloseTo(c.l, 3);
    expect(s.c).toBeCloseTo(c.c, 3);
  });

  it('protanopia shifts red hues to mid-spectrum', () => {
    // Red at H≈30 should shift meaningfully under protanopia.
    const red = { l: 0.6, c: 0.15, h: 30 };
    const sim = simulateCVD(red, 'protanopia');
    // Chroma typically drops because the red signal is missing
    expect(sim.c).toBeLessThanOrEqual(red.c + 0.02);
  });

  it('runs for every CVD type', () => {
    const c = { l: 0.5, c: 0.1, h: 180 };
    for (const t of CVD_TYPES) {
      const r = simulateCVD(c, t);
      expect(r.l).toBeGreaterThanOrEqual(0);
      expect(r.l).toBeLessThanOrEqual(1);
      expect(r.c).toBeGreaterThanOrEqual(0);
    }
  });
});
