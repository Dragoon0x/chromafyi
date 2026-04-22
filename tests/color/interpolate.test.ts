import { mix, sampleGradient, shortestHueDelta } from '@/color/interpolate';
import { describe, expect, it } from 'vitest';

describe('shortestHueDelta', () => {
  it('wraps across 0', () => {
    expect(shortestHueDelta(350, 10)).toBe(20);
  });
  it('wraps the long way correctly', () => {
    expect(shortestHueDelta(10, 350)).toBe(-20);
  });
});

describe('mix', () => {
  it('at t=0 returns a', () => {
    const a = { l: 0.2, c: 0.1, h: 30 };
    const b = { l: 0.8, c: 0.1, h: 200 };
    const m = mix(a, b, 0);
    expect(m.l).toBeCloseTo(a.l, 2);
  });
  it('at t=1 returns b', () => {
    const a = { l: 0.2, c: 0.1, h: 30 };
    const b = { l: 0.8, c: 0.1, h: 200 };
    const m = mix(a, b, 1);
    expect(m.l).toBeCloseTo(b.l, 2);
  });
});

describe('sampleGradient', () => {
  it('produces the correct number of steps', () => {
    const stops = [
      { l: 0.1, c: 0.1, h: 0 },
      { l: 0.9, c: 0.1, h: 180 },
    ];
    expect(sampleGradient(stops, 5).length).toBe(5);
  });
  it('first and last match endpoints', () => {
    const stops = [
      { l: 0.1, c: 0, h: 0 },
      { l: 0.9, c: 0, h: 0 },
    ];
    const out = sampleGradient(stops, 11);
    expect(out[0]?.l).toBeCloseTo(0.1, 2);
    expect(out[10]?.l).toBeCloseTo(0.9, 2);
  });
});
