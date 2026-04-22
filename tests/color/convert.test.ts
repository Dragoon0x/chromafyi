import { clampOklch, normalizeHue, oklchToHex, oklchToOklab, parseInput } from '@/color/convert';
import { describe, expect, it } from 'vitest';

describe('normalizeHue', () => {
  it('wraps negatives', () => {
    expect(normalizeHue(-10)).toBeCloseTo(350, 5);
  });
  it('wraps > 360', () => {
    expect(normalizeHue(370)).toBeCloseTo(10, 5);
  });
  it('returns within range unchanged', () => {
    expect(normalizeHue(180)).toBe(180);
  });
});

describe('clampOklch', () => {
  it('clamps L', () => {
    expect(clampOklch({ l: -0.1, c: 0.1, h: 0 }).l).toBe(0);
    expect(clampOklch({ l: 1.2, c: 0.1, h: 0 }).l).toBe(1);
  });
  it('clamps C non-negative', () => {
    expect(clampOklch({ l: 0.5, c: -0.1, h: 0 }).c).toBe(0);
  });
  it('normalizes H', () => {
    expect(clampOklch({ l: 0.5, c: 0.1, h: 400 }).h).toBeCloseTo(40, 5);
  });
});

describe('parseInput', () => {
  it('parses hex', () => {
    const o = parseInput('#1e90ff');
    expect(o).not.toBeNull();
    expect(o?.l).toBeGreaterThan(0);
    expect(o?.l).toBeLessThan(1);
  });
  it('parses oklch', () => {
    const o = parseInput('oklch(0.78 0.17 200)');
    expect(o?.l).toBeCloseTo(0.78, 2);
    expect(o?.c).toBeCloseTo(0.17, 2);
    expect(o?.h).toBeCloseTo(200, 1);
  });
  it('parses hsl', () => {
    const o = parseInput('hsl(200 100% 50%)');
    expect(o).not.toBeNull();
  });
  it('parses rgb', () => {
    const o = parseInput('rgb(30 144 255)');
    expect(o).not.toBeNull();
  });
  it('returns null on garbage', () => {
    expect(parseInput('nope')).toBeNull();
    expect(parseInput('')).toBeNull();
  });
});

describe('oklchToHex round trip', () => {
  it('is stable over 50 random sRGB-friendly samples', () => {
    for (let i = 0; i < 50; i++) {
      const l = 0.2 + Math.random() * 0.6;
      const c = Math.random() * 0.1;
      const h = Math.random() * 360;
      const hex = oklchToHex({ l, c, h });
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
      const back = parseInput(hex);
      expect(back).not.toBeNull();
      // Lightness should round-trip within 3% (hex quantization to 256 levels)
      expect(Math.abs((back?.l ?? 0) - l)).toBeLessThan(0.03);
    }
  });
});

describe('oklchToOklab', () => {
  it('at H=0, a > 0 and b ≈ 0', () => {
    const lab = oklchToOklab({ l: 0.5, c: 0.1, h: 0 });
    expect(lab.a).toBeGreaterThan(0);
    expect(Math.abs(lab.b)).toBeLessThan(1e-10);
  });
  it('at H=90, a ≈ 0 and b > 0', () => {
    const lab = oklchToOklab({ l: 0.5, c: 0.1, h: 90 });
    expect(Math.abs(lab.a)).toBeLessThan(1e-10);
    expect(lab.b).toBeGreaterThan(0);
  });
});
