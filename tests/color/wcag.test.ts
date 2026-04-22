import { parseInput } from '@/color/convert';
import { wcagContrast, wcagLevel } from '@/color/wcag';
import { describe, expect, it } from 'vitest';

const oklch = (css: string) => {
  const c = parseInput(css);
  if (!c) throw new Error(`bad ${css}`);
  return c;
};

describe('wcagContrast', () => {
  it('black on white is 21:1', () => {
    const r = wcagContrast(oklch('#000000'), oklch('#ffffff'));
    expect(r).toBeCloseTo(21, 0);
  });
  it('same color is 1:1', () => {
    const r = wcagContrast(oklch('#808080'), oklch('#808080'));
    expect(r).toBeCloseTo(1, 3);
  });
});

describe('wcagLevel', () => {
  it('AAA at 7+', () => expect(wcagLevel(7)).toBe('AAA'));
  it('AA at 4.5+', () => expect(wcagLevel(4.5)).toBe('AA'));
  it('AA large at 3+', () => expect(wcagLevel(3)).toBe('AA large'));
  it('fail below 3', () => expect(wcagLevel(2.9)).toBe('fail'));
});
