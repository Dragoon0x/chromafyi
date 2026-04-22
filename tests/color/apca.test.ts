import { apcaContrast, apcaVerdict } from '@/color/apca';
import { parseInput } from '@/color/convert';
import { describe, expect, it } from 'vitest';

// APCA reference values (from Myndex examples). Allow ±1 tolerance.
function oklch(css: string) {
  const c = parseInput(css);
  if (!c) throw new Error(`bad ${css}`);
  return c;
}

describe('apcaContrast', () => {
  it('black on white gives ≈ 106 (reverse polarity)', () => {
    const lc = apcaContrast(oklch('#000000'), oklch('#ffffff'));
    expect(lc).toBeGreaterThan(105);
    expect(lc).toBeLessThan(107);
  });
  it('white on black gives ≈ -108 (normal polarity)', () => {
    const lc = apcaContrast(oklch('#ffffff'), oklch('#000000'));
    expect(lc).toBeLessThan(-107);
    expect(lc).toBeGreaterThan(-109);
  });
  it('same color yields 0', () => {
    const lc = apcaContrast(oklch('#808080'), oklch('#808080'));
    expect(lc).toBe(0);
  });
});

describe('apcaVerdict', () => {
  it('passes body text at Lc 90', () => {
    expect(apcaVerdict(90, 'body')).toBe('pass');
  });
  it('warns body text at Lc 65', () => {
    expect(apcaVerdict(65, 'body')).toBe('warn');
  });
  it('fails body text at Lc 20', () => {
    expect(apcaVerdict(20, 'body')).toBe('fail');
  });
});
